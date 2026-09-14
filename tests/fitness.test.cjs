/* Uses the existing TypeScript compiler and Node test runner; no test dependencies. */
const { test } = require("node:test");
const assert = require("node:assert/strict");
const ts = require("typescript");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.resolve(__dirname, "..");
const cache = new Map();
function load(file) {
  if (cache.has(file)) return cache.get(file);
  if (file.endsWith(".json")) return JSON.parse(fs.readFileSync(file, "utf8"));
  const output = ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
  }).outputText;
  const m = { exports: {} };
  cache.set(file, m.exports);
  const localRequire = (id) => {
    if (!id.startsWith(".") && !id.startsWith("@/")) return require(id);
    let resolved = id.startsWith("@/")
      ? path.join(root, id.slice(2))
      : path.resolve(path.dirname(file), id);
    if (!path.extname(resolved)) resolved += ".ts";
    return load(resolved);
  };
  vm.runInThisContext(`(function(require,module,exports){${output}\n})`, {
    filename: file,
  })(localRequire, m, m.exports);
  cache.set(file, m.exports);
  return m.exports;
}
const f = load(path.join(root, "lib/fitness.ts"));
const u = load(path.join(root, "lib/utils.ts"));
const backup = load(path.join(root, "lib/backup.ts"));
const now = new Date(2026, 8, 14, 12);
const run = (date, distance = 5, duration = 30, type = "Running") => ({
  ...f.seedWorkouts[0],
  id: date,
  date,
  distance,
  duration,
  pace: duration / distance,
  workoutType: type,
  calories: null,
});
test("pace and duration carry seconds/minutes correctly", () => {
  assert.equal(u.formatPace(6.999), "7:00");
  assert.equal(u.formatPace(6.5), "6:30");
  assert.equal(u.formatPace(Infinity), "—");
  assert.equal(u.formatDuration(59.9), "1h 0m");
});
test("running pace is weighted by distance and excludes walks", () => {
  const s = f.summarize(
    [
      run("2026-09-14", 1, 5),
      run("2026-09-13", 9, 90),
      run("2026-09-12", 5, 100, "Walking"),
    ],
    now,
  );
  assert.equal(s.pace, 9.5);
  assert.equal(s.distance, 15);
  assert.equal(s.runningCount, 2);
  assert.equal(s.calorieCount, 0);
});
test("streak counts calendar days, deduplicates workouts, and allows yesterday", () => {
  const rows = [
    run("2026-09-13"),
    run("2026-09-13"),
    run("2026-09-12"),
    run("2026-09-10"),
  ];
  assert.equal(f.summarize(rows, now).streak, 2);
  assert.equal(f.summarize(rows, now).longestStreak, 2);
  assert.equal(f.summarize(rows, new Date(2026, 8, 16)).streak, 0);
});
test("ranges use local dates and Monday week boundaries", () => {
  const rows = [
    run("2026-09-14"),
    run("2026-09-13"),
    run("2026-09-08"),
    run("2026-09-07"),
    run("2026-09-15"),
  ];
  assert.equal(f.inRange(rows, "7", now).length, 3);
  assert.equal(f.inRange(rows, "week", now).length, 1);
  assert.equal(f.inRange(rows, "all", now).length, 4);
  assert.equal(f.dayKey(f.dateValue("2026-09-14")), "2026-09-14");
});
test("charts include rest days and preserve missing pace", () => {
  const buckets = f.chartBuckets([run("2026-09-14")], "7", now);
  assert.equal(buckets.length, 7);
  assert.equal(buckets[0].workouts, 0);
  assert.equal(buckets[0].pace, null);
  assert.equal(buckets.at(-1).distance, 5);
  assert.equal(buckets.at(-1).pace, 6);
});
test("empty summaries have finite totals", () => {
  const s = f.summarize([], now);
  for (const value of Object.values(s)) assert.ok(Number.isFinite(value));
  assert.equal(s.count, 0);
  assert.equal(s.streak, 0);
});
test("workout validation rejects zero, negative, invalid dates, and NaN", () => {
  for (const patch of [
    { distance: 0 },
    { duration: -1 },
    { distance: NaN },
    { date: "2026-02-30" },
    { date: "2099-01-01" },
    { calories: -1 },
  ])
    assert.ok(f.workoutError({ ...run("2026-09-01"), ...patch }));
  assert.equal(f.workoutError(run("2026-09-01")), null);
});
test("goal progress is clamped", () => {
  const p = f.goalProgress(
    {
      id: "g",
      title: "Distance",
      category: "distance",
      period: "all",
      target: 1,
    },
    [run("2026-09-01")],
  );
  assert.equal(p.current, 5);
  assert.equal(p.percent, 100);
});
test("source history preserved, including short activities and duration precision", () => {
  const raw = JSON.parse(
    fs.readFileSync(path.join(root, "lib/data/imported-runs.json")),
  );
  assert.equal(
    f.seedWorkouts.length,
    raw.filter((r) => r.distance > 0 && r.duration > 0).length,
  );
  assert.equal(f.seedWorkouts[0].duration, raw[0].duration);
  assert.ok(f.seedWorkouts.some((r) => r.distance < 0.5));
  assert.equal(f.seedWorkouts[0].id, "run_imported_0");
});
test("backup validation rejects malformed objects without accepting partial state", () => {
  const valid = {
    version: 1,
    name: "Test",
    workouts: [],
    weights: [],
    goals: [],
    deleted: [],
  };
  assert.deepEqual(backup.validateBackup(valid), valid);
  assert.throws(() =>
    backup.validateBackup({ ...valid, weights: [{ date: "bad", weight: 70 }] }),
  );
  assert.throws(() =>
    backup.validateBackup({ ...valid, goals: [{ target: 0 }] }),
  );
  assert.throws(() => backup.validateBackup(null));
});
const sync = load(path.join(root, "app/api/import/sync/route.ts"));
test("Apple Health import normalizes units, timezone, missing metrics, and GPX", async () => {
  const xml = `<HealthData><Workout workoutActivityType="HKWorkoutActivityTypeRunning" duration="1800" durationUnit="s" startDate="2026-09-01 23:30:00 -0400" endDate="2026-09-02 00:00:00 -0400"><WorkoutStatistics sum="3.10685596" type="HKQuantityTypeIdentifierDistanceWalkingRunning" unit="mi"/><WorkoutStatistics maximum="165" type="HKQuantityTypeIdentifierHeartRate" minimum="100" average="140"/><MetadataEntry key="HKWeatherTemperature" value="20 degC"/><MetadataEntry key="HKWeatherHumidity" value="0.65 %"/><FileReference path="/workout-routes/test.gpx"/></Workout></HealthData>`;
  const gpx =
    '<gpx><trk><trkseg><trkpt lat="43" lon="-79"><ele>10</ele></trkpt><trkpt lat="43.01" lon="-79.01"><ele>15</ele></trkpt></trkseg></trk></gpx>';
  const data = new FormData();
  data.append("exportFile", new File([xml], "export.xml"));
  data.append("gpxFiles", new File([gpx], "test.gpx"));
  const before = fs.readFileSync(
    path.join(root, "lib/data/imported-runs.json"),
    "utf8",
  );
  const response = await sync.POST(
    new Request("http://localhost/api/import/sync", {
      method: "POST",
      body: data,
    }),
  );
  assert.equal(response.status, 200);
  const result = await response.json();
  const r = result.runs[0];
  assert.equal(r.duration, 30);
  assert.ok(Math.abs(r.distance - 5) < 0.0001);
  assert.equal(r.date, "2026-09-01");
  assert.equal(r.startTime, "2026-09-02T03:30:00.000Z");
  assert.equal(r.avgHeartRate, 140);
  assert.equal(r.totalCalories, null);
  assert.equal(r.weather.temperature, 20);
  assert.equal(r.weather.humidity, 65);
  assert.equal(r.routeData.coordinates.length, 2);
  assert.equal(
    fs.readFileSync(path.join(root, "lib/data/imported-runs.json"), "utf8"),
    before,
  );
});
test("Apple Health import rejects empty or invalid exports", async () => {
  const form = new FormData();
  form.append("exportFile", new File(["<not-health/>"], "export.xml"));
  const response = await sync.POST(
    new Request("http://localhost/api/import/sync", {
      method: "POST",
      body: form,
    }),
  );
  assert.equal(response.status, 404);
});
test("reimports preserve edits, skip duplicates, and can attach missing GPS", () => {
  const source = {
    ...run("2026-09-01"),
    id: "source",
    startTime: "2026-09-01T12:00:00Z",
    routeData: null,
  };
  const edited = { ...source, distance: 6, notes: "Keep my edit" };
  const incoming = {
    ...source,
    id: "new-import",
    routeData: {
      type: "LineString",
      coordinates: [
        [0, 0],
        [1, 1],
      ],
    },
  };
  const rows = f.mergeImportedWorkouts(
    [edited],
    [incoming, incoming],
    [source],
  );
  assert.equal(rows.length, 1);
  assert.equal(rows[0].id, "source");
  assert.equal(rows[0].distance, 6);
  assert.equal(rows[0].notes, "Keep my edit");
  assert.equal(rows[0].routeData.coordinates.length, 2);
});
