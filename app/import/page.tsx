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
  runs: ImportedRun[];
  errors?: string[];
}

export default function ImportPage() {
  const [file, setFile] = React.useState<File | null>(null);
  const [dragOver, setDragOver] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<ImportResult | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && dropped.name.endsWith(".xml")) {
      setFile(dropped);
      setError(null);
    } else {
      setError("Please drop an XML file.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

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
          Upload your Apple Health export.xml to import all your running data automatically.
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
          <p>5. Extract the ZIP and upload the <strong>export.xml</strong> file below</p>
        </CardContent>
      </Card>

      {/* Upload Area */}
      <Card>
        <CardContent className="p-6">
          <div
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
              dragOver
                ? "border-primary bg-primary/5"
                : file
                ? "border-green-500 bg-green-500/5"
                : "border-muted-foreground/25 hover:border-muted-foreground/50"
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            {file ? (
              <div className="space-y-2">
                <FileText className="h-12 w-12 mx-auto text-green-500" />
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(file.size / (1024 * 1024)).toFixed(1)} MB
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                <p className="font-medium">Drop your export.xml here</p>
                <p className="text-sm text-muted-foreground">or click to browse</p>
              </div>
            )}
            <input
              type="file"
              accept=".xml"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              style={{ position: "absolute" }}
            />
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
            <Button onClick={handleUpload} disabled={!file || loading}>
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
