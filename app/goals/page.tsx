"use client";
import { useState } from "react";
import { Plus, Target, Pencil, Trash2 } from "lucide-react";
import { useFitness } from "@/components/fitness/provider";
import { PageHeader, Panel, Empty } from "@/components/fitness/ui";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Goal, goalProgress } from "@/lib/fitness";
export default function GoalsPage() {
  const { data, workouts, update } = useFitness();
  const [open, setOpen] = useState(false),
    [editing, setEditing] = useState<Goal | null>(null),
    [error, setError] = useState(""),
    [message, setMessage] = useState(""),
    [removed, setRemoved] = useState<Goal | null>(null);
  function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const target = Number(f.get("target")),
      title = String(f.get("title")).trim(),
      category = f.get("category") as Goal["category"];
    if (
      !title ||
      !Number.isFinite(target) ||
      target <= 0 ||
      (category === "workouts" && !Number.isInteger(target))
    ) {
      setError(
        "Add a title and a positive target. Workout targets must be whole numbers.",
      );
      return;
    }
    const goal: Goal = {
      id: editing?.id || crypto.randomUUID(),
      title,
      target,
      category,
      period: f.get("period") as Goal["period"],
    };
    if (
      update({
        goals: [...data.goals.filter((g) => g.id !== editing?.id), goal],
      })
    ) {
      setOpen(false);
      setMessage(
        "Goal saved. Progress updates automatically with your workouts.",
      );
      setRemoved(null);
    }
  }
  return (
    <div className="fitness-page">
      <PageHeader
        title="Make progress personal"
        description="Choose a direction. Let each workout move you closer."
        eyebrow="PROGRESS / GOALS"
      >
        <Button
          onClick={() => {
            setEditing(null);
            setError("");
            setOpen(true);
          }}
        >
          <Plus size={16} />
          New goal
        </Button>
      </PageHeader>
      {message && (
        <div role="status" className="success-message">
          {message}
          {removed && (
            <button
              onClick={() => {
                if (update({ goals: [...data.goals, removed] })) {
                  setRemoved(null);
                  setMessage("Goal restored.");
                }
              }}
            >
              Undo
            </button>
          )}
        </div>
      )}
      {data.goals.length ? (
        <div className="two-columns">
          {data.goals.map((g) => {
            const p = goalProgress(g, workouts);
            return (
              <Panel
                key={g.id}
                title={g.title}
                subtitle={
                  g.period === "all"
                    ? "All recorded activity"
                    : `This ${g.period} · automatically resets each ${g.period}`
                }
                action={<Target size={20} className="text-primary" />}
              >
                <div className="stat-value">
                  {p.current.toFixed(g.category === "distance" ? 1 : 0)}
                  <span>
                    / {g.target} {g.category === "distance" ? "km" : "workouts"}
                  </span>
                </div>
                <progress
                  aria-label={`${g.title} progress`}
                  value={p.percent}
                  max={100}
                />
                <p className="text-sm muted">
                  {p.percent === 100
                    ? "Goal reached. Take a moment to appreciate it."
                    : `${Math.round(p.percent)}% complete`}
                </p>
                <div className="form-actions">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditing(g);
                      setError("");
                      setOpen(true);
                    }}
                  >
                    <Pencil size={14} />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      if (
                        update({
                          goals: data.goals.filter((x) => x.id !== g.id),
                        })
                      ) {
                        setRemoved(g);
                        setMessage(
                          "Goal removed. Undo is available until your next change or refresh.",
                        );
                      }
                    }}
                  >
                    <Trash2 size={14} />
                    Remove
                  </Button>
                </div>
              </Panel>
            );
          })}
        </div>
      ) : (
        <Panel title="Your next milestone">
          <Empty
            title="A goal that fits your life"
            description="Set a weekly, monthly, or all-time activity target. Progress comes directly from your journal."
          >
            <Button onClick={() => setOpen(true)}>
              Create your first goal
            </Button>
          </Empty>
        </Panel>
      )}
      <p className="data-note">
        Distance goals include all activity types. Weeks start on Monday; months
        follow the calendar. No sample goals or estimated completion dates are
        included.
      </p>
      {open && (
        <Sheet open onOpenChange={setOpen}>
          <SheetContent className="editor-sheet">
            <SheetHeader>
              <SheetTitle>
                {editing ? "Edit goal" : "Set a new goal"}
              </SheetTitle>
              <SheetDescription>
                Something meaningful. Something yours.
              </SheetDescription>
            </SheetHeader>
            <form className="fitness-form" onSubmit={save}>
              <label>
                Goal name
                <input
                  name="title"
                  required
                  maxLength={80}
                  placeholder="e.g. Move 50 km this month"
                  defaultValue={editing?.title}
                />
              </label>
              <label>
                Measure
                <select
                  name="category"
                  defaultValue={editing?.category || "distance"}
                >
                  <option value="distance">Distance (km)</option>
                  <option value="workouts">Number of workouts</option>
                </select>
              </label>
              <label>
                Target
                <input
                  name="target"
                  type="number"
                  min="0.1"
                  step="any"
                  required
                  defaultValue={editing?.target}
                />
              </label>
              <label>
                Time period
                <select name="period" defaultValue={editing?.period || "month"}>
                  <option value="week">This week</option>
                  <option value="month">This month</option>
                  <option value="all">All time</option>
                </select>
              </label>
              {error && (
                <p role="alert" className="form-error">
                  {error}
                </p>
              )}
              <Button type="submit">Save goal</Button>
            </form>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}
