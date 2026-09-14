"use client";
import { useState } from "react";
import Link from "next/link";
import { Upload, CheckCircle2, FileUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFitness } from "@/components/fitness/provider";
import { PageHeader, Panel } from "@/components/fitness/ui";
import { normalizeImportedRun } from "@/lib/data/real-runs";
export default function ImportPage() {
  const { importWorkouts } = useFitness();
  const [xml, setXml] = useState<File | null>(null),
    [gpx, setGpx] = useState<File[]>([]),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [done, setDone] = useState<number | null>(null);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!xml) return;
    setBusy(true);
    setError("");
    setDone(null);
    try {
      const f = new FormData();
      f.append("exportFile", xml);
      gpx.forEach((file) => f.append("gpxFiles", file));
      const res = await fetch("/api/import/sync", { method: "POST", body: f });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Import failed.");
      const rows = result.runs.map(
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
                Select the extracted XML export and optional GPS route files.
              </p>
            </div>
            <label>
              Apple Health export (.xml)
              <input
                type="file"
                accept=".xml"
                required
                onChange={(e) => {
                  setXml(e.target.files?.[0] || null);
                  setDone(null);
                }}
              />
            </label>
            <label>
              GPS routes (.gpx, optional)
              <input
                type="file"
                accept=".gpx"
                multiple
                onChange={(e) => setGpx(Array.from(e.target.files || []))}
              />
            </label>
            {gpx.length > 0 && (
              <p className="text-sm muted">{gpx.length} route files selected</p>
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
              Extract the ZIP and choose <strong>export.xml</strong> here.
            </li>
            <li>
              Optionally select the GPX files from the workout-routes folder.
            </li>
          </ol>
          <div className="mt-8 p-4 rounded-lg bg-muted text-xs leading-relaxed muted">
            The selected files are sent to this app’s server for parsing.
            Workouts are then saved in this browser. Large exports may exceed
            your hosting provider’s upload or execution limits. No source files
            are overwritten.
          </div>
        </Panel>
      </div>
    </div>
  );
}
