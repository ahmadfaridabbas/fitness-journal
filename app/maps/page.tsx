"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DetailSlider } from "@/components/shared/detail-slider";
import { useFitness } from "@/components/fitness/provider";
import { Workout, displayDate } from "@/lib/fitness";
import { PageHeader, Empty } from "@/components/fitness/ui";
import { formatPace } from "@/lib/utils";
import { RouteMap } from "@/components/maps/route-map";

export default function MapsPage() {
  const { workouts: mockRuns } = useFitness();
  const [selectedRun, setSelectedRun] = React.useState<Workout | null>(null);

  // Filter runs that have route data
  const runsWithRoutes = mockRuns.filter(
    (r) =>
      r.routeData &&
      r.routeData.coordinates &&
      r.routeData.coordinates.length > 2,
  );

  const totalDistance = runsWithRoutes.reduce((s, r) => s + r.distance, 0);

  return (
    <div className="fitness-page">
      <PageHeader
        title="A record of where you’ve been"
        description="Explore the GPS routes attached to your workouts."
        eyebrow="EXPLORE / ROUTES"
      />
      {!runsWithRoutes.length && (
        <Empty
          title="No GPS routes yet"
          description="Import GPX route files with your Apple Health workouts to see them here."
        />
      )}

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Routes Mapped</p>
            <p className="text-2xl font-bold">{runsWithRoutes.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Total Distance</p>
            <p className="text-2xl font-bold">{totalDistance.toFixed(1)} km</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Avg per Run</p>
            <p className="text-2xl font-bold">
              {(runsWithRoutes.length
                ? totalDistance / runsWithRoutes.length
                : 0
              ).toFixed(1)}{" "}
              km
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Route Grid */}
      <div>
        <h2 className="text-xl font-semibold mb-4">All Routes</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {runsWithRoutes.map((run) => (
            <Card
              key={run.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              role="button"
              tabIndex={0}
              aria-label={`View route for ${displayDate(run.date)}`}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setSelectedRun(run);
                }
              }}
              onClick={() => setSelectedRun(run)}
            >
              <CardContent className="p-4">
                <RouteMap
                  coordinates={run.routeData!.coordinates}
                  width={350}
                  height={200}
                  className="w-full mb-3"
                />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{run.distance} km</p>
                    <p className="text-xs text-muted-foreground">
                      {displayDate(run.date)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {formatPace(run.pace)}
                    </p>
                    <Badge variant="outline" className="text-xs">
                      {run.trainingLoad}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Detail Slider */}
      {selectedRun && (
        <DetailSlider
          open={!!selectedRun}
          onOpenChange={(open) => !open && setSelectedRun(null)}
          title={`${selectedRun.distance} km Run`}
          subtitle={displayDate(selectedRun.date)}
          badges={[
            { label: `${selectedRun.distance} km` },
            { label: formatPace(selectedRun.pace) },
          ]}
          fields={[
            { label: "Distance", value: `${selectedRun.distance} km` },
            { label: "Duration", value: `${selectedRun.duration} min` },
            { label: "Pace", value: `${formatPace(selectedRun.pace)} /km` },
            { label: "Elevation", value: `${selectedRun.elevation || 0} m` },
            { label: "Calories", value: `${selectedRun.calories} kcal` },
            { label: "Training Load", value: selectedRun.trainingLoad || "—" },
          ]}
        />
      )}
    </div>
  );
}
