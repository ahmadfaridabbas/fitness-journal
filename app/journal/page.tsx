"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DetailSlider } from "@/components/shared/detail-slider";
import { formatPace, formatDuration, getWeatherEmoji } from "@/lib/utils";
import { allRuns as mockRuns } from "@/lib/mock-data";
import {
  Calendar,
  MapPin,
  Clock,
  Heart,
  Zap,
  Thermometer,
  Droplets,
  Wind,
  Plus,
  Filter,
  ArrowUpDown,
} from "lucide-react";

export default function JournalPage() {
  const [selectedRun, setSelectedRun] = React.useState<typeof mockRuns[0] | null>(null);
  const [sortBy, setSortBy] = React.useState<"date" | "distance" | "pace">("date");

  const sortedRuns = [...mockRuns].sort((a, b) => {
    if (sortBy === "date") return new Date(b.date).getTime() - new Date(a.date).getTime();
    if (sortBy === "distance") return b.distance - a.distance;
    return a.pace - b.pace;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Journal</h1>
          <p className="text-muted-foreground mt-1">
            Every workout tells a story. Click any run to see full details.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={sortBy === "date" ? "default" : "outline"}
          size="sm"
          onClick={() => setSortBy("date")}
        >
          <Calendar className="h-3 w-3 mr-1" />
          Date
        </Button>
        <Button
          variant={sortBy === "distance" ? "default" : "outline"}
          size="sm"
          onClick={() => setSortBy("distance")}
        >
          <ArrowUpDown className="h-3 w-3 mr-1" />
          Distance
        </Button>
        <Button
          variant={sortBy === "pace" ? "default" : "outline"}
          size="sm"
          onClick={() => setSortBy("pace")}
        >
          <Zap className="h-3 w-3 mr-1" />
          Pace
        </Button>
      </div>

      {/* Run Cards */}
      <div className="grid gap-4">
        {sortedRuns.map((run) => (
          <Card
            key={run.id}
            className="cursor-pointer hover:shadow-md transition-all hover:border-primary/50"
            onClick={() => setSelectedRun(run)}
          >
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Left: Main info */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-lg">{run.route}</h3>
                    <Badge
                      variant={
                        run.trainingLoad === "easy" ? "success" :
                        run.trainingLoad === "moderate" ? "default" :
                        "warning"
                      }
                    >
                      {run.trainingLoad}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(run.date).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {run.indoor ? "Indoor" : "Outdoor"}
                    </span>
                  </div>
                </div>

                {/* Middle: Stats */}
                <div className="grid grid-cols-4 gap-4 md:gap-6">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Distance</p>
                    <p className="text-sm font-bold">{run.distance} km</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Pace</p>
                    <p className="text-sm font-bold">{formatPace(run.pace)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">HR</p>
                    <p className="text-sm font-bold">{run.avgHeartRate} bpm</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Duration</p>
                    <p className="text-sm font-bold">{formatDuration(run.duration)}</p>
                  </div>
                </div>

                {/* Right: Weather + Score */}
                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <span className="text-lg">
                      {getWeatherEmoji(run.weather?.condition || "")}
                    </span>
                    <p className="text-xs text-muted-foreground">
                      {run.weather?.temperature}°C
                    </p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-primary/10">
                    <p className="text-xs text-muted-foreground">Coach</p>
                    <p className="text-sm font-bold text-primary">
                      {run.coachScore}
                    </p>
                  </div>
                </div>
              </div>

              {/* Notes preview */}
              {run.notes && (
                <p className="text-sm text-muted-foreground mt-3 line-clamp-1 italic">
                  &ldquo;{run.notes}&rdquo;
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detail Slider */}
      {selectedRun && (
        <DetailSlider
          open={!!selectedRun}
          onOpenChange={(open) => !open && setSelectedRun(null)}
          title={selectedRun.route || "Run Details"}
          subtitle={new Date(selectedRun.date).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
          badges={[
            { label: selectedRun.trainingLoad || "easy", variant: selectedRun.trainingLoad === "hard" ? "warning" : selectedRun.trainingLoad === "moderate" ? "default" : "success" },
            { label: `Effort: ${selectedRun.effort}/10` },
            { label: selectedRun.indoor ? "Indoor" : "Outdoor", variant: "secondary" },
          ]}
          fields={[
            { label: "Distance", value: `${selectedRun.distance} km`, icon: <MapPin className="h-3 w-3" /> },
            { label: "Duration", value: formatDuration(selectedRun.duration), icon: <Clock className="h-3 w-3" /> },
            { label: "Pace", value: `${formatPace(selectedRun.pace)} /km`, icon: <Zap className="h-3 w-3" /> },
            { label: "Avg Heart Rate", value: `${selectedRun.avgHeartRate} bpm`, icon: <Heart className="h-3 w-3" /> },

            { label: "Cadence", value: `${selectedRun.cadence} spm` },
            { label: "Power", value: `${selectedRun.power} W` },
            { label: "Elevation", value: `${selectedRun.elevation} m` },
            { label: "Calories", value: `${selectedRun.calories} kcal` },
            { label: "Mood Before", value: "⭐".repeat(selectedRun.moodBefore || 0) },
            { label: "Mood After", value: "⭐".repeat(selectedRun.moodAfter || 0) },
            { label: "Shoes", value: selectedRun.shoeId === "shoe_1" ? "Nike Pegasus 42" : "Asics Novablast 5" },
            { label: "Temperature", value: `${selectedRun.weather?.temperature}°C`, icon: <Thermometer className="h-3 w-3" /> },
            { label: "Humidity", value: `${selectedRun.weather?.humidity}%`, icon: <Droplets className="h-3 w-3" /> },
            { label: "Feels Like", value: `${selectedRun.weather?.feelsLike}°C` },
            { label: "Wind", value: `${selectedRun.weather?.windSpeed} km/h`, icon: <Wind className="h-3 w-3" /> },
            { label: "AQI", value: `${selectedRun.weather?.aqi}` },
            { label: "Condition", value: `${getWeatherEmoji(selectedRun.weather?.condition || "")} ${selectedRun.weather?.condition}` },
            { label: "Recovery Score", value: `${selectedRun.recoveryScore}/10` },
            { label: "Coach Score", value: `${selectedRun.coachScore}/10` },
          ]}
        >
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">🤖 AI Analysis</h4>
              <p className="text-sm text-muted-foreground leading-relaxed bg-muted p-3 rounded-lg">
                {selectedRun.aiAnalysis}
              </p>
            </div>
            {selectedRun.notes && (
              <div>
                <h4 className="text-sm font-medium mb-2">📝 Personal Notes</h4>
                <p className="text-sm text-muted-foreground">{selectedRun.notes}</p>
              </div>
            )}
          </div>
        </DetailSlider>
      )}
    </div>
  );
}
