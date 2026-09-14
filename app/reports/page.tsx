"use client";
import { useState } from "react";
import { Download } from "lucide-react";
import { useFitness } from "@/components/fitness/provider";
import {
  PageHeader,
  Panel,
  RangeFilter,
  WorkoutRow,
  Empty,
  download,
} from "@/components/fitness/ui";
import { Button } from "@/components/ui/button";
import { inRange, summarize } from "@/lib/fitness";
import { formatPace, formatDuration } from "@/lib/utils";
export default function ReportsPage() {
  const { workouts } = useFitness();
  const [range, setRange] = useState("30");
  const rows = inRange(workouts, range),
    s = summarize(rows);
  function exportCsv() {
    const escape = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    download(
      "fitjournal-workouts.csv",
      [
        [
          "Date",
          "Activity",
          "Distance (km)",
          "Duration (min)",
          "Pace (min/km)",
          "Calories (kcal)",
        ],
        ...rows.map((r) => [
          r.date,
          r.workoutType,
          r.distance,
          r.duration,
          r.pace,
          r.calories,
        ]),
      ]
        .map((r) => r.map(escape).join(","))
        .join("\r\n"),
      "text/csv;charset=utf-8",
    );
  }
  return (
    <div className="fitness-page">
      <PageHeader
        title="Your effort, on record"
        description="A clear summary you can take with you."
        eyebrow="EXPLORE / REPORTS"
      >
        <Button variant="outline" onClick={exportCsv}>
          <Download size={16} />
          Export CSV
        </Button>
      </PageHeader>
      <RangeFilter value={range} onChange={setRange} />
      <div className="stats-grid">
        {[
          ["Activities", s.count],
          ["Distance", `${s.distance.toFixed(2)} km`],
          ["Active time", formatDuration(s.duration)],
          ["Running pace", `${formatPace(s.pace)} min/km`],
        ].map(([l, v]) => (
          <div className="stat-card" key={l}>
            <p className="stat-label">{l}</p>
            <div className="stat-value" style={{ fontSize: 25 }}>
              {v}
            </div>
          </div>
        ))}
      </div>
      <Panel
        title="Period summary"
        subtitle={
          range === "all"
            ? "All recorded history"
            : `Last ${range} days, ending today`
        }
      >
        <p className="text-sm muted leading-relaxed">
          You recorded {s.count} activities covering {s.distance.toFixed(2)} km,
          including {s.runningCount} runs and {s.runningDistance.toFixed(2)} km
          of running.{" "}
          {s.calorieCount
            ? `${Math.round(s.calories).toLocaleString()} kcal are recorded across ${s.calorieCount} activities.`
            : "No calorie data is available for this period."}
        </p>
      </Panel>
      <Panel
        title="Activities in this period"
        subtitle="Latest 10 shown · CSV includes every matching activity"
      >
        {rows.length ? (
          rows.slice(0, 10).map((r) => <WorkoutRow key={r.id} run={r} />)
        ) : (
          <Empty
            title="Nothing recorded in this period"
            description="Try All time to see your full history."
          />
        )}
      </Panel>
    </div>
  );
}
