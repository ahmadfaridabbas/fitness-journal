"use client";
import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useFitness } from "@/components/fitness/provider";
import { PageHeader, Panel, Empty } from "@/components/fitness/ui";
import { WeightChart } from "@/components/fitness/charts";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { WeightEntry, dayKey, displayDate, validDate } from "@/lib/fitness";
export default function BodyPage() {
  const { data, update } = useFitness();
  const [open, setOpen] = useState(false),
    [editing, setEditing] = useState<WeightEntry | null>(null),
    [message, setMessage] = useState(""),
    [error, setError] = useState(""),
    [removed, setRemoved] = useState<WeightEntry | null>(null);
  const entries = [...data.weights].sort((a, b) =>
    b.date.localeCompare(a.date),
  );
  const current = entries[0],
    first = entries.at(-1);
  function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const date = String(f.get("date")),
      weight = Number(f.get("weight"));
    if (
      !validDate(date) ||
      date > dayKey() ||
      !Number.isFinite(weight) ||
      weight < 1 ||
      weight > 700
    ) {
      setError("Enter a valid date and a weight between 1 and 700 kg.");
      return;
    }
    if (entries.some((w) => w.date === date && w.id !== editing?.id)) {
      setError(
        "There is already an entry for this date. Edit that entry instead.",
      );
      return;
    }
    if (
      update({
        weights: [
          ...data.weights.filter((w) => w.id !== editing?.id),
          {
            id: editing?.id || crypto.randomUUID(),
            date,
            weight,
            notes: String(f.get("notes")),
          },
        ],
      })
    ) {
      setOpen(false);
      setMessage("Weight entry saved.");
      setRemoved(null);
    }
  }
  return (
    <div className="fitness-page">
      <PageHeader
        title="A moment to check in"
        description="Your measurements, on your terms. Look for trends over time."
        eyebrow="PROGRESS / BODY & WEIGHT"
      >
        <Button
          onClick={() => {
            setEditing(null);
            setError("");
            setOpen(true);
          }}
        >
          <Plus size={16} />
          Add weight
        </Button>
      </PageHeader>
      {message && (
        <div className="success-message" role="status">
          {message}
          {removed && (
            <button
              onClick={() => {
                if (update({ weights: [...data.weights, removed] })) {
                  setRemoved(null);
                  setMessage("Entry restored.");
                }
              }}
            >
              Undo
            </button>
          )}
        </div>
      )}
      <div className="stats-grid three">
        {[
          ["Latest weight", current ? `${current.weight} kg` : "Not recorded"],
          [
            "Change since first entry",
            current && first && entries.length > 1
              ? `${current.weight - first.weight > 0 ? "+" : ""}${(current.weight - first.weight).toFixed(1)} kg`
              : "Not enough data",
          ],
          ["Measurements", String(entries.length)],
        ].map(([label, value]) => (
          <div className="stat-card" key={label}>
            <p className="stat-label">{label}</p>
            <div className="stat-value" style={{ fontSize: 25 }}>
              {value}
            </div>
          </div>
        ))}
      </div>
      <Panel
        title="Your weight trend"
        subtitle="Recorded measurements · kilograms"
      >
        <WeightChart entries={entries} />
      </Panel>
      <Panel title="Measurement history" subtitle="One entry per day">
        {entries.length ? (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Weight</th>
                  <th>Notes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((w) => (
                  <tr key={w.id}>
                    <td>{displayDate(w.date)}</td>
                    <td>{w.weight} kg</td>
                    <td>{w.notes || "—"}</td>
                    <td>
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label={`Edit weight for ${w.date}`}
                        onClick={() => {
                          setEditing(w);
                          setError("");
                          setOpen(true);
                        }}
                      >
                        <Pencil size={15} />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label={`Delete weight for ${w.date}`}
                        onClick={() => {
                          if (
                            update({
                              weights: data.weights.filter(
                                (x) => x.id !== w.id,
                              ),
                            })
                          ) {
                            setRemoved(w);
                            setMessage(
                              "Entry removed. Undo is available until your next change or refresh.",
                            );
                          }
                        }}
                      >
                        <Trash2 size={15} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty
            title="Start with where you are"
            description="No weight measurements have been recorded. Add an entry to start your personal trend."
          />
        )}
      </Panel>
      <p className="data-note">
        Only measurements you enter appear here. The previous demonstration
        measurements are not treated as your health data.
      </p>
      {open && (
        <Sheet open onOpenChange={setOpen}>
          <SheetContent className="editor-sheet">
            <SheetHeader>
              <SheetTitle>
                {editing ? "Edit measurement" : "Add weight"}
              </SheetTitle>
              <SheetDescription>A simple record of today.</SheetDescription>
            </SheetHeader>
            <form className="fitness-form" onSubmit={save}>
              <label>
                Date
                <input
                  type="date"
                  name="date"
                  required
                  max={dayKey()}
                  defaultValue={editing?.date || dayKey()}
                />
              </label>
              <label>
                Weight (kg)
                <input
                  type="number"
                  name="weight"
                  min="1"
                  max="700"
                  step="0.1"
                  required
                  defaultValue={editing?.weight}
                />
              </label>
              <label>
                Notes (optional)
                <textarea
                  name="notes"
                  rows={3}
                  maxLength={1000}
                  defaultValue={editing?.notes}
                />
              </label>
              {error && (
                <p role="alert" className="form-error">
                  {error}
                </p>
              )}
              <Button type="submit">Save measurement</Button>
            </form>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}
