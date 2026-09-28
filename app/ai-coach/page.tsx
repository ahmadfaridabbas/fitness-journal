"use client";
import Link from "next/link";
import { useFitness } from "@/components/fitness/provider";
import { PageHeader, Panel, Empty, WorkoutRow } from "@/components/fitness/ui";
import { inRange, summarize } from "@/lib/fitness";
export default function CoachPage() {
  const { workouts } = useFitness();
  const week = summarize(inRange(workouts, "week")),
    all = summarize(workouts);
  return (
    <div className="fitness-page">
      <PageHeader
        title="Reflect on your training"
        description="Simple observations from your journal, without invented scores."
        eyebrow="EXPLORE / TRAINING INSIGHTS"
      />
      <div className="two-columns">
        <Panel title="This week in motion" subtitle="Monday through today">
          <p className="text-sm muted leading-relaxed">
            {week.count
              ? `You have recorded ${week.count} workouts and covered ${week.distance.toFixed(1)} km this week.`
              : "There are no recorded activities this week. Your earlier history is still available in the journal."}
          </p>
          <Link className="text-link mt-5" href="/journal">
            Open your journal →
          </Link>
        </Panel>
        <Panel
          title="Your consistency"
          subtitle="Based on recorded activity dates"
        >
          <p className="text-sm muted leading-relaxed">
            Your longest recorded activity streak is {all.longestStreak} days.
            Your current streak is {all.streak} days. Multiple workouts on the
            same day count as one active day.
          </p>
        </Panel>
      </div>
      <Panel
        title="Recent workouts"
        subtitle="Review the details and add your own notes"
      >
        {workouts.length ? (
          workouts.slice(0, 5).map((r) => <WorkoutRow run={r} key={r.id} />)
        ) : (
          <Empty
            title="Your insights start with a workout"
            description="Log or import activity to start seeing your training history."
          />
        )}
      </Panel>
      <p className="data-note">
        These are calculated observations, not AI-generated coaching or medical
        advice. Recovery scores, training prescriptions, and heart-rate zones
        are unavailable because they are not supported by the recorded data.
      </p>
    </div>
  );
}
