import { validDate, workoutError, Workout, WeightEntry, Goal } from "./fitness";
export function validateBackup(value: unknown) {
  if (!value || typeof value !== "object") throw new Error("Invalid backup");
  const d = value as {
    version: number;
    name: string;
    workouts: Workout[];
    weights: WeightEntry[];
    goals: Goal[];
    deleted: string[];
  };
  if (
    d.version !== 1 ||
    typeof d.name !== "string" ||
    !d.name.trim() ||
    !Array.isArray(d.workouts) ||
    !Array.isArray(d.weights) ||
    !Array.isArray(d.goals) ||
    !Array.isArray(d.deleted)
  )
    throw new Error("Invalid backup");
  for (const r of d.workouts) {
    if (
      !r ||
      typeof r.id !== "string" ||
      typeof r.route !== "string" ||
      typeof r.workoutType !== "string" ||
      workoutError(r)
    )
      throw new Error("Invalid workout");
    if (
      (r.notes !== null && typeof r.notes !== "string") ||
      typeof r.indoor !== "boolean" ||
      (r.startTime !== undefined && typeof r.startTime !== "string")
    )
      throw new Error("Invalid workout details");
    if (
      r.routeData !== null &&
      (!r.routeData ||
        !Array.isArray(r.routeData.coordinates) ||
        r.routeData.coordinates.some(
          (c) => !Array.isArray(c) || c.length < 2 || !c.every(Number.isFinite),
        ))
    )
      throw new Error("Invalid route");
    if (
      r.weather !== null &&
      (!r.weather ||
        typeof r.weather !== "object" ||
        [r.weather.temperature, r.weather.humidity].some(
          (v) => v !== null && !Number.isFinite(v),
        ))
    )
      throw new Error("Invalid weather");
  }
  for (const records of [d.workouts, d.weights, d.goals])
    if (new Set(records.map((r) => r?.id)).size !== records.length)
      throw new Error("Duplicate record IDs");
  for (const w of d.weights)
    if (
      !w ||
      typeof w.id !== "string" ||
      !validDate(w.date) ||
      typeof w.notes !== "string" ||
      !Number.isFinite(w.weight) ||
      w.weight < 1 ||
      w.weight > 700
    )
      throw new Error("Invalid weight");
  for (const g of d.goals)
    if (
      !g ||
      typeof g.id !== "string" ||
      typeof g.title !== "string" ||
      !Number.isFinite(g.target) ||
      g.target <= 0 ||
      !["distance", "workouts"].includes(g.category) ||
      !["all", "week", "month"].includes(g.period)
    )
      throw new Error("Invalid goal");
  if (d.deleted.some((id) => typeof id !== "string"))
    throw new Error("Invalid deleted IDs");
  return {
    version: 1 as const,
    name: d.name,
    workouts: d.workouts.map((r) => ({ ...r, pace: r.duration / r.distance })),
    weights: d.weights,
    goals: d.goals,
    deleted: d.deleted,
  };
}
