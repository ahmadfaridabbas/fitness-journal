"use client";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
} from "recharts";
import { chartBuckets, Workout, WeightEntry, displayDate } from "@/lib/fitness";
import { formatPace } from "@/lib/utils";
import { Empty } from "./ui";
const tooltip = {
  background: "var(--color-card)",
  border: "1px solid var(--color-border)",
  borderRadius: 12,
  color: "var(--color-foreground)",
  fontSize: 12,
};
export function ActivityChart({
  workouts,
  range,
  metric = "distance",
}: {
  workouts: Workout[];
  range: string;
  metric?: "distance" | "workouts" | "duration" | "pace";
}) {
  const data = chartBuckets(workouts, range);
  const unit =
    metric === "distance"
      ? "km"
      : metric === "duration"
        ? "min"
        : metric === "pace"
          ? "min/km"
          : "workouts";
  const hasData = data.some((d) =>
    metric === "pace" ? d.pace !== null : d[metric] > 0,
  );
  if (!hasData)
    return (
      <Empty
        title="A fresh start for this period"
        description="No matching workouts yet. Log an activity or choose a wider time range."
      />
    );
  return (
    <>
      <div
        className="chart"
        role="img"
        aria-label={`${metric} over time, in ${unit}`}
      >
        <ResponsiveContainer width="100%" height="100%">
          {metric === "pace" ? (
            <LineChart
              data={data}
              margin={{ top: 16, right: 12, left: -22, bottom: 8 }}
            >
              <CartesianGrid
                vertical={false}
                stroke="var(--color-border)"
                strokeDasharray="3 5"
              />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                minTickGap={32}
                tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
              />
              <YAxis
                reversed
                tickFormatter={formatPace}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
              />
              <Tooltip
                contentStyle={tooltip}
                formatter={(v) => [formatPace(Number(v)), unit]}
              />
              <Line
                isAnimationActive={false}
                dataKey="pace"
                stroke="#54a99c"
                strokeWidth={3}
                dot={{ r: 3 }}
                connectNulls={false}
              />
            </LineChart>
          ) : (
            <BarChart
              data={data}
              margin={{ top: 16, right: 12, left: -24, bottom: 8 }}
            >
              <CartesianGrid
                vertical={false}
                stroke="var(--color-border)"
                strokeDasharray="3 5"
              />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                minTickGap={32}
                tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                allowDecimals={metric !== "workouts"}
                tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
              />
              <Tooltip
                cursor={{ fill: "var(--color-muted)" }}
                contentStyle={tooltip}
                formatter={(v) => [v, unit]}
              />
              <Bar
                isAnimationActive={false}
                dataKey={metric}
                fill={metric === "workouts" ? "#8494bc" : "#4c9b89"}
                radius={[4, 4, 0, 0]}
                maxBarSize={36}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
      <details className="chart-data">
        <summary>View chart data · {unit}</summary>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>
                  {metric} ({unit})
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((d) => (
                <tr key={d.date}>
                  <td>{d.label}</td>
                  <td>
                    {metric === "pace"
                      ? d.pace
                        ? formatPace(d.pace)
                        : "—"
                      : d[metric]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </>
  );
}
export function WeightChart({ entries }: { entries: WeightEntry[] }) {
  if (entries.length < 2)
    return (
      <Empty
        title={
          entries.length
            ? "One entry is a beginning"
            : "Your progress starts here"
        }
        description="Add at least two weight entries to see your trend."
      />
    );
  return (
    <div
      className="chart"
      role="img"
      aria-label="Recorded weight in kilograms over time"
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={[...entries]
            .sort((a, b) => a.date.localeCompare(b.date))
            .map((e) => ({ ...e, label: displayDate(e.date) }))}
        >
          <CartesianGrid vertical={false} stroke="var(--color-border)" />
          <XAxis dataKey="label" minTickGap={40} tick={{ fontSize: 11 }} />
          <YAxis domain={["auto", "auto"]} width={40} tick={{ fontSize: 11 }} />
          <Tooltip contentStyle={tooltip} formatter={(v) => [v, "kg"]} />
          <Line
            isAnimationActive={false}
            dataKey="weight"
            stroke="#4c9b89"
            strokeWidth={3}
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
