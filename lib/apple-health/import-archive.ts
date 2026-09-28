import { BlobReader, ZipReader, TextWriter } from "@zip.js/zip.js";
import {
  parseHealthFiles,
  simplifyGpxToRoute,
  type ImportProgress,
  type RouteMap,
} from "./import-files";

/** Runs inside the import worker; the large XML is decompressed as a stream. */
export async function parseHealthArchive(
  file: File,
  onProgress?: (progress: ImportProgress) => void,
) {
  const abort = new AbortController();
  const reader = new ZipReader(new BlobReader(file), {
    useWebWorkers: false,
    checkSignature: true,
  });
  try {
    onProgress?.({ percent: 0, message: "Opening your ZIP archive…" });
    const entries = (await reader.getEntries()).filter(
      (entry) => !entry.directory && !entry.filename.startsWith("__MACOSX/"),
    );
    const exports = entries.filter(
      (entry) => entry.filename.split("/").pop()?.toLowerCase() === "export.xml",
    );
    if (exports.length !== 1)
      throw new Error(exports.length
        ? "This ZIP contains multiple health exports. Choose an archive with one export.xml."
        : "No export.xml found in this ZIP. Choose an Apple Health export archive.");
    const xml = exports[0];
    if (xml.directory) throw new Error("The export.xml entry is not a file.");
    const folder = xml.filename.slice(0, -"export.xml".length);
    const routeEntries = entries.filter((entry) =>
      entry.filename.startsWith(`${folder}workout-routes/`) &&
      entry.filename.toLowerCase().endsWith(".gpx"),
    );
    const routes: RouteMap = new Map();
    for (const [i, entry] of routeEntries.entries()) {
      if (entry.directory) continue;
      // Decompress one route, simplify it to <=200 points, then drop the raw
      // text before moving on. This keeps only the compact route records in
      // memory instead of every GPX file's full contents at once.
      const text = await entry.getData(new TextWriter(), { signal: abort.signal });
      const route = simplifyGpxToRoute(entry.filename.split("/").pop()!, text);
      if (route) routes.set(route[0], route[1]);
      onProgress?.({ percent: Math.round(((i + 1) / routeEntries.length) * 10), message: "Reading GPS routes from ZIP…" });
    }
    let streamController: TransformStreamDefaultController<Uint8Array>;
    const stream = new TransformStream<Uint8Array, Uint8Array>({
      start(controller) { streamController = controller; },
    });
    const extraction = xml.getData(stream.writable, { signal: abort.signal }).catch((error) => {
      streamController.error(error);
      throw error;
    });
    const parsing = parseHealthFiles({
      name: "export.xml",
      size: xml.uncompressedSize,
      stream: () => stream.readable,
    }, routes, (progress) => onProgress?.({
      ...progress,
      percent: 10 + Math.floor(progress.percent * 0.9),
    }));
    const [runs] = await Promise.all([parsing, extraction]);
    return runs;
  } catch (error) {
    abort.abort();
    throw new Error(`Could not import ZIP: ${error instanceof Error ? error.message : "Invalid or damaged archive."}`);
  } finally {
    await reader.close();
  }
}
