"use client";
import React from "react";
import Link from "next/link";
import { ArrowUpRight, Activity, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Workout, displayDate } from "@/lib/fitness";
import { formatPace, formatDuration } from "@/lib/utils";
export function PageHeader({
  eyebrow = "YOUR FITNESS, IN FOCUS",
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="page-heading">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="page-description">{description}</p>
      </div>
      <div className="heading-actions">{children}</div>
    </header>
  );
}
export function Panel({
  title,
  subtitle,
  children,
  action,
  className = "",
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`panel ${className}`}>
      <div className="panel-heading">
        <div>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
export function Empty({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="empty-state">
      <Activity size={28} />
      <h3>{title}</h3>
      <p>{description}</p>
      {children}
    </div>
  );
}
export function RangeFilter({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="range-filter" role="group" aria-label="Time range">
      {[
        ["7", "7 days"],
        ["30", "30 days"],
        ["90", "3 months"],
        ["all", "All time"],
      ].map(([v, label]) => (
        <button key={v} aria-pressed={v === value} onClick={() => onChange(v)}>
          {label}
        </button>
      ))}
    </div>
  );
}
export function LogLink() {
  return (
    <Button asChild>
      <Link href="/journal?add=1">
        <Plus size={16} />
        Log workout
      </Link>
    </Button>
  );
}
export function WorkoutRow({
  run,
  onClick,
}: {
  run: Workout;
  onClick?: () => void;
}) {
  const content = (
    <>
      <span className="activity-icon">
        <Activity size={20} />
      </span>
      <span className="workout-name">
        <strong>{run.route || `${run.workoutType} workout`}</strong>
        <small>
          {displayDate(run.date)}{" "}
          <span>
            · {run.workoutType} · {run.indoor ? "Indoor" : "Outdoor"}
          </span>
        </small>
      </span>
      <span className="workout-number">
        <strong>
          {run.distance.toFixed(2)} <small>km</small>
        </strong>
        <small>{formatDuration(run.duration)}</small>
      </span>
      <span className="workout-pace">
        <strong>{formatPace(run.duration / run.distance)}</strong>
        <small>min/km</small>
      </span>
      <ArrowUpRight className="row-arrow" size={17} />
    </>
  );
  return onClick ? (
    <button className="workout-row" onClick={onClick}>
      {content}
    </button>
  ) : (
    <Link className="workout-row" href={`/journal?workout=${run.id}`}>
      {content}
    </Link>
  );
}
export function download(
  name: string,
  content: string,
  type = "application/json",
) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
