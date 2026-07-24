"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DetailSlider } from "@/components/shared/detail-slider";
import { allRuns as mockRuns } from "@/lib/mock-data";
import { formatPace } from "@/lib/utils";
import { Map, MapPin, Route } from "lucide-react";
import { RouteMap } from "@/components/maps/route-map";

export default function MapsPage() {
  const [selectedRun, setSelectedRun] = React.useState<typeof mockRuns[0] | null>(null);

  // Filter runs that have route data
  const runsWithRoutes = mockRuns.filter(
    (r) => r.routeData && r.routeData.coordinates && r.routeData.coordinates.length > 2
  );

  const totalDistance = runsWithRoutes.reduce((s, r) => s + r.distance, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Map className="h-8 w-8 text-primary" />
          Maps & Routes
        </h1>
        <p className="text-muted-foreground mt-1">
          {runsWithRoutes.length} routes from your Apple Health data • {totalDistance.toFixed(0)} km total
        </p>
      </div>

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
            <p className="text-2xl font-bold">{(totalDistance / runsWithRoutes.length).toFixed(1)} km</p>
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
                      {new Date(run.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{formatPace(run.pace)}</p>
                    <Badge variant="outline" className="text-xs">{run.trainingLoad}</Badge>
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
          subtitle={new Date(selectedRun.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
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
