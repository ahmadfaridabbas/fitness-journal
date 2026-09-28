"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Upload, CheckCircle2, FileUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFitness } from "@/components/fitness/provider";
import { PageHeader, Panel } from "@/components/fitness/ui";
import { normalizeImportedRun } from "@/lib/data/real-runs";
import { selectHealthExport } from "@/lib/apple-health/select-files";
import { importInBrowser } from "@/lib/apple-health/import-browser";
import type { ImportProgress } from "@/lib/apple-health/import-files";
export default function ImportPage() {
  const operation = useRef<AbortController | null>(null);
  const [progress, setProgress] = useState<ImportProgress>({
    percent: 0,
    message: "",
  });
  useEffect(() => () => operation.current?.abort(), []);
  const { importWorkouts } = useFitness();
  const [xml, setXml] = useState<File | null>(null),
    [gpx, setGpx] = useState<File[]>([]),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [done, setDone] = useState<number | null>(null);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!xml || operation.current) return;
    setBusy(true);
    setError("");
    setDone(null);
    try {
      const controller = new AbortController();
      operation.current = controller;
      const runs = await importInBrowser(
        xml,
        gpx,
        setProgress,
        controller.signal,
      );
      const rows = runs.map(
        (r: Parameters<typeof normalizeImportedRun>[0], i: number) =>
          normalizeImportedRun(r, `health_${r.startTime}_${i}`),
      );
      if (!importWorkouts(rows))
        throw new Error(
          "Could not save imported workouts. Your existing data is unchanged. Try fewer workouts or free browser storage after exporting a backup.",
        );
      setDone(rows.length);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Import failed. Please try again.",
      );
    } finally {
      operation.current = null;
      setBusy(false);
    }
  }
  return (
    <div className="fitness-page">
      <PageHeader
        title="Bring your history along"
        description="Turn your Apple Health workouts into a journal of progress."
        eyebrow="WORKSPACE / IMPORT"
      />
      <div className="two-columns">
        <Panel
          title="Import Apple Health"
          subtitle="Your existing records and edits are preserved"
        >
          <form className="fitness-form" onSubmit={submit}>
            <div
              className="empty-state"
              style={{
                minHeight: 120,
                background: "var(--color-muted)",
                borderRadius: 10,
              }}
            >
              <FileUp size={30} />
              <h3>Your next chapter includes your history</h3>
              <p>
                Select export.zip directly, choose an extracted folder, or select XML and GPS files individually.
              </p>
            </div>
            <label>
              Extracted Apple Health folder (optional)
              <input
                type="file"
                {...{ webkitdirectory: "", directory: "" }}
                multiple
                disabled={busy}
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  if (!files.length) return;
                  setDone(null);
                  setError("");
                  try {
                    const selected = selectHealthExport(files);
                    setXml(selected.xml);
                    setGpx(selected.routes);
                  } catch (error) {
                    setXml(null);
                    setGpx([]);
                    setError(error instanceof Error ? error.message : "Could not read this folder.");
                  }
                }}
              />
            </label>
            <label>
              Apple Health export (.zip or .xml)
              <input
                type="file"
                accept=".zip,.xml"
                disabled={busy}
                onChange={(e) => {
                  setXml(e.target.files?.[0] || null);
                  setDone(null);
                  setError("");
                }}
              />
            </label>
            <label>
              GPS routes (.gpx, optional for XML; included automatically with ZIP)
              <input
                type="file"
                accept=".gpx"
                multiple
                disabled={busy}
                onChange={(e) => setGpx(Array.from(e.target.files || []))}
              />
            </label>
            {xml && (
              <p className="text-sm muted">
                {xml.name} selected ({(xml.size / 1024 / 1024).toFixed(1)} MB)
              </p>
            )}
            {gpx.length > 0 && (
              <p className="text-sm muted">{gpx.length} route files selected</p>
            )}
            {busy && (
              <div role="status" aria-live="polite">
                <p className="text-sm muted">
                  {progress.message} {progress.percent}%
                </p>
                <progress
                  aria-label="Import progress"
                  value={progress.percent}
                  max={100}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => operation.current?.abort()}
                >
                  Cancel import
                </Button>
              </div>
            )}
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            {done !== null && (
              <div role="status" className="success-message">
                <CheckCircle2 size={18} />
                <p>
                  {done} valid activities processed. Duplicates were skipped.
                </p>
                <Link className="text-link mt-2" href="/journal">
                  View your journal →
                </Link>
              </div>
            )}
            <Button type="submit" disabled={busy || !xml}>
              <Upload size={16} />
              {busy ? "Processing your export…" : "Import workouts"}
            </Button>
          </form>
        </Panel>
        <Panel
          title="A few simple steps"
          subtitle="Export your data from the Health app"
        >
          <ol className="space-y-5 text-sm leading-relaxed list-decimal pl-5">
            <li>Open Health on your iPhone and tap your profile picture.</li>
            <li>
              Choose “Export All Health Data” and save the ZIP to your computer.
            </li>
            <li>
              Select <strong>export.zip</strong> directly. The workouts and GPS routes inside are read automatically.
            </li>
            <li>
              Alternatively, extract the ZIP and choose the apple_health_export folder, or select export.xml and GPX files individually. Do not select export_cda.xml.
            </li>
          </ol>
          <div className="mt-8 p-4 rounded-lg bg-muted text-xs leading-relaxed muted">
            Your files are processed on this device in the background, without
            uploading them. ZIP archives are opened locally and large XML exports are read in chunks. Workouts are
            saved in this browser after processing finishes. No source files are
            overwritten.
          </div>
        </Panel>
      </div>
    </div>
  );
}
