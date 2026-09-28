import { parseHealthFiles } from "./import-files";
import { parseHealthArchive } from "./import-archive";
self.onmessage = async (
  event: MessageEvent<{ file: File; routes: File[] }>,
) => {
  try {
    const progress = (progress: import("./import-files").ImportProgress) => self.postMessage({ type: "progress", progress });
    const runs = event.data.file.name.toLowerCase().endsWith(".zip")
      ? await parseHealthArchive(event.data.file, progress)
      : await parseHealthFiles(
      event.data.file,
      event.data.routes,
      progress,
    );
    self.postMessage({ type: "complete", runs });
  } catch (error) {
    self.postMessage({
      type: "error",
      message:
        error instanceof Error
          ? error.message
          : "Could not read the health export. Please try a fresh export.xml.",
    });
  }
};
