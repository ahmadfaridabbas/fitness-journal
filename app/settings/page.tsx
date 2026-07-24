"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, User, Database, RefreshCw, CheckCircle, Loader2 } from "lucide-react";
import { mockUser } from "@/lib/mock-data";

interface SyncStats {
  totalRuns: number;
  withHeartRate: number;
  withRoutes: number;
  withWeather: number;
  withCadence: number;
  withPower: number;
  totalDistance: number;
  dateRange: { from: string | null; to: string | null };
}

export default function SettingsPage() {
  const [syncing, setSyncing] = React.useState(false);
  const [stats, setStats] = React.useState<SyncStats | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [lastSync, setLastSync] = React.useState<string | null>(null);

  const handleSync = async () => {
    setSyncing(true);
    setError(null);

    try {
      const res = await fetch("/api/import/sync", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
      } else {
        setStats(data.stats);
        setLastSync(new Date().toLocaleString());
      }
    } catch {
      setError("Failed to connect. Make sure the dev server is running.");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Settings className="h-8 w-8 text-primary" />
          Settings
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your profile and data imports.
        </p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Name</label>
              <p className="text-base font-medium">{mockUser.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Height</label>
              <p className="text-base font-medium">{mockUser.height} cm</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Weight</label>
              <p className="text-base font-medium">{mockUser.weight} kg</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Apple Health Sync */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Apple Health Import
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Sync your Apple Health export data. Place your extracted export at:<br />
            <code className="text-xs bg-muted px-2 py-1 rounded mt-1 inline-block">
              /Users/ahmadfaridabbas/Documents/Fitness Project/Apple Health Export
            </code>
          </p>

          <div className="p-4 border rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Full Data Sync</p>
                <p className="text-xs text-muted-foreground">
                  Imports all workouts, heart rate, GPS routes, cadence, power, weather, stride, and more.
                </p>
              </div>
              <Button onClick={handleSync} disabled={syncing}>
                {syncing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Sync Now
                  </>
                )}
              </Button>
            </div>

            {lastSync && (
              <p className="text-xs text-muted-foreground">Last synced: {lastSync}</p>
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 text-red-500 rounded-lg text-sm">
              {error}
            </div>
          )}

          {stats && (
            <div className="p-4 border border-green-500/30 bg-green-500/5 rounded-lg space-y-3">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Import successful!</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Total Runs</p>
                  <p className="font-bold">{stats.totalRuns}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Total Distance</p>
                  <p className="font-bold">{stats.totalDistance} km</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">With Heart Rate</p>
                  <p className="font-bold">{stats.withHeartRate}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">With GPS Routes</p>
                  <p className="font-bold">{stats.withRoutes}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">With Weather</p>
                  <p className="font-bold">{stats.withWeather}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">With Cadence</p>
                  <p className="font-bold">{stats.withCadence}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">With Power</p>
                  <p className="font-bold">{stats.withPower}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Date Range</p>
                  <p className="font-bold text-xs">{stats.dateRange.from} → {stats.dateRange.to}</p>
                </div>
              </div>
            </div>
          )}

          <div className="text-xs text-muted-foreground space-y-1">
            <p className="font-medium">Data extracted per workout:</p>
            <p>✅ Distance, Duration, Pace, Calories (active + basal)</p>
            <p>✅ Heart Rate (avg, max, min, zones)</p>
            <p>✅ Cadence, Total Steps</p>
            <p>✅ Running Power (avg, max)</p>
            <p>✅ Stride Length, Ground Contact Time, Vertical Oscillation</p>
            <p>✅ Speed (avg, max)</p>
            <p>✅ Elevation Gain</p>
            <p>✅ Weather (temperature, humidity)</p>
            <p>✅ GPS Route (from GPX files)</p>
            <p>✅ Effort Score, Indoor/Outdoor</p>
            <p>✅ Heart Rate Zones</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
