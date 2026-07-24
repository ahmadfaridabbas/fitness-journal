"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DetailSlider } from "@/components/shared/detail-slider";
import { mockBodyMeasurements } from "@/lib/mock-data";
import { User, Camera, TrendingDown, Ruler } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const timelineData = mockBodyMeasurements.map((m) => ({
  date: new Date(m.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  weight: m.weight,
  waist: m.waist,
  chest: m.chest,
  arms: m.arms,
  bodyFat: m.bodyFat,
})).reverse();

export default function BodyPage() {
  const [selectedEntry, setSelectedEntry] = React.useState<typeof mockBodyMeasurements[0] | null>(null);
  const [sliderValue, setSliderValue] = React.useState(0);

  const current = mockBodyMeasurements[0];
  const earliest = mockBodyMeasurements[mockBodyMeasurements.length - 1];

  const changes = {
    weight: (current.weight! - earliest.weight!).toFixed(1),
    waist: (current.waist! - earliest.waist!).toFixed(1),
    bodyFat: (current.bodyFat! - earliest.bodyFat!).toFixed(1),
    restingHR: current.restingHR! - earliest.restingHR!,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <User className="h-8 w-8 text-primary" />
          Body Transformation
        </h1>
        <p className="text-muted-foreground mt-1">
          Track your physical changes over time. Slide to compare.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Weight Change</p>
            <p className="text-2xl font-bold text-green-600">{changes.weight} kg</p>
            <TrendingDown className="h-4 w-4 mx-auto mt-1 text-green-600" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Waist Change</p>
            <p className="text-2xl font-bold text-green-600">{changes.waist} cm</p>
            <TrendingDown className="h-4 w-4 mx-auto mt-1 text-green-600" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Body Fat Change</p>
            <p className="text-2xl font-bold text-green-600">{changes.bodyFat}%</p>
            <TrendingDown className="h-4 w-4 mx-auto mt-1 text-green-600" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Resting HR Change</p>
            <p className="text-2xl font-bold text-green-600">{changes.restingHR} bpm</p>
            <TrendingDown className="h-4 w-4 mx-auto mt-1 text-green-600" />
          </CardContent>
        </Card>
      </div>

      {/* Timeline Comparison Slider */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Timeline Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{new Date(earliest.date).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span>
              <span>{new Date(current.date).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span>
            </div>

            {/* Slider */}
            <input
              type="range"
              min={0}
              max={mockBodyMeasurements.length - 1}
              value={sliderValue}
              onChange={(e) => setSliderValue(Number(e.target.value))}
              className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
              aria-label="Timeline slider"
            />

            {/* Selected Entry Display */}
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">
                  {new Date(mockBodyMeasurements[mockBodyMeasurements.length - 1 - sliderValue].date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                </h4>
                <Badge variant="outline">Entry {sliderValue + 1}/{mockBodyMeasurements.length}</Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Weight</p>
                  <p className="text-lg font-bold">{mockBodyMeasurements[mockBodyMeasurements.length - 1 - sliderValue].weight} kg</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Waist</p>
                  <p className="text-lg font-bold">{mockBodyMeasurements[mockBodyMeasurements.length - 1 - sliderValue].waist} cm</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Body Fat</p>
                  <p className="text-lg font-bold">{mockBodyMeasurements[mockBodyMeasurements.length - 1 - sliderValue].bodyFat}%</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Resting HR</p>
                  <p className="text-lg font-bold">{mockBodyMeasurements[mockBodyMeasurements.length - 1 - sliderValue].restingHR} bpm</p>
                </div>
              </div>
            </div>

            {/* Photo placeholder */}
            <div className="grid grid-cols-2 gap-4">
              <div className="aspect-[3/4] rounded-lg bg-muted border-2 border-dashed flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <Camera className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm">Before Photo</p>
                  <p className="text-xs">June 2026</p>
                </div>
              </div>
              <div className="aspect-[3/4] rounded-lg bg-muted border-2 border-dashed flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <Camera className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm">Current Photo</p>
                  <p className="text-xs">July 2026</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Measurements Chart */}
      <Card>
        <CardHeader>
          <CardTitle>All Measurements Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="date" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
              <Legend />
              <Line type="monotone" dataKey="weight" stroke="hsl(221.2, 83.2%, 53.3%)" strokeWidth={2} name="Weight (kg)" />
              <Line type="monotone" dataKey="waist" stroke="hsl(30, 80%, 55%)" strokeWidth={2} name="Waist (cm)" />
              <Line type="monotone" dataKey="chest" stroke="hsl(160, 60%, 45%)" strokeWidth={2} name="Chest (cm)" />
              <Line type="monotone" dataKey="bodyFat" stroke="hsl(280, 65%, 60%)" strokeWidth={2} name="Body Fat %" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Timeline Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ruler className="h-5 w-5" />
            Measurement History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2 font-medium">Date</th>
                  <th className="text-center py-3 px-2 font-medium">Weight</th>
                  <th className="text-center py-3 px-2 font-medium">Waist</th>
                  <th className="text-center py-3 px-2 font-medium">Chest</th>
                  <th className="text-center py-3 px-2 font-medium">Arms</th>
                  <th className="text-center py-3 px-2 font-medium">Body Fat</th>
                  <th className="text-center py-3 px-2 font-medium">BMI</th>
                </tr>
              </thead>
              <tbody>
                {mockBodyMeasurements.map((entry, index) => (
                  <tr
                    key={index}
                    className="border-b cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => setSelectedEntry(entry)}
                  >
                    <td className="py-3 px-2">
                      {new Date(entry.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </td>
                    <td className="text-center py-3 px-2 font-medium">{entry.weight} kg</td>
                    <td className="text-center py-3 px-2">{entry.waist} cm</td>
                    <td className="text-center py-3 px-2">{entry.chest} cm</td>
                    <td className="text-center py-3 px-2">{entry.arms} cm</td>
                    <td className="text-center py-3 px-2">{entry.bodyFat}%</td>
                    <td className="text-center py-3 px-2">{entry.bmi}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Detail Slider */}
      {selectedEntry && (
        <DetailSlider
          open={!!selectedEntry}
          onOpenChange={(open) => !open && setSelectedEntry(null)}
          title="Body Measurements"
          subtitle={new Date(selectedEntry.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
          fields={[
            { label: "Weight", value: `${selectedEntry.weight} kg` },
            { label: "Waist", value: `${selectedEntry.waist} cm` },
            { label: "Chest", value: `${selectedEntry.chest} cm` },
            { label: "Arms", value: `${selectedEntry.arms} cm` },
            { label: "Body Fat", value: `${selectedEntry.bodyFat}%` },
            { label: "BMI", value: `${selectedEntry.bmi}` },
            { label: "Resting HR", value: `${selectedEntry.restingHR} bpm` },
            { label: "Sleep", value: `${selectedEntry.sleep} hours` },
            { label: "Water Intake", value: `${selectedEntry.water} L` },
          ]}
        />
      )}
    </div>
  );
}
