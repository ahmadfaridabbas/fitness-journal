import type { ImportedHealthRun, ImportProgress } from "./import-files";
export function importInBrowser(
  file: File,
  routes: File[],
  onProgress: (progress: ImportProgress) => void,
  signal: AbortSignal,
): Promise<ImportedHealthRun[]> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException("Import cancelled.", "AbortError"));
      return;
    }
    const worker = new Worker(new URL("./import.worker.ts", import.meta.url), {
      type: "module",
    });
    const cleanup = () => {
      worker.terminate();
      signal.removeEventListener("abort", cancel);
    };
    const cancel = () => {
      cleanup();
      reject(
        new DOMException(
          "Import cancelled. No workouts were saved.",
          "AbortError",
        ),
      );
    };
    signal.addEventListener("abort", cancel, { once: true });
    worker.onmessage = (
      event: MessageEvent<{
        type: string;
        progress: ImportProgress;
        runs: ImportedHealthRun[];
        message: string;
      }>,
    ) => {
      if (event.data.type === "progress") onProgress(event.data.progress);
      else if (event.data.type === "complete") {
        cleanup();
        resolve(event.data.runs);
      } else if (event.data.type === "error") {
        cleanup();
        reject(new Error(event.data.message));
      }
    };
    worker.onerror = () => {
      cleanup();
      reject(
        new Error(
          "The background importer stopped. Please reload the page and try again. Your existing workouts are unchanged.",
        ),
      );
    };
    worker.onmessageerror = () => {
      cleanup();
      reject(
        new Error("Could not read the imported workouts. Please try again."),
      );
    };
    try {
      worker.postMessage({ file, routes });
    } catch (error) {
      cleanup();
      reject(error);
    }
  });
}
