import { realRuns } from "@/lib/data/real-runs";
export type Workout = Omit<
  (typeof realRuns)[number],
  "notes" | "route" | "calories" | "startTime"
> & {
  notes: string | null;
  route: string;
  calories: number | null;
  workoutType: string;
  startTime?: string;
};
export type WeightEntry = {
  id: string;
  date: string;
  weight: number;
  notes: string;
};
export type Goal = {
  id: string;
  title: string;
  target: number;
  category: "distance" | "workouts";
  period: "week" | "month" | "all";
};
export const seedWorkouts: Workout[] = realRuns;
export function dayKey(date: Date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export function dateValue(date: string): Date {
  return new Date(date.length === 10 ? `${date}T12:00:00` : date);
}
export function displayDate(date: string): string {
  return dateValue(date).toLocaleDateString("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
export function validDate(date: unknown): date is string {
  return (
    typeof date === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(date) &&
    Number.isFinite(dateValue(date).getTime()) &&
    dayKey(dateValue(date)) === date
  );
}
export function workoutError(data: {
  date: string;
  distance: number;
  duration: number;
  calories: number | null;
}): string | null {
  if (!validDate(data.date) || data.date > dayKey())
    return "Choose a valid date on or before today.";
  if (
    !Number.isFinite(data.distance) ||
    data.distance <= 0 ||
    data.distance > 1000
  )
    return "Distance must be greater than 0 and no more than 1,000 km.";
  if (
    !Number.isFinite(data.duration) ||
    data.duration <= 0 ||
    data.duration > 10080
  )
    return "Duration must be greater than 0 and no more than 10,080 minutes.";
  if (
    data.calories !== null &&
    (!Number.isFinite(data.calories) || data.calories < 0)
  )
    return "Calories must be a positive number or left blank.";
  return null;
}
export function inRange<T extends { date: string }>(
  items: T[],
  range: string,
  now = new Date(),
): T[] {
  const today = dayKey(now);
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  if (range === "week") {
    start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  } else if (range === "month") {
    start.setDate(1);
  } else if (range !== "all")
    start.setDate(start.getDate() - Number(range) + 1);
  return items.filter(
    (r) =>
      r.date.slice(0, 10) <= today &&
      (range === "all" || r.date.slice(0, 10) >= dayKey(start)),
  );
}
export function summarize(workouts: Workout[], now = new Date()) {
  const distance = workouts.reduce((s, r) => s + r.distance, 0),
    duration = workouts.reduce((s, r) => s + r.duration, 0);
  const running = workouts.filter((r) => r.workoutType === "Running");
  const rd = running.reduce((s, r) => s + r.distance, 0),
    rt = running.reduce((s, r) => s + r.duration, 0);
  const days = new Set(
    workouts
      .filter((r) => r.date <= dayKey(now))
      .map((r) => r.date.slice(0, 10)),
  );
  const cursor = new Date(now);
  let streak = 0;
  if (!days.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  while (days.has(dayKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  let longestStreak = 0,
    chain = 0;
  let previous = "";
  [...days].sort().forEach((day) => {
    const d = dateValue(day);
    d.setDate(d.getDate() - 1);
    chain = dayKey(d) === previous ? chain + 1 : 1;
    longestStreak = Math.max(longestStreak, chain);
    previous = day;
  });
  return {
    distance,
    duration,
    count: workouts.length,
    pace: rd ? rt / rd : 0,
    runningDistance: rd,
    runningCount: running.length,
    calories: workouts.reduce((s, r) => s + (r.calories ?? 0), 0),
    calorieCount: workouts.filter((r) => r.calories !== null).length,
    streak,
    longestStreak,
    longest: running.length ? Math.max(...running.map((r) => r.distance)) : 0,
    best: running.length
      ? Math.min(...running.map((r) => r.duration / r.distance))
      : 0,
  };
}
export function goalProgress(goal: Goal, workouts: Workout[]) {
  const records = inRange(workouts, goal.period);
  const current =
    goal.category === "distance"
      ? records.reduce((s, r) => s + r.distance, 0)
      : records.length;
  return {
    current,
    percent: Math.max(0, Math.min(100, (current / goal.target) * 100)),
  };
}
export function chartBuckets(
  workouts: Workout[],
  range: string,
  now = new Date(),
) {
  const selected = inRange(workouts, range, now);
  const monthly = range === "all";
  const start =
    selected.length && monthly
      ? dateValue(
          [...selected].sort((a, b) => a.date.localeCompare(b.date))[0].date,
        )
      : new Date(now);
  if (monthly) start.setDate(1);
  else start.setDate(start.getDate() - Number(range) + 1);
  const buckets: {
    date: string;
    label: string;
    distance: number;
    workouts: number;
    duration: number;
    pace: number | null;
  }[] = [];
  for (
    const d = new Date(start);
    dayKey(d) <= dayKey(now);
    monthly ? d.setMonth(d.getMonth() + 1) : d.setDate(d.getDate() + 1)
  ) {
    const key = dayKey(d);
    const rows = selected.filter((r) =>
      monthly
        ? r.date.slice(0, 7) === key.slice(0, 7)
        : r.date.slice(0, 10) === key,
    );
    const runs = rows.filter((r) => r.workoutType === "Running");
    const distance = runs.reduce((s, r) => s + r.distance, 0);
    const duration = runs.reduce((s, r) => s + r.duration, 0);
    buckets.push({
      date: key,
      label: d.toLocaleDateString(
        "en-US",
        monthly
          ? { month: "short", year: "2-digit" }
          : { month: "short", day: "numeric" },
      ),
      distance: Number(distance.toFixed(2)),
      workouts: rows.length,
      duration: Number(duration.toFixed(1)),
      pace: distance ? duration / distance : null,
    });
  }
  return buckets;
}

/** Match source identity before mutable fields so reimports never undo journal edits. */
export function mergeImportedWorkouts(
  saved: Workout[],
  incoming: Workout[],
  seeds: Workout[] = seedWorkouts,
): Workout[] {
  const identity = (r: Workout) =>
    r.startTime
      ? `${r.workoutType}|${r.startTime}`
      : `${r.date}|${r.workoutType}|${r.distance.toFixed(2)}|${r.duration.toFixed(1)}`;
  const records = new Map([...seeds, ...saved].map((r) => [r.id, r]));
  const identities = new Map(
    [...seeds, ...saved].map((r) => [identity(r), r.id]),
  );
  const next = new Map(saved.map((r) => [r.id, r]));
  for (const row of incoming) {
    const existingId = identities.get(identity(row));
    if (existingId) {
      const existing = records.get(existingId)!;
      // A later GPX import may add a route without replacing edited measurements or notes.
      if (!existing.routeData && row.routeData) {
        const enriched = { ...existing, routeData: row.routeData };
        next.set(existingId, enriched);
        records.set(existingId, enriched);
      }
    } else {
      const record = {
        ...row,
        id: records.has(row.id) ? `health_${identity(row)}` : row.id,
      };
      next.set(record.id, record);
      records.set(record.id, record);
      identities.set(identity(record), record.id);
    }
  }
  return [...next.values()];
}
