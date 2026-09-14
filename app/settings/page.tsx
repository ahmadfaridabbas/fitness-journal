"use client";
import { useState } from "react";
import Link from "next/link";
import { Download, Upload, RotateCcw } from "lucide-react";
import { useFitness } from "@/components/fitness/provider";
import { useTheme } from "@/components/layout/theme-provider";
import { PageHeader, Panel, download } from "@/components/fitness/ui";
import { Button } from "@/components/ui/button";
import { seedWorkouts } from "@/lib/fitness";
import { validateBackup } from "@/lib/backup";
export default function SettingsPage() {
  const { data, workouts, update, restoreWorkout, restoreData, error } =
    useFitness();
  const { theme, toggleTheme } = useTheme();
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState<ReturnType<
    typeof validateBackup
  > | null>(null);
  return (
    <div className="fitness-page">
      <PageHeader
        title="Your workspace, your way"
        description="Manage your profile, appearance, and fitness data."
        eyebrow="WORKSPACE / SETTINGS"
      />
      {message && (
        <p className="success-message" role="status">
          {message}
        </p>
      )}
      <div className="two-columns">
        <Panel
          title="Personal profile"
          subtitle="Used to personalize your workspace"
        >
          <form
            className="fitness-form"
            onSubmit={(e) => {
              e.preventDefault();
              const name = String(
                new FormData(e.currentTarget).get("name"),
              ).trim();
              if (name && update({ name })) setMessage("Profile updated.");
            }}
          >
            <label>
              Your name
              <input
                name="name"
                required
                maxLength={80}
                key={data.name}
                defaultValue={data.name}
              />
            </label>
            <div className="form-actions">
              <Button type="submit">Save profile</Button>
            </div>
          </form>
        </Panel>
        <Panel title="Appearance" subtitle="A comfortable view, day or night">
          <div className="flex items-center justify-between gap-4 py-8">
            <p className="text-sm">
              Current theme: <strong>{theme}</strong>
            </p>
            <Button variant="outline" onClick={toggleTheme}>
              Switch to {theme === "light" ? "dark" : "light"}
            </Button>
          </div>
        </Panel>
      </div>
      <Panel
        title="Your data belongs to you"
        subtitle="New entries and edits are saved in this browser on this device."
      >
        <p className="text-sm muted leading-relaxed">
          Your original Apple Health history is included with the app. New
          workouts, measurements, goals, and edits stay on this device; they do
          not sync to other browsers. Export a backup before clearing browser
          data. Upload an Apple Health export to add more workouts.
        </p>
        <div className="form-actions">
          <Button
            variant="outline"
            onClick={() => {
              if (error) {
                download(
                  "fitjournal-recovery.json",
                  localStorage.getItem("fitjournal-data-v1") || "{}",
                );
                setMessage("Original stored data downloaded for recovery.");
                return;
              }
              download(
                "fitjournal-backup.json",
                JSON.stringify(
                  {
                    ...data,
                    exportedAt: new Date().toISOString(),
                    allWorkouts: workouts,
                  },
                  null,
                  2,
                ),
              );
              setMessage("Backup download started. Keep it somewhere safe.");
            }}
          >
            <Download size={16} />
            Export full backup
          </Button>
          <Button asChild>
            <Link href="/import">
              <Upload size={16} />
              Import activities
            </Link>
          </Button>
        </div>
        <p className="data-note mt-4">
          Backups include your GPS routes when available. The JSON backup
          preserves all local edits and can be restored below.
        </p>
        <label className="block text-sm mt-5">
          Restore a FitJournal backup
          <input
            className="block mt-2 max-w-full"
            type="file"
            accept=".json,application/json"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              try {
                const raw = JSON.parse(await file.text());
                setPending(validateBackup(raw));
              } catch {
                setMessage(
                  "Could not restore this file. Choose a valid FitJournal backup; existing data is unchanged.",
                );
              }
              e.target.value = "";
            }}
          />
        </label>
        {pending && (
          <div
            className="delete-confirm"
            role="region"
            aria-label="Review backup restore"
          >
            <p>
              This backup contains {pending.workouts.length} local workouts or
              edits, {pending.weights.length} weight entries, and{" "}
              {pending.goals.length} goals. Restore it to replace your current
              local records?
            </p>
            <Button
              onClick={() => {
                download(
                  "fitjournal-before-restore.json",
                  localStorage.getItem("fitjournal-data-v1") ||
                    JSON.stringify({ ...data, allWorkouts: workouts }, null, 2),
                );
                if (restoreData(pending)) {
                  setPending(null);
                  setMessage(
                    "Backup restored. Your previous data was downloaded as a safety copy.",
                  );
                }
              }}
            >
              Restore this backup
            </Button>
            <Button variant="ghost" onClick={() => setPending(null)}>
              Cancel restore
            </Button>
          </div>
        )}
        <p className="data-note mt-2">
          Restoring replaces local edits, goals, and measurements with the
          backup. Export your current data first.
        </p>
      </Panel>
      {data.deleted.length > 0 && (
        <Panel
          title="Recently removed workouts"
          subtitle="Restore workouts to bring them back into all your totals."
        >
          {data.deleted.map((id) => {
            const run =
              data.workouts.find((r) => r.id === id) ||
              seedWorkouts.find((r) => r.id === id);
            return (
              <div
                className="flex justify-between items-center gap-3 border-b py-3"
                key={id}
              >
                <span className="text-sm">
                  {run?.route || "Workout"} · {run?.date}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (restoreWorkout(id)) setMessage("Workout restored.");
                  }}
                >
                  <RotateCcw size={14} />
                  Restore
                </Button>
              </div>
            );
          })}
        </Panel>
      )}
    </div>
  );
}
