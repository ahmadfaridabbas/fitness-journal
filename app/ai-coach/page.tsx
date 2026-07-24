"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DetailSlider } from "@/components/shared/detail-slider";
import { allRuns as mockRuns } from "@/lib/mock-data";
import { formatPace } from "@/lib/utils";
import { Brain, Heart, Zap, TrendingUp, AlertCircle, CheckCircle2 } from "lucide-react";

const coachInsights = [
  {
    id: "insight_1",
    type: "summary",
    title: "Weekly Training Summary",
    content: "You ran 3 times this week covering 13.0 km. Your average pace improved by 3% compared to last week. Training load is balanced between easy and moderate efforts.",
    score: 9.2,
    date: "2026-07-24",
  },
  {
    id: "insight_2",
    type: "recommendation",
    title: "Next Workout Suggestion",
    content: "Tomorrow: Easy 4-5 km recovery run. Keep heart rate below 140 bpm. Your body needs recovery after today's effort. Consider running early morning (before 6 AM) to avoid peak heat.",
    score: null,
    date: "2026-07-24",
  },
  {
    id: "insight_3",
    type: "observation",
    title: "Heat Adaptation Progress",
    content: "Your body is adapting to Lahore's summer heat. Despite temperatures averaging 33°C this week, your cardiac drift has decreased by 15% compared to June. Continue gradual exposure.",
    score: null,
    date: "2026-07-23",
  },
  {
    id: "insight_4",
    type: "warning",
    title: "AQI Alert",
    content: "Air quality has been consistently above 150 this week. Consider indoor alternatives on days when AQI exceeds 170. Your respiratory efficiency drops 8% above AQI 160.",
    score: null,
    date: "2026-07-22",
  },
  {
    id: "insight_5",
    type: "milestone",
    title: "AI Memory Timeline",
    content: "This is your fastest average pace in the past 2 weeks. Your average heart rate has dropped by 5 bpm since you started in June. Today's conditions were hotter than your July average, yet your pace improved. You're building a strong aerobic base.",
    score: null,
    date: "2026-07-24",
  },
];

const trainingLoadData = {
  weeklyLoad: 65,
  recommendation: "Moderate - add one more easy run",
  riskLevel: "low",
  recoveryStatus: "good",
  readiness: 8.5,
};

export default function AICoachPage() {
  const [selectedRun, setSelectedRun] = React.useState<typeof mockRuns[0] | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Brain className="h-8 w-8 text-primary" />
          AI Coach
        </h1>
        <p className="text-muted-foreground mt-1">
          Every run is analyzed. Here&apos;s what your AI coach has to say.
        </p>
      </div>

      {/* Training Status */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Today&apos;s Readiness</p>
            <p className="text-3xl font-bold text-green-600">{trainingLoadData.readiness}/10</p>
            <Badge variant="success" className="mt-2">Ready to Train</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Weekly Load</p>
            <p className="text-3xl font-bold">{trainingLoadData.weeklyLoad}%</p>
            <Progress value={trainingLoadData.weeklyLoad} className="mt-2 h-2" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Recovery Status</p>
            <p className="text-3xl font-bold text-green-600">Good</p>
            <p className="text-xs text-muted-foreground mt-1">Fully recovered</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Injury Risk</p>
            <p className="text-3xl font-bold text-green-600">Low</p>
            <p className="text-xs text-muted-foreground mt-1">All clear</p>
          </CardContent>
        </Card>
      </div>

      {/* Coach Insights */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Coach Insights</h2>
        {coachInsights.map((insight) => (
          <Card
            key={insight.id}
            className={`border-l-4 ${
              insight.type === "warning" ? "border-l-yellow-500" :
              insight.type === "milestone" ? "border-l-purple-500" :
              insight.type === "recommendation" ? "border-l-blue-500" :
              "border-l-green-500"
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  {insight.type === "warning" && <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />}
                  {insight.type === "summary" && <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />}
                  {insight.type === "recommendation" && <Zap className="h-5 w-5 text-blue-500 mt-0.5" />}
                  {insight.type === "observation" && <TrendingUp className="h-5 w-5 text-green-500 mt-0.5" />}
                  {insight.type === "milestone" && <Brain className="h-5 w-5 text-purple-500 mt-0.5" />}
                  <div>
                    <h3 className="font-medium">{insight.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                      {insight.content}
                    </p>
                  </div>
                </div>
                {insight.score && (
                  <Badge variant="default" className="ml-4 shrink-0">
                    {insight.score}/10
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-2 ml-8">
                {new Date(insight.date).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Per-Run Analysis */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Run-by-Run Analysis</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {mockRuns.slice(0, 4).map((run) => (
            <Card
              key={run.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedRun(run)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{run.route}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        (run.coachScore || 0) >= 9.5 ? "success" :
                        (run.coachScore || 0) >= 9.0 ? "default" :
                        "secondary"
                      }
                    >
                      {run.coachScore}/10
                    </Badge>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(run.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  {" • "}{run.distance} km{" • "}{formatPace(run.pace)} /km
                </p>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {run.aiAnalysis}
                </p>
                <div className="flex gap-2 mt-3">
                  <Badge variant="outline">
                    <Heart className="h-3 w-3 mr-1" />
                    {run.avgHeartRate} bpm
                  </Badge>
                  <Badge variant="outline">Recovery: {run.recoveryScore}/10</Badge>
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
          title={`AI Analysis: ${selectedRun.route}`}
          subtitle={new Date(selectedRun.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
          badges={[
            { label: `Coach: ${selectedRun.coachScore}/10`, variant: "success" },
            { label: `Recovery: ${selectedRun.recoveryScore}/10` },
            { label: selectedRun.trainingLoad || "easy", variant: selectedRun.trainingLoad === "hard" ? "warning" : "secondary" },
          ]}
          fields={[
            { label: "Distance", value: `${selectedRun.distance} km` },
            { label: "Duration", value: `${selectedRun.duration} min` },
            { label: "Pace", value: `${formatPace(selectedRun.pace)} /km` },
            { label: "Avg Heart Rate", value: `${selectedRun.avgHeartRate} bpm` },

            { label: "Temperature", value: `${selectedRun.weather?.temperature}°C` },
            { label: "Humidity", value: `${selectedRun.weather?.humidity}%` },
            { label: "AQI", value: `${selectedRun.weather?.aqi}` },
          ]}
        >
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">🤖 Full AI Analysis</h4>
              <p className="text-sm text-muted-foreground leading-relaxed bg-muted p-4 rounded-lg">
                {selectedRun.aiAnalysis}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-2">📊 Training Breakdown</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-muted rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">Training Load</p>
                  <p className="text-sm font-medium capitalize">{selectedRun.trainingLoad}</p>
                </div>
                <div className="p-3 bg-muted rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">Recovery Score</p>
                  <p className="text-sm font-medium">{selectedRun.recoveryScore}/10</p>
                </div>
              </div>
            </div>
          </div>
        </DetailSlider>
      )}
    </div>
  );
}
