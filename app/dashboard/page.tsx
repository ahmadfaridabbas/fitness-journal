"use client";
import { useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Route,
  Timer,
  Activity,
  Zap,
  Target,
  Flame,
  Upload,
  Scale,
  ChevronRight,
} from "lucide-react";
import { useFitness } from "@/components/fitness/provider";
import {
  PageHeader,
  Panel,
  RangeFilter,
  LogLink,
  WorkoutRow,
  Empty,
} from "@/components/fitness/ui";
import { ActivityChart } from "@/components/fitness/charts";
import {
  summarize,
  inRange,
  goalProgress,
  displayDate,
  dayKey,
} from "@/lib/fitness";
import { formatPace, formatDuration } from "@/lib/utils";
export default function DashboardPage() {
  const { workouts, data, ready } = useFitness();
  const [range, setRange] = useState("all");
  const stats = summarize(inRange(workouts, range)),
    all = summarize(workouts),
    week = inRange(workouts, "week");
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7) + i);
    return { key: dayKey(d), label: ["M", "T", "W", "T", "F", "S", "S"][i] };
  });
  return (
    <div className="fitness-page">
      <PageHeader
        title={`Welcome back, ${data.name.split(" ")[0] || "runner"}.`}
        description="Every bit of movement moves you forward."
        eyebrow="YOUR PERSONAL TRAINING SPACE"
      >
        <LogLink />
      </PageHeader>
      <div className="overview-bar">
        <div>
          <span className="live-dot" />{" "}
          {ready
            ? `${workouts.length} recorded activities`
            : "Loading your journal…"}{" "}
          <span className="muted">· Apple Health + your journal</span>
        </div>
        <RangeFilter value={range} onChange={setRange} />
      </div>
      <div className="stats-grid">
        {[
          {
            label: "Total distance",
            value: stats.distance.toFixed(1),
            unit: "km",
            note: "Across all activity types",
            icon: Route,
          },
          {
            label: "Workouts",
            value: stats.count.toString(),
            unit: "sessions",
            note: `${stats.runningCount} running sessions`,
            icon: Activity,
          },
          {
            label: "Time in motion",
            value: formatDuration(stats.duration),
            unit: "",
            note: "Every active minute counts",
            icon: Timer,
          },
          {
            label: "Running pace",
            value: formatPace(stats.pace),
            unit: "min/km",
            note: "Distance-weighted average",
            icon: Zap,
          },
        ].map((s, i) => (
          <section
            key={s.label}
            className={`stat-card ${i === 0 ? "featured-stat" : ""}`}
          >
            <div className="stat-label">
              {s.label}
              <s.icon size={18} />
            </div>
            <div className="stat-value">
              {s.value}
              <span>{s.unit}</span>
            </div>
            <p>{s.note}</p>
          </section>
        ))}
      </div>
      <div className="dashboard-main">
        <Panel
          title="Your running rhythm"
          subtitle={
            range === "all"
              ? "Monthly running distance · km"
              : "Daily running distance · km"
          }
          action={
            <Link className="text-link" href="/analytics">
              Explore <ArrowUpRight size={15} />
            </Link>
          }
        >
          <ActivityChart workouts={workouts} range={range} />
        </Panel>
        <section className="consistency-card">
          <span className="eyebrow">SHOWING UP COUNTS</span>
          <div className="streak-number">
            {all.streak}
            <Flame size={30} />
          </div>
          <h2>day activity streak</h2>
          <p>
            {all.streak
              ? "One day at a time. Keep your momentum."
              : "Your next chapter starts with one workout."}
          </p>
          <div className="week-days">
            {weekDays.map((d, i) => (
              <div key={i}>
                <span
                  className={
                    week.some((w) => w.date === d.key)
                      ? "done"
                      : d.key === dayKey()
                        ? "today"
                        : ""
                  }
                >
                  {week.some((w) => w.date === d.key) ? "✓" : d.label}
                </span>
                <small>{d.label}</small>
              </div>
            ))}
          </div>
          <div className="consistency-footer">
            <span>This week</span>
            <strong>{week.length} workouts</strong>
          </div>
          <div className="consistency-footer">
            <span>Longest streak</span>
            <strong>{all.longestStreak} days</strong>
          </div>
        </section>
      </div>
      <div className="dashboard-bottom">
        <Panel
          title="Recent activity"
          subtitle={
            workouts[0]
              ? `Latest entry · ${displayDate(workouts[0].date)}`
              : "Your workout story, one entry at a time"
          }
          action={
            <Link className="text-link" href="/journal">
              View all <ChevronRight size={15} />
            </Link>
          }
        >
          {workouts.length ? (
            workouts.slice(0, 4).map((r) => <WorkoutRow key={r.id} run={r} />)
          ) : (
            <Empty
              title="Make your first entry"
              description="Log a workout or import your Apple Health history."
            >
              <LogLink />
            </Empty>
          )}
        </Panel>
        <Panel
          title="Goals in motion"
          subtitle="Small steps. Meaningful progress."
          action={
            <Link aria-label="Manage goals" href="/goals">
              <ArrowUpRight size={18} />
            </Link>
          }
        >
          {data.goals.length ? (
            data.goals.slice(0, 3).map((g) => {
              const p = goalProgress(g, workouts);
              return (
                <div className="goal-summary" key={g.id}>
                  <div>
                    <Target size={16} />
                    <strong>{g.title}</strong>
                    <span>{Math.round(p.percent)}%</span>
                  </div>
                  <progress
                    aria-label={`${g.title} progress`}
                    value={p.percent}
                    max={100}
                  />
                  <small>
                    {p.current.toFixed(g.category === "distance" ? 1 : 0)} /{" "}
                    {g.target} {g.category === "distance" ? "km" : "workouts"} ·{" "}
                    {g.period === "all" ? "all time" : `this ${g.period}`}
                  </small>
                </div>
              );
            })
          ) : (
            <Empty
              title="Give your effort a direction"
              description="Set a distance or consistency goal that works for you."
            >
              <Link href="/goals" className="text-link">
                Set your first goal <ArrowUpRight size={15} />
              </Link>
            </Empty>
          )}
        </Panel>
      </div>
      <div className="quick-actions">
        <Link href="/import">
          <Upload size={19} />
          <span>
            <strong>Bring your history along</strong>
            <small>Import Apple Health workouts</small>
          </span>
          <ArrowUpRight size={18} />
        </Link>
        <Link href="/body">
          <Scale size={19} />
          <span>
            <strong>Check in with yourself</strong>
            <small>Record a weight entry</small>
          </span>
          <ArrowUpRight size={18} />
        </Link>
        <Link href="/achievements">
          <Target size={19} />
          <span>
            <strong>Celebrate your progress</strong>
            <small>
              {all.longest
                ? `${all.longest.toFixed(2)} km longest recorded run`
                : "Explore your milestones"}
            </small>
          </span>
          <ArrowUpRight size={18} />
        </Link>
      </div>
      <p className="data-note">
        {stats.calorieCount
          ? `${Math.round(stats.calories).toLocaleString()} recorded kcal across ${stats.calorieCount} activities in this period. Calories reflect the source export and may include basal energy.`
          : "Calories are unavailable for this period."}{" "}
        New entries are saved in this browser. Export a backup in Settings.
      </p>
    </div>
  );
}
