"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, User, Database, Upload, CheckCircle, Loader2, FileText, FolderOpen } from "lucide-react";
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
  const [exportFile, setExportFile] = React.useState<File | null>(null);
  const [gpxFiles, setGpxFiles] = React.useState<File[]>([]);

  const handleExportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.name.endsWith(".xml")) {
      setExportFile(file);
      setError(null);
    } else if (file) {
      setError("Please select an XML file (export.xml).");
    }
  };

  const handleGpxFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const gpx = Array.from(files).filter((f) => f.name.endsWith(".gpx"));
      setGpxFiles(gpx);
      setError(null);
    }
  };

  const handleSync = async () => {
    if (!exportFile) {
      setError("Please select your export.xml file first.");
      return;
    }

    setSyncing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("exportFile", exportFile);
      gpxFiles.forEach((file) => {
        formData.append("gpxFiles", file);
      });

      const res = await fetch("/api/import/sync", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
      } else {
        setStats(data.stats);
        setLastSync(new Date().toLocaleString());
      }
    } catch {
      setError("Failed to connect. Please try again.");
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
            Upload your Apple Health export to sync all workout data. Extract the ZIP from Apple Health, then upload the files below.
          </p>

          {/* Export XML Upload */}
          <div className="p-4 border rounded-lg space-y-3">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <p className="font-medium text-sm">Step 1: Select export.xml</p>
            </div>
            <div className="flex items-center gap-3">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".xml"
                  onChange={handleExportFileChange}
                  className="hidden"
                />
                <span className="inline-flex items-center gap-2 px-4 py-2 border rounded-md text-sm hover:bg-muted transition-colors">
                  <Upload className="h-4 w-4" />
                  Choose File
                </span>
              </label>
              {exportFile && (
                <span className="text-sm text-green-600 flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" />
                  {exportFile.name} ({(exportFile.size / (1024 * 1024)).toFixed(0)} MB)
                </span>
              )}
            </div>
          </div>

          {/* GPX Files Upload */}
          <div className="p-4 border rounded-lg space-y-3">
            <div className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
              <p className="font-medium text-sm">Step 2: Select GPX route files (optional)</p>
            </div>
            <p className="text-xs text-muted-foreground">
              Select all .gpx files from the <code className="bg-muted px-1 rounded">workout-routes</code> folder for GPS data.
            </p>
            <div className="flex items-center gap-3">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".gpx"
                  multiple
                  onChange={handleGpxFilesChange}
                  className="hidden"
                />
                <span className="inline-flex items-center gap-2 px-4 py-2 border rounded-md text-sm hover:bg-muted transition-colors">
                  <Upload className="h-4 w-4" />
                  Choose GPX Files
                </span>
              </label>
              {gpxFiles.length > 0 && (
                <span className="text-sm text-green-600 flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" />
                  {gpxFiles.length} GPX files selected
                </span>
              )}
            </div>
          </div>

          {/* Sync Button */}
          <div className="p-4 border rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Full Data Sync</p>
                <p className="text-xs text-muted-foreground">
                  Imports all workouts, heart rate, GPS routes, cadence, power, weather, stride, and more.
                </p>
              </div>
              <Button onClick={handleSync} disabled={syncing || !exportFile}>
                {syncing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
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
            <p className="font-medium">How to export from Apple Health:</p>
            <p>1. Open the Health app on your iPhone</p>
            <p>2. Tap your profile → Export All Health Data</p>
            <p>3. Extract the ZIP file on your computer</p>
            <p>4. Upload <strong>export.xml</strong> above</p>
            <p>5. Optionally select all files from the <strong>workout-routes</strong> folder</p>
          </div>

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
