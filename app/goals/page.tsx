"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { DetailSlider } from "@/components/shared/detail-slider";
import { mockGoals, mockBodyMeasurements } from "@/lib/mock-data";
import { Target, Plus, Calendar, TrendingDown, ArrowRight } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

const weightProgressData = [
  { date: "Jun W1", weight: 78.5 },
  { date: "Jun W2", weight: 78 },
  { date: "Jun W3", weight: 77.8 },
  { date: "Jun W4", weight: 77.5 },
  { date: "Jul W1", weight: 77 },
  { date: "Jul W2", weight: 76.5 },
  { date: "Jul W3", weight: 76.2 },
  { date: "Jul W4", weight: 76 },
];

function getGoalProgress(goal: typeof mockGoals[0]): number {
  if (goal.category === "weight") {
    const startWeight = 78.5;
    const lost = startWeight - goal.current;
    const totalToLose = startWeight - goal.target;
    return Math.min(100, Math.round((lost / totalToLose) * 100));
  }
  if (goal.category === "pace") {
    const startPace = 7.1;
    const improved = startPace - goal.current;
    const totalToImprove = startPace - goal.target;
    return Math.min(100, Math.round((improved / totalToImprove) * 100));
  }
  return Math.min(100, Math.round((goal.current / goal.target) * 100));
}

function getEstimatedFinish(goal: typeof mockGoals[0]): string {
  const progress = getGoalProgress(goal);
  if (progress >= 100) return "Completed!";
  if (progress <= 0) return "Not started";

  const daysActive = 40; // approximate
  const daysPerPercent = daysActive / progress;
  const remainingPercent = 100 - progress;
  const daysRemaining = Math.round(remainingPercent * daysPerPercent);

  const finishDate = new Date();
  finishDate.setDate(finishDate.getDate() + daysRemaining);
  return finishDate.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export default function GoalsPage() {
  const [selectedGoal, setSelectedGoal] = React.useState<typeof mockGoals[0] | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Target className="h-8 w-8 text-primary" />
            Goals
          </h1>
          <p className="text-muted-foreground mt-1">
            Track your targets and see estimated completion dates.
          </p>
        </div>
      </div>

      {/* Goal Cards */}
      <div className="grid gap-6">
        {mockGoals.map((goal) => {
          const progress = getGoalProgress(goal);
          const estimatedFinish = getEstimatedFinish(goal);

          return (
            <Card
              key={goal.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedGoal(goal)}
            >
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold">{goal.title}</h3>
                      <Badge variant={progress >= 75 ? "success" : progress >= 50 ? "default" : "secondary"}>
                        {progress}%
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">{goal.current} {goal.unit}</span>
                      <ArrowRight className="h-3 w-3" />
                      <span className="font-medium text-primary">{goal.target} {goal.unit}</span>
                    </div>

                    <Progress value={progress} className="h-3" />

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Deadline: {goal.deadline ? new Date(goal.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "None"}
                      </span>
                      <span className="flex items-center gap-1">
                        <TrendingDown className="h-3 w-3" />
                        Est. Finish: {estimatedFinish}
                      </span>
                    </div>
                  </div>

                  {/* Mini visualization */}
                  <div className="w-full md:w-48 h-16">
                    <div className="relative h-full flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-3xl font-bold text-primary">{progress}%</p>
                        <p className="text-xs text-muted-foreground">complete</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Weight Goal Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Weight Loss Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weightProgressData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="date" className="text-xs" />
              <YAxis domain={[64, 80]} className="text-xs" />
              <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
              <ReferenceLine y={65} stroke="hsl(160, 60%, 45%)" strokeDasharray="5 5" label={{ value: "Goal: 65 kg", position: "right" }} />
              <Line type="monotone" dataKey="weight" stroke="hsl(221.2, 83.2%, 53.3%)" strokeWidth={2} dot={{ fill: "hsl(221.2, 83.2%, 53.3%)" }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Detail Slider */}
      {selectedGoal && (
        <DetailSlider
          open={!!selectedGoal}
          onOpenChange={(open) => !open && setSelectedGoal(null)}
          title={selectedGoal.title}
          subtitle={`${selectedGoal.category} goal`}
          badges={[
            { label: `${getGoalProgress(selectedGoal)}% complete`, variant: getGoalProgress(selectedGoal) >= 75 ? "success" : "default" },
            { label: selectedGoal.status, variant: selectedGoal.status === "active" ? "default" : "success" },
          ]}
          fields={[
            { label: "Category", value: selectedGoal.category },
            { label: "Current", value: `${selectedGoal.current} ${selectedGoal.unit}` },
            { label: "Target", value: `${selectedGoal.target} ${selectedGoal.unit}` },
            { label: "Progress", value: `${getGoalProgress(selectedGoal)}%` },
            { label: "Deadline", value: selectedGoal.deadline ? new Date(selectedGoal.deadline).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "No deadline" },
            { label: "Estimated Finish", value: getEstimatedFinish(selectedGoal) },
            { label: "Status", value: selectedGoal.status },
            { label: "Remaining", value: selectedGoal.category === "weight" ? `${(selectedGoal.current - selectedGoal.target).toFixed(1)} ${selectedGoal.unit} to go` : `${(selectedGoal.target - selectedGoal.current).toFixed(1)} ${selectedGoal.unit} to go` },
          ]}
        >
          <div>
            <h4 className="text-sm font-medium mb-2">Weekly Progress</h4>
            <p className="text-sm text-muted-foreground">
              {selectedGoal.category === "weight"
                ? "You're losing an average of 0.5 kg per week. At this rate, you'll reach your goal weight by early 2027."
                : `You're making steady progress toward your ${selectedGoal.title} goal.`
              }
            </p>
          </div>
        </DetailSlider>
      )}
    </div>
  );
}
