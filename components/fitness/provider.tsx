"use client";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
} from "react";
import {
  seedWorkouts,
  Workout,
  WeightEntry,
  Goal,
  mergeImportedWorkouts,
} from "@/lib/fitness";
import { validateBackup } from "@/lib/backup";
const KEY = "fitjournal-data-v1";
type Saved = {
  version: 1;
  workouts: Workout[];
  deleted: string[];
  weights: WeightEntry[];
  goals: Goal[];
  name: string;
};
const initial: Saved = {
  version: 1,
  workouts: [],
  deleted: [],
  weights: [],
  goals: [],
  name: "Ahmad Farid Abbas",
};
type Context = {
  workouts: Workout[];
  data: Saved;
  ready: boolean;
  error: string;
  saveWorkout: (r: Workout) => boolean;
  deleteWorkout: (id: string) => boolean;
  restoreWorkout: (id: string) => boolean;
  update: (patch: Partial<Saved>) => boolean;
  restoreData: (backup: Saved) => boolean;
  importWorkouts: (rows: Workout[]) => boolean;
};
const FitnessContext = createContext<Context | null>(null);
function parseSaved(raw: string): Saved {
  return validateBackup(JSON.parse(raw));
}
export function FitnessProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<Saved>(initial),
    [ready, setReady] = useState(false),
    [error, setError] = useState("");
  useEffect(() => {
    function read() {
      try {
        const raw = localStorage.getItem(KEY);
        setData(raw ? parseSaved(raw) : initial);
        setError("");
      } catch {
        setError(
          "Saved data could not be read. Your original data has been left untouched. Export or recover it before making changes.",
        );
      }
      setReady(true);
    }
    read();
    window.addEventListener("storage", read);
    return () => window.removeEventListener("storage", read);
  }, []);
  function update(patch: Partial<Saved>) {
    if (!ready) return false;
    try {
      const raw = localStorage.getItem(KEY);
      const current = raw ? parseSaved(raw) : initial;
      const next = validateBackup({
        ...current,
        ...patch,
        version: 1 as const,
      });
      localStorage.setItem(KEY, JSON.stringify(next));
      setData(next);
      setError("");
      return true;
    } catch {
      setError(
        "Could not save. Browser storage may be full, unavailable, or contain damaged data. Your changes have not been saved.",
      );
      return false;
    }
  }
  function restoreData(backup: Saved) {
    try {
      const next = validateBackup(backup);
      localStorage.setItem(KEY, JSON.stringify(next));
      setData(next);
      setError("");
      return true;
    } catch {
      setError(
        "The backup could not be saved. Your current stored data was not replaced.",
      );
      return false;
    }
  }
  const merged = useMemo(() => {
    const map = new Map(seedWorkouts.map((r) => [r.id, r]));
    data.workouts.forEach((r) => map.set(r.id, r));
    return map;
  }, [data.workouts]);
  const workouts = useMemo(
    () =>
      [...merged.values()]
        .filter((r) => !data.deleted.includes(r.id))
        .sort(
          (a, b) =>
            b.date.localeCompare(a.date) ||
            (b.startTime || "").localeCompare(a.startTime || ""),
        ),
    [merged, data.deleted],
  );
  const saveWorkout = (r: Workout) =>
    update({
      workouts: [...data.workouts.filter((x) => x.id !== r.id), r],
      deleted: data.deleted.filter((id) => id !== r.id),
    });
  function importWorkouts(rows: Workout[]) {
    return update({ workouts: mergeImportedWorkouts(data.workouts, rows) });
  }

  return (
    <FitnessContext.Provider
      value={{
        workouts,
        data,
        ready,
        error,
        update,
        restoreData,
        saveWorkout,
        importWorkouts,
        deleteWorkout: (id) => update({ deleted: [...data.deleted, id] }),
        restoreWorkout: (id) =>
          update({ deleted: data.deleted.filter((x) => x !== id) }),
      }}
    >
      {error && (
        <div role="alert" className="storage-error">
          {error}
        </div>
      )}
      {children}
    </FitnessContext.Provider>
  );
}
export function useFitness() {
  const ctx = useContext(FitnessContext);
  if (!ctx) throw new Error("FitnessProvider missing");
  return ctx;
}
