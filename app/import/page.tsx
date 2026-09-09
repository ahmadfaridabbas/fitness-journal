"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, CheckCircle, AlertCircle, Heart, MapPin, Timer, Loader2 } from "lucide-react";

interface ImportedRun {
  id: string;
  date: string;
  distance: number;
  duration: number;
  pace: number;
  avgHeartRate: number | null;
  calories: number;
  hasRoute: boolean;
  routePoints: number;
  trainingLoad: string;
}

interface ImportResult {
  success: boolean;
  imported: number;
  routesAttached?: number;
  gpxProvided?: number;
  runs: ImportedRun[];
  errors?: string[];
}

export default function ImportPage() {
  const [files, setFiles] = React.useState<File[]>([]);
  const [dragOver, setDragOver] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<ImportResult | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  // Keep only the export.xml and any .gpx route files from a selection.
  const collectRelevant = (list: FileList | File[]): File[] => {
    const arr = Array.from(list);
    return arr.filter(
      (f) => f.name.endsWith(".xml") || f.name.toLowerCase().endsWith(".gpx")
    );
  };

  const xmlFile = files.find((f) => f.name.endsWith(".xml")) || null;
  const gpxCount = files.filter((f) => f.name.toLowerCase().endsWith(".gpx")).length;

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const relevant = collectRelevant(e.dataTransfer.files);
    if (relevant.some((f) => f.name.endsWith(".xml"))) {
      setFiles(relevant);
      setError(null);
    } else {
      setError("Please include your export.xml (you can also drop the workout-routes .gpx files).");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const relevant = collectRelevant(e.target.files);
    if (relevant.length === 0) {
      setError("No export.xml or .gpx files found in that selection.");
      return;
    }
    setFiles(relevant);
    setError(null);
  };

  const handleUpload = async () => {
    if (!xmlFile) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", xmlFile);
      for (const f of files) {
        if (f !== xmlFile) formData.append("files", f);
      }

      const response = await fetch("/api/import/apple-health", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Import failed.");
      } else {
        setResult(data);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatPace = (pace: number) => {
    const min = Math.floor(pace);
    const sec = Math.round((pace - min) * 60);
    return `${min}:${sec.toString().padStart(2, "0")} /km`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Upload className="h-8 w-8 text-primary" />
          Import from Apple Health
        </h1>
        <p className="text-muted-foreground mt-1">
          Upload your Apple Health <strong>export.xml</strong> — and optionally the{" "}
          <strong>workout-routes</strong> folder — to import your runs and GPS maps.
        </p>
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">How to export from Apple Health</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>1. Open the <strong>Health</strong> app on your iPhone</p>
          <p>2. Tap your profile picture in the top right</p>
          <p>3. Scroll down and tap <strong>Export All Health Data</strong></p>
          <p>4. Wait for the export to complete and save the ZIP file</p>
          <p>5. Extract the ZIP. It contains <strong>export.xml</strong> and a{" "}
            <strong>workout-routes</strong> folder of <strong>.gpx</strong> files.</p>
          <p>6. Use <strong>Select folder</strong> below and pick the whole{" "}
            <strong>apple_health_export</strong> folder to import runs <em>and</em> GPS routes.
            (Or just pick the export.xml to import runs without maps.)</p>
        </CardContent>
      </Card>

      {/* Upload Area */}
      <Card>
        <CardContent className="p-6">
          <div
            className={`relative border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
              dragOver
                ? "border-primary bg-primary/5"
                : xmlFile
                ? "border-green-500 bg-green-500/5"
                : "border-muted-foreground/25 hover:border-muted-foreground/50"
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            {xmlFile ? (
              <div className="space-y-2">
                <FileText className="h-12 w-12 mx-auto text-green-500" />
                <p className="font-medium">{xmlFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(xmlFile.size / (1024 * 1024)).toFixed(1)} MB
                  {gpxCount > 0 && (
                    <> · {gpxCount} GPS route{gpxCount === 1 ? "" : "s"} (.gpx)</>
                  )}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                <p className="font-medium">Drop your export.xml (or export folder) here</p>
                <p className="text-sm text-muted-foreground">or use the buttons below</p>
              </div>
            )}
          </div>

          {/* File / folder pickers */}
          <div className="mt-4 flex flex-wrap gap-3">
            <label className="inline-flex items-center gap-2 px-3 py-2 rounded-md border text-sm font-medium cursor-pointer hover:bg-accent">
              <FileText className="h-4 w-4" />
              Select export.xml
              <input
                type="file"
                accept=".xml"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
            <label className="inline-flex items-center gap-2 px-3 py-2 rounded-md border text-sm font-medium cursor-pointer hover:bg-accent">
              <Upload className="h-4 w-4" />
              Select folder (with routes)
              <input
                type="file"
                // @ts-expect-error non-standard but widely supported directory upload
                webkitdirectory=""
                directory=""
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-4 flex items-center gap-2 text-red-500 text-sm">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          {/* Upload Button */}
          <div className="mt-4 flex justify-end">
            <Button onClick={handleUpload} disabled={!xmlFile || loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Parsing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Import Workouts
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Successfully imported {result.imported} runs
            </CardTitle>
            {typeof result.routesAttached === "number" && (result.gpxProvided ?? 0) > 0 && (
              <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                <MapPin className="h-3 w-3 text-green-500" />
                Attached {result.routesAttached} GPS route
                {result.routesAttached === 1 ? "" : "s"} from {result.gpxProvided} .gpx file
                {result.gpxProvided === 1 ? "" : "s"}
              </p>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {result.runs.map((run) => (
                <div
                  key={run.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {run.distance.toFixed(2)} km
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {run.trainingLoad}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(run.date)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Timer className="h-3 w-3" />
                      {formatPace(run.pace)}
                    </span>
                    {run.avgHeartRate && (
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        {run.avgHeartRate} bpm
                      </span>
                    )}
                    {run.hasRoute && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-green-500" />
                        {run.routePoints} pts
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {result.errors && result.errors.length > 0 && (
              <div className="mt-4 p-3 bg-yellow-500/10 rounded-lg">
                <p className="text-sm font-medium text-yellow-600">
                  {result.errors.length} warnings:
                </p>
                {result.errors.slice(0, 5).map((err, i) => (
                  <p key={i} className="text-xs text-muted-foreground mt-1">{err}</p>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
