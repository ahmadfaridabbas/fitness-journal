"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DetailSlider } from "@/components/shared/detail-slider";
import { getGreeting, formatPace, formatDistance } from "@/lib/utils";
import { mockUser, allRuns as mockRuns, mockStats, mockGoals } from "@/lib/mock-data";
import {
  Activity,
  Flame,
  Route,
  Footprints,
  Scale,
  TrendingDown,
  Heart,
  Zap,
  Cloud,
  Brain,
  Target,
  Calendar,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

const weeklyData = [
  { day: "Mon", distance: 5.2, calories: 420 },
  { day: "Tue", distance: 0, calories: 0 },
  { day: "Wed", distance: 7.8, calories: 640 },
  { day: "Thu", distance: 0, calories: 0 },
  { day: "Fri", distance: 5.2, calories: 420 },
  { day: "Sat", distance: 0, calories: 0 },
  { day: "Sun", distance: 0, calories: 0 },
];

const monthlyPaceData = [
  { week: "W1", pace: 7.1 },
  { week: "W2", pace: 6.8 },
  { week: "W3", pace: 6.6 },
  { week: "W4", pace: 6.5 },
];

export default function DashboardPage() {
  const [selectedRun, setSelectedRun] = React.useState<typeof mockRuns[0] | null>(null);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {getGreeting()} {mockUser.name} 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          Here&apos;s your fitness overview for today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Weight</CardTitle>
            <Scale className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.currentWeight} kg</div>
            <p className="text-xs text-green-600">
              <TrendingDown className="inline h-3 w-3 mr-1" />
              {mockStats.weightChange} kg this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <Flame className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.currentStreak} days</div>
            <p className="text-xs text-muted-foreground">
              🔥 Longest: {mockStats.longestStreak} days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Distance</CardTitle>
            <Route className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.totalDistance} km</div>
            <p className="text-xs text-muted-foreground">
              This week: {mockStats.thisWeekDistance} km
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Runs</CardTitle>
            <Footprints className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.totalRuns}</div>
            <p className="text-xs text-muted-foreground">
              This week: {mockStats.thisWeekRuns} runs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Calories</CardTitle>
            <Flame className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.totalCalories.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">burned through running</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Pace</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPace(mockStats.averagePace)}</div>
            <p className="text-xs text-muted-foreground">min/km</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average HR</CardTitle>
            <Heart className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.averageHR} bpm</div>
            <p className="text-xs text-muted-foreground">across all runs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Goal Progress</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">74.6%</div>
            <Progress value={74.6} className="mt-2 h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Weekly Distance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="day" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="distance" fill="hsl(221.2, 83.2%, 53.3%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Monthly Pace Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={monthlyPaceData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="week" className="text-xs" />
                <YAxis className="text-xs" domain={[5.5, 7.5]} reversed />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="pace"
                  stroke="hsl(160, 60%, 45%)"
                  fill="hsl(160, 60%, 45%, 0.2)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Recent Run */}
        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setSelectedRun(mockRuns[0])}
        >
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Recent Run
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Route</span>
              <span className="text-sm font-medium">{mockRuns[0].route}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Distance</span>
              <span className="text-sm font-medium">{mockRuns[0].distance} km</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Pace</span>
              <span className="text-sm font-medium">{formatPace(mockRuns[0].pace)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">HR</span>
              <span className="text-sm font-medium">{mockRuns[0].avgHeartRate} bpm</span>
            </div>
            <Badge variant="success" className="mt-2">
              Coach: {mockRuns[0].coachScore}/10
            </Badge>
          </CardContent>
        </Card>

        {/* AI Insight */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Today&apos;s AI Insight
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {mockRuns[0].aiAnalysis}
            </p>
            <div className="mt-4 p-3 rounded-lg bg-muted">
              <p className="text-xs font-medium">Next Suggested Workout</p>
              <p className="text-sm mt-1">Easy 4-5km recovery run tomorrow. Keep HR below 140 bpm.</p>
            </div>
          </CardContent>
        </Card>

        {/* Current Weather */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Cloud className="h-4 w-4" />
              Current Weather
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-center">
              <span className="text-4xl">💧</span>
              <p className="text-2xl font-bold mt-2">34°C</p>
              <p className="text-sm text-muted-foreground">Feels like 41°C</p>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              <div className="text-center p-2 rounded bg-muted">
                <p className="text-xs text-muted-foreground">Humidity</p>
                <p className="text-sm font-medium">84%</p>
              </div>
              <div className="text-center p-2 rounded bg-muted">
                <p className="text-xs text-muted-foreground">AQI</p>
                <p className="text-sm font-medium text-orange-500">156</p>
              </div>
              <div className="text-center p-2 rounded bg-muted">
                <p className="text-xs text-muted-foreground">Wind</p>
                <p className="text-sm font-medium">12 km/h</p>
              </div>
              <div className="text-center p-2 rounded bg-muted">
                <p className="text-xs text-muted-foreground">Sunrise</p>
                <p className="text-sm font-medium">5:32 AM</p>
              </div>
            </div>
            <p className="text-xs text-center text-muted-foreground mt-2">
              Lahore, Pakistan
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Goal Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Active Goals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {mockGoals.map((goal) => (
              <div key={goal.id} className="space-y-2 p-4 rounded-lg border">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{goal.title}</span>
                  <Badge variant="outline">
                    {goal.current} / {goal.target} {goal.unit}
                  </Badge>
                </div>
                <Progress
                  value={
                    goal.category === "pace"
                      ? ((goal.target / goal.current) * 100)
                      : goal.category === "weight"
                      ? (((78 - goal.current) / (78 - goal.target)) * 100)
                      : ((goal.current / goal.target) * 100)
                  }
                  className="h-2"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detail Slider for Run */}
      {selectedRun && (
        <DetailSlider
          open={!!selectedRun}
          onOpenChange={(open) => !open && setSelectedRun(null)}
          title={selectedRun.route || "Run Details"}
          subtitle={new Date(selectedRun.date).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
          badges={[
            { label: selectedRun.trainingLoad || "easy", variant: selectedRun.trainingLoad === "hard" ? "warning" : "success" },
            { label: `Coach: ${selectedRun.coachScore}/10` },
          ]}
          fields={[
            { label: "Distance", value: `${selectedRun.distance} km` },
            { label: "Duration", value: `${selectedRun.duration} min` },
            { label: "Pace", value: `${formatPace(selectedRun.pace)} /km` },
            { label: "Avg Heart Rate", value: `${selectedRun.avgHeartRate} bpm` },

            { label: "Cadence", value: `${selectedRun.cadence} spm` },
            { label: "Power", value: `${selectedRun.power} W` },
            { label: "Elevation", value: `${selectedRun.elevation} m` },
            { label: "Calories", value: `${selectedRun.calories} kcal` },
            { label: "Effort", value: `${selectedRun.effort}/10` },
            { label: "Mood Before", value: `${selectedRun.moodBefore}/5` },
            { label: "Mood After", value: `${selectedRun.moodAfter}/5` },
            { label: "Temperature", value: `${selectedRun.weather?.temperature}°C` },
            { label: "Humidity", value: `${selectedRun.weather?.humidity}%` },
            { label: "Feels Like", value: `${selectedRun.weather?.feelsLike}°C` },
            { label: "AQI", value: `${selectedRun.weather?.aqi}` },
          ]}
        >
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">AI Analysis</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {selectedRun.aiAnalysis}
              </p>
            </div>
            {selectedRun.notes && (
              <div>
                <h4 className="text-sm font-medium mb-2">Personal Notes</h4>
                <p className="text-sm text-muted-foreground">{selectedRun.notes}</p>
              </div>
            )}
          </div>
        </DetailSlider>
      )}
    </div>
  );
}
