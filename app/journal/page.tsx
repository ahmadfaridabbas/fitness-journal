"use client";
import { useEffect, useState } from "react";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFitness } from "@/components/fitness/provider";
import {
  PageHeader,
  WorkoutRow,
  Empty,
  RangeFilter,
} from "@/components/fitness/ui";
import { WorkoutEditor } from "@/components/fitness/workout-editor";
import { DetailSlider } from "@/components/shared/detail-slider";
import { RouteMap } from "@/components/maps/route-map";
import { Workout, inRange, displayDate } from "@/lib/fitness";
import { formatPace, formatDuration } from "@/lib/utils";
export default function JournalPage() {
  const { workouts, deleteWorkout, restoreWorkout, ready } = useFitness();
  const [selected, setSelected] = useState<Workout | null>(null),
    [editing, setEditing] = useState<Workout | null>(null),
    [open, setOpen] = useState(false),
    [query, setQuery] = useState(""),
    [type, setType] = useState("all"),
    [sort, setSort] = useState("date"),
    [range, setRange] = useState("all"),
    [count, setCount] = useState(20),
    [message, setMessage] = useState(""),
    [deleted, setDeleted] = useState<string | null>(null),
    [confirm, setConfirm] = useState(false);
  useEffect(() => {
    if (!ready) return;
    // Hydrate a browser URL deep link after persistent data has loaded.
    const p = new URLSearchParams(window.location.search);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (p.has("add")) setOpen(true);
    const found = workouts.find((r) => r.id === p.get("workout"));
    if (found) setSelected(found);
    window.history.replaceState(null, "", "/journal");
  }, [ready, workouts]); // Read deep link once after saved data loads.
  const filtered = inRange(workouts, range)
    .filter(
      (r) =>
        (type === "all" || r.workoutType === type) &&
        `${r.route} ${r.notes || ""} ${r.date}`
          .toLowerCase()
          .includes(query.toLowerCase()),
    )
    .sort((a, b) =>
      sort === "distance"
        ? b.distance - a.distance
        : sort === "pace"
          ? a.pace - b.pace
          : b.date.localeCompare(a.date),
    );
  return (
    <div className="fitness-page">
      <PageHeader
        title="Your workout journal"
        description="The big efforts, the easy days, and everything in between."
        eyebrow="ACTIVITY / JOURNAL"
      >
        <Button
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
          disabled={!ready}
        >
          <Plus size={16} />
          Log workout
        </Button>
      </PageHeader>
      {message && (
        <div role="status" className="success-message">
          {message}
          {deleted && (
            <button
              onClick={() => {
                if (restoreWorkout(deleted)) {
                  setMessage("Workout restored.");
                  setDeleted(null);
                }
              }}
            >
              Undo
            </button>
          )}
        </div>
      )}
      <section className="journal-toolbar">
        <label className="search-field">
          <Search size={17} />
          <input
            aria-label="Search workouts"
            placeholder="Search workouts, notes, or dates"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setCount(20);
            }}
          />
        </label>
        <select
          aria-label="Activity type"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="all">All activities</option>
          {["Running", "Walking", "Hiking", "Cycling"].map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
        <select
          aria-label="Sort workouts"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="date">Newest first</option>
          <option value="distance">Longest distance</option>
          <option value="pace">Fastest pace</option>
        </select>
      </section>
      <div className="overview-bar">
        <p className="muted text-sm">
          {filtered.length} {filtered.length === 1 ? "workout" : "workouts"}
        </p>
        <RangeFilter value={range} onChange={setRange} />
      </div>
      <section className="panel workout-list">
        {filtered.length ? (
          filtered.slice(0, count).map((r) => (
            <WorkoutRow
              key={r.id}
              run={r}
              onClick={() => {
                setSelected(r);
                setConfirm(false);
              }}
            />
          ))
        ) : (
          <Empty
            title="No workouts found"
            description="Try a different search or log your first workout."
          />
        )}
      </section>
      {filtered.length > count && (
        <Button variant="outline" onClick={() => setCount(count + 20)}>
          Show more workouts
        </Button>
      )}
      {open && (
        <WorkoutEditor
          run={editing || undefined}
          onClose={() => setOpen(false)}
          onSaved={() => {
            setMessage("Workout saved.");
            setDeleted(null);
          }}
        />
      )}
      {selected && (
        <DetailSlider
          open
          onOpenChange={(o) => !o && setSelected(null)}
          title={selected.route}
          subtitle={displayDate(selected.date)}
          badges={[
            { label: selected.workoutType },
            {
              label: selected.indoor ? "Indoor" : "Outdoor",
              variant: "secondary",
            },
          ]}
          fields={[
            { label: "Distance", value: `${selected.distance.toFixed(2)} km` },
            { label: "Duration", value: formatDuration(selected.duration) },
            {
              label: "Pace",
              value: `${formatPace(selected.duration / selected.distance)} min/km`,
            },
            {
              label: "Average heart rate",
              value: selected.avgHeartRate
                ? `${selected.avgHeartRate} bpm`
                : "Not recorded",
            },
            {
              label: "Calories",
              value:
                selected.calories !== null
                  ? `${selected.calories} kcal`
                  : "Not recorded",
            },
            {
              label: "Cadence",
              value: selected.cadence
                ? `${selected.cadence} spm`
                : "Not recorded",
            },
            {
              label: "Power",
              value: selected.power ? `${selected.power} W` : "Not recorded",
            },
            {
              label: "Elevation gain",
              value:
                selected.elevation !== null
                  ? `${selected.elevation} m`
                  : "Not recorded",
            },
          ]}
        >
          {selected.routeData && (
            <RouteMap
              coordinates={selected.routeData.coordinates}
              className="w-full"
            />
          )}
          {selected.notes && (
            <p className="whitespace-pre-wrap text-sm">{selected.notes}</p>
          )}
          <div className="form-actions">
            <Button
              variant="outline"
              onClick={() => {
                setEditing(selected);
                setSelected(null);
                setOpen(true);
              }}
            >
              <Pencil size={15} />
              Edit workout
            </Button>
            <Button variant="outline" onClick={() => setConfirm(true)}>
              <Trash2 size={15} />
              Delete
            </Button>
          </div>
          {confirm && (
            <div className="delete-confirm">
              <p>
                Remove this workout from your journal? You can restore it from
                Settings.
              </p>
              <Button
                variant="destructive"
                onClick={() => {
                  if (deleteWorkout(selected.id)) {
                    setDeleted(selected.id);
                    setSelected(null);
                    setMessage("Workout removed.");
                  }
                }}
              >
                Delete workout
              </Button>
              <Button variant="ghost" onClick={() => setConfirm(false)}>
                Keep workout
              </Button>
            </div>
          )}
        </DetailSlider>
      )}
    </div>
  );
}
