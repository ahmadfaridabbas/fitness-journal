"use client";
import { Trophy, Check } from "lucide-react";
import { useFitness } from "@/components/fitness/provider";
import { PageHeader, Panel } from "@/components/fitness/ui";
import { summarize } from "@/lib/fitness";
import { formatPace } from "@/lib/utils";
export default function AchievementsPage() {
  const { workouts } = useFitness();
  const s = summarize(workouts);
  const milestones = [
    {
      title: "The first step",
      description: "Record your first workout",
      current: s.count,
      target: 1,
      unit: "workout",
    },
    {
      title: "Finding your rhythm",
      description: "Complete 10 activities",
      current: s.count,
      target: 10,
      unit: "workouts",
    },
    {
      title: "A hundred kilometres",
      description: "Cover 100 km across all activities",
      current: s.distance,
      target: 100,
      unit: "km",
    },
    {
      title: "Going the distance",
      description: "Cover 500 km across all activities",
      current: s.distance,
      target: 500,
      unit: "km",
    },
    {
      title: "The 5K milestone",
      description: "Complete a running workout of at least 5 km",
      current: s.longest,
      target: 5,
      unit: "km",
    },
    {
      title: "The 10K milestone",
      description: "Complete a running workout of at least 10 km",
      current: s.longest,
      target: 10,
      unit: "km",
    },
    {
      title: "Three days of movement",
      description: "Record activity on 3 consecutive days",
      current: s.longestStreak,
      target: 3,
      unit: "days",
    },
    {
      title: "A week in motion",
      description: "Record activity on 7 consecutive days",
      current: s.longestStreak,
      target: 7,
      unit: "days",
    },
  ];
  return (
    <div className="fitness-page">
      <PageHeader
        title="Look how far you’ve come"
        description="Real milestones, earned through your recorded activities."
        eyebrow="PROGRESS / MILESTONES"
      />
      <div className="stats-grid three">
        {[
          [
            "Milestones reached",
            `${milestones.filter((m) => m.current >= m.target).length} / ${milestones.length}`,
          ],
          [
            "Longest recorded run",
            s.longest ? `${s.longest.toFixed(2)} km` : "Not recorded",
          ],
          [
            "Fastest average running pace",
            s.best ? `${formatPace(s.best)} min/km` : "Not recorded",
          ],
        ].map(([l, v]) => (
          <div className="stat-card" key={l}>
            <p className="stat-label">{l}</p>
            <div className="stat-value" style={{ fontSize: 25 }}>
              {v}
            </div>
          </div>
        ))}
      </div>
      <div className="two-columns">
        {milestones.map((m) => (
          <Panel
            key={m.title}
            title={m.title}
            subtitle={m.description}
            action={
              m.current >= m.target ? (
                <Check className="text-primary" size={20} />
              ) : (
                <Trophy className="muted" size={20} />
              )
            }
          >
            <progress
              aria-label={`${m.title} progress`}
              value={Math.min(100, (m.current / m.target) * 100)}
              max={100}
            />
            <p className="text-sm muted">
              {m.current >= m.target
                ? "Achieved"
                : `${m.current.toFixed(m.unit === "km" ? 1 : 0)} / ${m.target} ${m.unit}`}
            </p>
          </Panel>
        ))}
      </div>
      <p className="data-note">
        Personal best pace is the average pace of an entire running workout, not
        a measured 5K or 10K split. Milestones update if a workout is edited or
        removed.
      </p>
    </div>
  );
}
