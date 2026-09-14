"use client";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useFitness } from "./provider";
import { Workout, dayKey, workoutError } from "@/lib/fitness";
import { formatPace } from "@/lib/utils";
export function WorkoutEditor({
  run,
  onClose,
  onSaved,
}: {
  run?: Workout;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { saveWorkout } = useFitness();
  const [error, setError] = useState("");
  const [distance, setDistance] = useState(run?.distance.toString() || "");
  const [duration, setDuration] = useState(run?.duration.toString() || "");
  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const date = String(f.get("date"));
    const calories = f.get("calories") ? Number(f.get("calories")) : null;
    const problem = workoutError({
      date,
      distance: Number(distance),
      duration: Number(duration),
      calories,
    });
    if (problem) {
      setError(problem);
      return;
    }
    const hr = f.get("hr") ? Number(f.get("hr")) : null;
    if (hr !== null && (!Number.isFinite(hr) || hr < 20 || hr > 250)) {
      setError("Heart rate must be between 20 and 250 bpm.");
      return;
    }
    const record: Workout = {
      id: run?.id || crypto.randomUUID(),
      date,
      distance: Number(distance),
      duration: Number(duration),
      pace: Number(duration) / Number(distance),
      workoutType: String(f.get("type")),
      route: String(f.get("title")).trim() || `${f.get("type")} workout`,
      notes: String(f.get("notes")).trim() || null,
      calories,
      indoor: f.get("indoor") === "on",
      avgHeartRate: hr,
      maxHeartRate: null,
      cadence: null,
      power: null,
      elevation: null,
      effort: null,
      routeData: null,
      moodBefore: null,
      moodAfter: null,
      aiAnalysis: null,
      coachScore: null,
      recoveryScore: null,
      trainingLoad: "unrated",
      shoeId: null,
      weather: null,
    };
    if (
      saveWorkout({
        ...run,
        ...record,
        startTime: run?.date === date ? run.startTime : undefined,
        maxHeartRate: run?.maxHeartRate ?? null,
        cadence: run?.cadence ?? null,
        power: run?.power ?? null,
        elevation: run?.elevation ?? null,
        effort: run?.effort ?? null,
        routeData: run?.routeData ?? null,
        weather: run?.weather ?? null,
        shoeId: run?.shoeId ?? null,
      })
    ) {
      onSaved();
      onClose();
    } else
      setError(
        "Your workout was not saved. Check the storage message and try again.",
      );
  }
  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="editor-sheet">
        <SheetHeader>
          <SheetTitle>{run ? "Edit workout" : "Log a workout"}</SheetTitle>
          <SheetDescription>
            A little effort, worth remembering. Distances in km; duration in
            minutes.
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={submit} className="fitness-form">
          <label>
            Workout name
            <input
              name="title"
              maxLength={100}
              placeholder="e.g. Morning park loop"
              defaultValue={run?.route}
            />
          </label>
          <div className="form-grid">
            <label>
              Activity
              <select name="type" defaultValue={run?.workoutType || "Running"}>
                <option>Running</option>
                <option>Walking</option>
                <option>Hiking</option>
                <option>Cycling</option>
              </select>
            </label>
            <label>
              Date
              <input
                name="date"
                type="date"
                required
                max={dayKey()}
                defaultValue={run?.date || dayKey()}
              />
            </label>
          </div>
          <div className="form-grid">
            <label>
              Distance (km)
              <input
                type="number"
                required
                min="0.01"
                max="1000"
                step="any"
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
              />
            </label>
            <label>
              Duration (minutes)
              <input
                type="number"
                required
                min="0.01"
                max="10080"
                step="any"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </label>
          </div>
          <div className="pace-preview">
            <span>Calculated pace</span>
            <strong>
              {formatPace(Number(duration) / Number(distance))}{" "}
              <small>min/km</small>
            </strong>
          </div>
          <div className="form-grid">
            <label>
              Calories (kcal, optional)
              <input
                name="calories"
                type="number"
                min="0"
                step="1"
                defaultValue={run?.calories ?? ""}
              />
            </label>
            <label>
              Average HR (bpm, optional)
              <input
                name="hr"
                type="number"
                min="20"
                max="250"
                step="1"
                defaultValue={run?.avgHeartRate ?? ""}
              />
            </label>
          </div>
          <label className="checkbox-label">
            <input name="indoor" type="checkbox" defaultChecked={run?.indoor} />{" "}
            Indoor workout
          </label>
          <label>
            Notes
            <textarea
              name="notes"
              rows={4}
              maxLength={2000}
              placeholder="How did it feel?"
              defaultValue={run?.notes || ""}
            />
          </label>
          {error && (
            <p role="alert" className="form-error">
              {error}
            </p>
          )}
          <p className="muted text-sm">
            Saved on this device. Your imported source records stay intact.
          </p>
          <div className="form-actions">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save workout</Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
