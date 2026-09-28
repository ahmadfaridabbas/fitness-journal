/** Select the workout export, ignoring CDA documents and unrelated health files. */
export function selectHealthExport(files: File[]) {
  const exports = files.filter((file) => file.name.toLowerCase() === "export.xml");
  if (exports.length !== 1)
    throw new Error(
      exports.length > 1
        ? "This folder contains multiple exports. Choose one apple_health_export folder."
        : "No export.xml found. Extract export.zip and choose the apple_health_export folder.",
    );
  return {
    xml: exports[0],
    routes: files.filter((file) => file.name.toLowerCase().endsWith(".gpx")),
  };
}
