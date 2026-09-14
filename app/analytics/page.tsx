"use client";
import { useState } from "react";
import { useFitness } from "@/components/fitness/provider";
import { PageHeader, Panel, RangeFilter } from "@/components/fitness/ui";
import { ActivityChart, WeightChart } from "@/components/fitness/charts";
import { inRange, summarize } from "@/lib/fitness";
import { formatPace } from "@/lib/utils";
export default function AnalyticsPage() {
  const { workouts, data } = useFitness();
  const [range, setRange] = useState("all");
  const s = summarize(inRange(workouts, range));
  return (
    <div className="fitness-page">
      <PageHeader
        title="See the bigger picture"
        description="Understand your rhythm through the work you’ve actually recorded."
        eyebrow="ACTIVITY / ANALYTICS"
      >
        <RangeFilter value={range} onChange={setRange} />
      </PageHeader>
      <div className="stats-grid three">
        <div className="stat-card">
          <p className="stat-label">Running distance</p>
          <div className="stat-value">
            {s.runningDistance.toFixed(1)}
            <span>km</span>
          </div>
        </div>
        <div className="stat-card">
          <p className="stat-label">Average running pace</p>
          <div className="stat-value">
            {formatPace(s.pace)}
            <span>min/km</span>
          </div>
        </div>
        <div className="stat-card">
          <p className="stat-label">Recorded activities</p>
          <div className="stat-value">
            {s.count}
            <span>workouts</span>
          </div>
        </div>
      </div>
      <div className="two-columns">
        <Panel
          title="Running distance"
          subtitle="Kilometres · running activities only"
        >
          <ActivityChart workouts={workouts} range={range} />
        </Panel>
        <Panel
          title="Workout consistency"
          subtitle="Session count · all activity types"
        >
          <ActivityChart workouts={workouts} range={range} metric="workouts" />
        </Panel>
        <Panel
          title="Running pace"
          subtitle="Minutes per kilometre · lower is faster"
        >
          <ActivityChart workouts={workouts} range={range} metric="pace" />
        </Panel>
        <Panel
          title="Time spent running"
          subtitle="Recorded running duration · minutes"
        >
          <ActivityChart workouts={workouts} range={range} metric="duration" />
        </Panel>
      </div>
      <Panel
        title="Weight over time"
        subtitle="Your recorded measurements · kg"
      >
        <WeightChart entries={inRange(data.weights, range)} />
      </Panel>
      <p className="data-note">
        Ranges end today. All-time charts group by month; shorter ranges group
        by day. Pace is total running time divided by total running distance.
        Missing pace values remain gaps.
      </p>
    </div>
  );
}
