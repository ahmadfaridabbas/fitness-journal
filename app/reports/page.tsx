"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DetailSlider } from "@/components/shared/detail-slider";
import { mockStats } from "@/lib/mock-data";
import { formatPace } from "@/lib/utils";
import { FileText, Download, Calendar, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const weeklyReport = {
  period: "July 21 - July 27, 2026",
  runs: 3,
  distance: 13.0,
  calories: 1480,
  longestRun: 7.8,
  avgHR: 145,
  avgPace: 6.67,
  consistency: "85%",
  bestPerformance: "7.8 km at 6:40/km pace",
  biggestImprovement: "Pace improved 3% from last week",
  coachComments: "Strong week. Your endurance is building nicely. Consider adding one more easy recovery run to boost weekly volume without adding fatigue.",
};

const monthlyReport = {
  period: "July 2026",
  runs: 14,
  distance: 52.3,
  calories: 4280,
  longestRun: 10.1,
  avgHR: 145,
  avgPace: 6.55,
  consistency: "78%",
  bestPerformance: "10.1 km long run with negative splits",
  biggestImprovement: "Average pace improved from 7:05 to 6:33/km",
  coachComments: "Excellent month of training. You've built a solid aerobic base and your body is adapting to the heat. Weight loss is on track. Keep the momentum going in August.",
  weightChange: -1.5,
  bodyFatChange: -0.8,
};

const dailyBreakdown = [
  { day: "Mon", distance: 5.2, type: "Easy" },
  { day: "Tue", distance: 0, type: "Rest" },
  { day: "Wed", distance: 7.8, type: "Moderate" },
  { day: "Thu", distance: 0, type: "Rest" },
  { day: "Fri", distance: 5.2, type: "Easy" },
  { day: "Sat", distance: 0, type: "Rest" },
  { day: "Sun", distance: 0, type: "Rest" },
];

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = React.useState<"weekly" | "monthly" | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <FileText className="h-8 w-8 text-primary" />
            Reports
          </h1>
          <p className="text-muted-foreground mt-1">
            Auto-generated daily, weekly, monthly, and yearly summaries.
          </p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export PDF
        </Button>
      </div>

      <Tabs defaultValue="weekly" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="daily">Daily</TabsTrigger>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="yearly">Yearly</TabsTrigger>
        </TabsList>

        {/* Daily Report */}
        <TabsContent value="daily" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Today&apos;s Report</CardTitle>
                <Badge>July 24, 2026</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-muted rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">Distance</p>
                  <p className="text-xl font-bold">5.2 km</p>
                </div>
                <div className="p-3 bg-muted rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">Pace</p>
                  <p className="text-xl font-bold">6:44</p>
                </div>
                <div className="p-3 bg-muted rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">Calories</p>
                  <p className="text-xl font-bold">420</p>
                </div>
                <div className="p-3 bg-muted rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">Coach Score</p>
                  <p className="text-xl font-bold text-green-600">9.6</p>
                </div>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="text-sm font-medium mb-1">AI Summary</h4>
                <p className="text-sm text-muted-foreground">
                  Excellent aerobic run today. Despite 84% humidity, your HR stayed controlled at 142 bpm.
                  This shows your heat adaptation is progressing well. Recovery score: 9.5/10.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Weekly Report */}
        <TabsContent value="weekly" className="space-y-6">
          <Card
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setSelectedReport("weekly")}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Weekly Report</CardTitle>
                <Badge variant="outline">{weeklyReport.period}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-muted rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">Runs</p>
                  <p className="text-xl font-bold">{weeklyReport.runs}</p>
                </div>
                <div className="p-3 bg-muted rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">Distance</p>
                  <p className="text-xl font-bold">{weeklyReport.distance} km</p>
                </div>
                <div className="p-3 bg-muted rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">Calories</p>
                  <p className="text-xl font-bold">{weeklyReport.calories}</p>
                </div>
                <div className="p-3 bg-muted rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">Avg Pace</p>
                  <p className="text-xl font-bold">{formatPace(weeklyReport.avgPace)}</p>
                </div>
              </div>

              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={dailyBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="day" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                  <Bar dataKey="distance" fill="hsl(221.2, 83.2%, 53.3%)" radius={[4, 4, 0, 0]} name="Distance (km)" />
                </BarChart>
              </ResponsiveContainer>

              <div className="space-y-3">
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-xs font-medium text-green-800">🏆 Best Performance</p>
                  <p className="text-sm text-green-700">{weeklyReport.bestPerformance}</p>
                </div>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs font-medium text-blue-800">📈 Biggest Improvement</p>
                  <p className="text-sm text-blue-700">{weeklyReport.biggestImprovement}</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs font-medium">🤖 Coach Comments</p>
                  <p className="text-sm text-muted-foreground mt-1">{weeklyReport.coachComments}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Monthly Report */}
        <TabsContent value="monthly" className="space-y-6">
          <Card
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setSelectedReport("monthly")}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>July 2026 Report</CardTitle>
                <Badge variant="success">In Progress</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-muted rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">Runs</p>
                  <p className="text-xl font-bold">{monthlyReport.runs}</p>
                </div>
                <div className="p-3 bg-muted rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">Distance</p>
                  <p className="text-xl font-bold">{monthlyReport.distance} km</p>
                </div>
                <div className="p-3 bg-muted rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">Calories</p>
                  <p className="text-xl font-bold">{monthlyReport.calories}</p>
                </div>
                <div className="p-3 bg-muted rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">Consistency</p>
                  <p className="text-xl font-bold">{monthlyReport.consistency}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-muted rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">Longest Run</p>
                  <p className="text-lg font-bold">{monthlyReport.longestRun} km</p>
                </div>
                <div className="p-3 bg-muted rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">Avg Pace</p>
                  <p className="text-lg font-bold">{formatPace(monthlyReport.avgPace)}</p>
                </div>
                <div className="p-3 bg-muted rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">Weight Change</p>
                  <p className="text-lg font-bold text-green-600">{monthlyReport.weightChange} kg</p>
                </div>
                <div className="p-3 bg-muted rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">Body Fat Change</p>
                  <p className="text-lg font-bold text-green-600">{monthlyReport.bodyFatChange}%</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-xs font-medium text-green-800">🏆 Best Performance</p>
                  <p className="text-sm text-green-700">{monthlyReport.bestPerformance}</p>
                </div>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs font-medium text-blue-800">📈 Biggest Improvement</p>
                  <p className="text-sm text-blue-700">{monthlyReport.biggestImprovement}</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs font-medium">🤖 Coach Comments</p>
                  <p className="text-sm text-muted-foreground mt-1">{monthlyReport.coachComments}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Yearly Report */}
        <TabsContent value="yearly" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>2026 Year in Review</CardTitle>
                <Badge variant="secondary">Partial (Jun-Jul)</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-muted rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">Total Runs</p>
                  <p className="text-xl font-bold">{mockStats.totalRuns}</p>
                </div>
                <div className="p-3 bg-muted rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">Total Distance</p>
                  <p className="text-xl font-bold">{mockStats.totalDistance} km</p>
                </div>
                <div className="p-3 bg-muted rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">Total Calories</p>
                  <p className="text-xl font-bold">{mockStats.totalCalories.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-muted rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">Best Pace</p>
                  <p className="text-xl font-bold">{formatPace(mockStats.bestPace)}</p>
                </div>
              </div>
              <div className="p-4 bg-muted rounded-lg text-center">
                <TrendingUp className="h-8 w-8 mx-auto text-primary mb-2" />
                <p className="text-sm text-muted-foreground">
                  Your journey started in June 2026. By year end, this will be a comprehensive annual review.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Report Detail Slider */}
      {selectedReport && (
        <DetailSlider
          open={!!selectedReport}
          onOpenChange={(open) => !open && setSelectedReport(null)}
          title={selectedReport === "weekly" ? "Weekly Report Details" : "Monthly Report Details"}
          subtitle={selectedReport === "weekly" ? weeklyReport.period : monthlyReport.period}
          badges={[
            { label: selectedReport === "weekly" ? `${weeklyReport.runs} runs` : `${monthlyReport.runs} runs` },
            { label: selectedReport === "weekly" ? `${weeklyReport.distance} km` : `${monthlyReport.distance} km` },
          ]}
          fields={
            selectedReport === "weekly"
              ? [
                  { label: "Total Runs", value: `${weeklyReport.runs}` },
                  { label: "Total Distance", value: `${weeklyReport.distance} km` },
                  { label: "Calories Burned", value: `${weeklyReport.calories}` },
                  { label: "Longest Run", value: `${weeklyReport.longestRun} km` },
                  { label: "Average HR", value: `${weeklyReport.avgHR} bpm` },
                  { label: "Average Pace", value: formatPace(weeklyReport.avgPace) },
                  { label: "Consistency", value: weeklyReport.consistency },
                ]
              : [
                  { label: "Total Runs", value: `${monthlyReport.runs}` },
                  { label: "Total Distance", value: `${monthlyReport.distance} km` },
                  { label: "Calories Burned", value: `${monthlyReport.calories}` },
                  { label: "Longest Run", value: `${monthlyReport.longestRun} km` },
                  { label: "Average HR", value: `${monthlyReport.avgHR} bpm` },
                  { label: "Average Pace", value: formatPace(monthlyReport.avgPace) },
                  { label: "Consistency", value: monthlyReport.consistency },
                  { label: "Weight Change", value: `${monthlyReport.weightChange} kg` },
                  { label: "Body Fat Change", value: `${monthlyReport.bodyFatChange}%` },
                ]
          }
        >
          <div className="space-y-3">
            <div>
              <h4 className="text-sm font-medium mb-1">🤖 Coach Comments</h4>
              <p className="text-sm text-muted-foreground">
                {selectedReport === "weekly" ? weeklyReport.coachComments : monthlyReport.coachComments}
              </p>
            </div>
          </div>
        </DetailSlider>
      )}
    </div>
  );
}
