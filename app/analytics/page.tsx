"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { allRuns as mockRuns, mockBodyMeasurements, mockWeatherHistory, mockStats } from "@/lib/mock-data";
import { formatPace } from "@/lib/utils";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ComposedChart,
} from "recharts";

// Prepare chart data
const paceData = mockRuns.map((r) => ({
  date: new Date(r.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  pace: r.pace,
  hr: r.avgHeartRate,
})).reverse();

const distanceData = [
  { week: "Jun W1", distance: 12.5 },
  { week: "Jun W2", distance: 15.2 },
  { week: "Jun W3", distance: 18.0 },
  { week: "Jun W4", distance: 16.5 },
  { week: "Jul W1", distance: 20.3 },
  { week: "Jul W2", distance: 17.8 },
  { week: "Jul W3", distance: 22.1 },
  { week: "Jul W4", distance: 13.0 },
];

const monthlyDistance = [
  { month: "May", distance: 25 },
  { month: "Jun", distance: 62 },
  { month: "Jul", distance: 74.6 },
];

const bodyData = mockBodyMeasurements.map((m) => ({
  date: new Date(m.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  weight: m.weight,
  bodyFat: m.bodyFat,
  restingHR: m.restingHR,
})).reverse();

const weightData = mockBodyMeasurements.map((m) => ({
  date: new Date(m.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  weight: m.weight,
  waist: m.waist,
})).reverse();

const heatData = mockWeatherHistory.map((w) => ({
  temperature: w.temperature,
  pace: w.avgPace,
  humidity: w.humidity,
  hr: w.avgHR,
  date: new Date(w.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
}));

const performanceVsWeather = mockWeatherHistory.map((w) => ({
  date: new Date(w.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  temperature: w.temperature,
  humidity: w.humidity,
  pace: w.avgPace,
  hr: w.avgHR,
})).reverse();

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Deep dive into your performance data.
        </p>
      </div>

      <Tabs defaultValue="running" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="running">Running</TabsTrigger>
          <TabsTrigger value="fitness">Fitness & Body</TabsTrigger>
          <TabsTrigger value="heat">Heat Analysis</TabsTrigger>
        </TabsList>

        {/* Running Analytics */}
        <TabsContent value="running" className="space-y-6">
          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground">Best Pace</p>
                <p className="text-2xl font-bold">{formatPace(mockStats.bestPace)}</p>
                <p className="text-xs text-muted-foreground">min/km</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground">Longest Run</p>
                <p className="text-2xl font-bold">{mockStats.longestRun}</p>
                <p className="text-xs text-muted-foreground">km</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold">{mockStats.thisMonthDistance}</p>
                <p className="text-xs text-muted-foreground">km</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground">Avg Cadence</p>
                <p className="text-2xl font-bold">171</p>
                <p className="text-xs text-muted-foreground">spm</p>
              </CardContent>
            </Card>
          </div>

          {/* Pace & HR Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Pace & Heart Rate Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={paceData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis yAxisId="pace" domain={[5.5, 7.5]} reversed className="text-xs" label={{ value: 'Pace (min/km)', angle: -90, position: 'insideLeft' }} />
                  <YAxis yAxisId="hr" orientation="right" domain={[120, 180]} className="text-xs" label={{ value: 'HR (bpm)', angle: 90, position: 'insideRight' }} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                  <Legend />
                  <Line yAxisId="pace" type="monotone" dataKey="pace" stroke="hsl(221.2, 83.2%, 53.3%)" strokeWidth={2} name="Pace (min/km)" />
                  <Line yAxisId="hr" type="monotone" dataKey="hr" stroke="hsl(0, 84.2%, 60.2%)" strokeWidth={2} name="Heart Rate (bpm)" />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Weekly & Monthly Distance */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Distance</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={distanceData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="week" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                    <Bar dataKey="distance" fill="hsl(221.2, 83.2%, 53.3%)" radius={[4, 4, 0, 0]} name="Distance (km)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Distance</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={monthlyDistance}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                    <Area type="monotone" dataKey="distance" stroke="hsl(160, 60%, 45%)" fill="hsl(160, 60%, 45%, 0.2)" name="Distance (km)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Calories & Power */}
          <Card>
            <CardHeader>
              <CardTitle>Calories Burned Per Run</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={mockRuns.map(r => ({
                  route: r.route?.split(" ")[0] || "Run",
                  calories: r.calories,
                  distance: r.distance,
                })).reverse()}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="route" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                  <Bar dataKey="calories" fill="hsl(30, 80%, 55%)" radius={[4, 4, 0, 0]} name="Calories" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fitness & Body Analytics */}
        <TabsContent value="fitness" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground">Current Weight</p>
                <p className="text-2xl font-bold">76 kg</p>
                <p className="text-xs text-green-600">-2.5 kg total</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground">BMI</p>
                <p className="text-2xl font-bold">24.8</p>
                <Badge variant="success" className="mt-1">Normal</Badge>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground">Body Fat</p>
                <p className="text-2xl font-bold">22%</p>
                <p className="text-xs text-green-600">-1.5% total</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground">Resting HR</p>
                <p className="text-2xl font-bold">62 bpm</p>
                <p className="text-xs text-green-600">-5 bpm total</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Weight & Body Fat Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={bodyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis yAxisId="weight" domain={[74, 80]} className="text-xs" label={{ value: 'Weight (kg)', angle: -90, position: 'insideLeft' }} />
                  <YAxis yAxisId="bf" orientation="right" domain={[20, 25]} className="text-xs" label={{ value: 'Body Fat %', angle: 90, position: 'insideRight' }} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                  <Legend />
                  <Line yAxisId="weight" type="monotone" dataKey="weight" stroke="hsl(221.2, 83.2%, 53.3%)" strokeWidth={2} name="Weight (kg)" />
                  <Line yAxisId="bf" type="monotone" dataKey="bodyFat" stroke="hsl(30, 80%, 55%)" strokeWidth={2} name="Body Fat %" />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Weight & Waist Measurements</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={weightData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                  <Legend />
                  <Line type="monotone" dataKey="weight" stroke="hsl(221.2, 83.2%, 53.3%)" strokeWidth={2} name="Weight (kg)" />
                  <Line type="monotone" dataKey="waist" stroke="hsl(280, 65%, 60%)" strokeWidth={2} name="Waist (cm)" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resting Heart Rate Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={bodyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis domain={[55, 70]} className="text-xs" />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                  <Area type="monotone" dataKey="restingHR" stroke="hsl(0, 84.2%, 60.2%)" fill="hsl(0, 84.2%, 60.2%, 0.15)" name="Resting HR (bpm)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Heat Analysis - Lahore specific */}
        <TabsContent value="heat" className="space-y-6">
          <Card className="border-orange-200 bg-orange-50/50">
            <CardContent className="p-4">
              <p className="text-sm font-medium text-orange-800">🌡️ Heat Analysis for Lahore</p>
              <p className="text-xs text-orange-600 mt-1">
                Understanding how Lahore&apos;s extreme heat and humidity affect your performance.
              </p>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground">Best Running Temp</p>
                <p className="text-2xl font-bold">27-30°C</p>
                <p className="text-xs text-green-600">Your fastest paces</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground">Worst Conditions</p>
                <p className="text-2xl font-bold">35°C+ / 80%+</p>
                <p className="text-xs text-red-500">HR spikes, pace drops</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground">Heat Adaptation</p>
                <p className="text-2xl font-bold">Improving</p>
                <Badge variant="success" className="mt-1">+8% efficiency</Badge>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Pace vs Temperature</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="temperature" name="Temperature" unit="°C" className="text-xs" label={{ value: 'Temperature (°C)', position: 'insideBottom', offset: -5 }} />
                  <YAxis dataKey="pace" name="Pace" unit=" min/km" domain={[5.5, 7.5]} reversed className="text-xs" label={{ value: 'Pace (min/km)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} cursor={{ strokeDasharray: '3 3' }} />
                  <Scatter data={heatData} fill="hsl(30, 80%, 55%)" />
                </ScatterChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Heart Rate vs Humidity</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="humidity" name="Humidity" unit="%" className="text-xs" label={{ value: 'Humidity (%)', position: 'insideBottom', offset: -5 }} />
                  <YAxis dataKey="hr" name="HR" unit=" bpm" domain={[125, 160]} className="text-xs" label={{ value: 'Heart Rate (bpm)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} cursor={{ strokeDasharray: '3 3' }} />
                  <Scatter data={heatData} fill="hsl(0, 84.2%, 60.2%)" />
                </ScatterChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performance vs Weather Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={performanceVsWeather}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis yAxisId="temp" className="text-xs" label={{ value: 'Temp °C', angle: -90, position: 'insideLeft' }} />
                  <YAxis yAxisId="pace" orientation="right" domain={[5.5, 7.5]} reversed className="text-xs" label={{ value: 'Pace', angle: 90, position: 'insideRight' }} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                  <Legend />
                  <Bar yAxisId="temp" dataKey="temperature" fill="hsl(30, 80%, 55%, 0.4)" name="Temperature (°C)" />
                  <Line yAxisId="pace" type="monotone" dataKey="pace" stroke="hsl(221.2, 83.2%, 53.3%)" strokeWidth={2} name="Pace (min/km)" />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
