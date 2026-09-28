"use client";
import { useFitness } from "@/components/fitness/provider";
import { PageHeader, Panel, Empty } from "@/components/fitness/ui";
import { displayDate } from "@/lib/fitness";
import { formatPace } from "@/lib/utils";
export default function WeatherPage() {
  const { workouts } = useFitness();
  const rows = workouts.filter(
    (r) => r.weather?.temperature != null || r.weather?.humidity != null,
  );
  const temps = rows.flatMap((r) =>
    r.weather?.temperature != null ? [r.weather.temperature] : [],
  );
  const hums = rows.flatMap((r) =>
    r.weather?.humidity != null ? [r.weather.humidity] : [],
  );
  return (
    <div className="fitness-page">
      <PageHeader
        title="The conditions you moved in"
        description="Weather recorded with your workouts. A little more context for every effort."
        eyebrow="EXPLORE / WEATHER"
      />
      <div className="stats-grid three">
        {[
          ["Activities with weather", String(rows.length)],
          [
            "Average recorded temperature",
            temps.length
              ? `${(temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1)} °C`
              : "Not recorded",
          ],
          [
            "Average recorded humidity",
            hums.length
              ? `${Math.round(hums.reduce((a, b) => a + b, 0) / hums.length)}%`
              : "Not recorded",
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
      <Panel
        title="Workout conditions"
        subtitle="Historical readings from Apple Health · not a current forecast"
      >
        {rows.length ? (
          <div className="table-scroll" style={{ maxHeight: 650 }}>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Activity</th>
                  <th>Temperature</th>
                  <th>Humidity</th>
                  <th>Pace</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td>{displayDate(r.date)}</td>
                    <td>{r.workoutType}</td>
                    <td>
                      {r.weather?.temperature != null
                        ? `${r.weather.temperature} °C`
                        : "Not recorded"}
                    </td>
                    <td>
                      {r.weather?.humidity != null
                        ? `${r.weather.humidity}%`
                        : "Not recorded"}
                    </td>
                    <td>{formatPace(r.pace)} min/km</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty
            title="No weather readings yet"
            description="Workouts with recorded temperature or humidity will appear here."
          />
        )}
      </Panel>
      <p className="data-note">
        AQI, current forecasts, and estimated performance effects are
        unavailable. Weather values are shown as recorded in the source data.
      </p>
    </div>
  );
}
