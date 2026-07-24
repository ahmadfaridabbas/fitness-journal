"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DetailSlider } from "@/components/shared/detail-slider";
import { mockWeatherHistory, allRuns as mockRuns } from "@/lib/mock-data";
import { getWeatherEmoji, formatPace } from "@/lib/utils";
import { Cloud, Thermometer, Droplets, Wind, Sun, AlertTriangle } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  ComposedChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from "recharts";

const weatherTimeline = mockWeatherHistory.map((w) => ({
  date: new Date(w.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  temperature: w.temperature,
  humidity: w.humidity,
  aqi: w.aqi,
  pace: w.avgPace,
  hr: w.avgHR,
})).reverse();

const temperatureVsPace = mockWeatherHistory.map((w) => ({
  temperature: w.temperature,
  pace: w.avgPace,
}));

const humidityVsHR = mockWeatherHistory.map((w) => ({
  humidity: w.humidity,
  hr: w.avgHR,
}));

const aqiData = mockWeatherHistory.map((w) => ({
  date: new Date(w.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  aqi: w.aqi,
})).reverse();

// Best/worst conditions analysis
const sortedByPace = [...mockWeatherHistory].sort((a, b) => a.avgPace - b.avgPace);
const bestCondition = sortedByPace[0];
const worstCondition = sortedByPace[sortedByPace.length - 1];

export default function WeatherPage() {
  const [selectedWeather, setSelectedWeather] = React.useState<typeof mockWeatherHistory[0] | null>(null);

  const avgTemp = Math.round(mockWeatherHistory.reduce((s, w) => s + w.temperature, 0) / mockWeatherHistory.length);
  const avgHumidity = Math.round(mockWeatherHistory.reduce((s, w) => s + w.humidity, 0) / mockWeatherHistory.length);
  const avgAqi = Math.round(mockWeatherHistory.reduce((s, w) => s + w.aqi, 0) / mockWeatherHistory.length);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Cloud className="h-8 w-8 text-blue-500" />
          Weather Database
        </h1>
        <p className="text-muted-foreground mt-1">
          Every workout&apos;s weather data. Correlate conditions with performance.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="p-4 text-center">
            <Thermometer className="h-5 w-5 mx-auto text-red-500" />
            <p className="text-xs text-muted-foreground mt-1">Avg Temperature</p>
            <p className="text-2xl font-bold">{avgTemp}°C</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Droplets className="h-5 w-5 mx-auto text-blue-500" />
            <p className="text-xs text-muted-foreground mt-1">Avg Humidity</p>
            <p className="text-2xl font-bold">{avgHumidity}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <AlertTriangle className="h-5 w-5 mx-auto text-orange-500" />
            <p className="text-xs text-muted-foreground mt-1">Avg AQI</p>
            <p className="text-2xl font-bold text-orange-500">{avgAqi}</p>
          </CardContent>
        </Card>
        <Card className="border-green-200">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Best Conditions</p>
            <p className="text-lg font-bold text-green-600">{bestCondition.temperature}°C / {bestCondition.humidity}%</p>
            <p className="text-xs text-green-600">Pace: {formatPace(bestCondition.avgPace)}</p>
          </CardContent>
        </Card>
        <Card className="border-red-200">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Worst Conditions</p>
            <p className="text-lg font-bold text-red-500">{worstCondition.temperature}°C / {worstCondition.humidity}%</p>
            <p className="text-xs text-red-500">Pace: {formatPace(worstCondition.avgPace)}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="timeline" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="correlation">Correlations</TabsTrigger>
          <TabsTrigger value="aqi">Air Quality</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        {/* Weather Timeline */}
        <TabsContent value="timeline" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Temperature & Humidity Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={weatherTimeline}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis yAxisId="temp" className="text-xs" label={{ value: '°C', position: 'insideTopLeft' }} />
                  <YAxis yAxisId="humidity" orientation="right" className="text-xs" label={{ value: '%', position: 'insideTopRight' }} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                  <Legend />
                  <Line yAxisId="temp" type="monotone" dataKey="temperature" stroke="hsl(0, 84.2%, 60.2%)" strokeWidth={2} name="Temperature (°C)" />
                  <Line yAxisId="humidity" type="monotone" dataKey="humidity" stroke="hsl(200, 80%, 50%)" strokeWidth={2} name="Humidity (%)" />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Weather vs Performance Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={weatherTimeline}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis yAxisId="temp" className="text-xs" />
                  <YAxis yAxisId="pace" orientation="right" domain={[5.5, 7.5]} reversed className="text-xs" />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                  <Legend />
                  <Area yAxisId="temp" type="monotone" dataKey="temperature" fill="hsl(30, 80%, 55%, 0.2)" stroke="hsl(30, 80%, 55%)" name="Temperature (°C)" />
                  <Line yAxisId="pace" type="monotone" dataKey="pace" stroke="hsl(221.2, 83.2%, 53.3%)" strokeWidth={2} name="Pace (min/km)" />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Correlation Analysis */}
        <TabsContent value="correlation" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Temperature vs Pace</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="temperature" name="Temp" unit="°C" className="text-xs" />
                    <YAxis dataKey="pace" name="Pace" unit=" min/km" domain={[5.5, 7.5]} reversed className="text-xs" />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} cursor={{ strokeDasharray: '3 3' }} />
                    <Scatter data={temperatureVsPace} fill="hsl(30, 80%, 55%)" />
                  </ScatterChart>
                </ResponsiveContainer>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Lower temperature → faster pace. You run best between 27-30°C.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Humidity vs Heart Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="humidity" name="Humidity" unit="%" className="text-xs" />
                    <YAxis dataKey="hr" name="HR" unit=" bpm" domain={[125, 160]} className="text-xs" />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} cursor={{ strokeDasharray: '3 3' }} />
                    <Scatter data={humidityVsHR} fill="hsl(0, 84.2%, 60.2%)" />
                  </ScatterChart>
                </ResponsiveContainer>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Higher humidity → higher heart rate. Your HR increases ~5 bpm per 10% humidity.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* AQI */}
        <TabsContent value="aqi" className="space-y-6">
          <Card className="border-orange-200 bg-orange-50/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="font-medium text-orange-800">Lahore Air Quality Alert</p>
                  <p className="text-xs text-orange-600">AQI has been consistently above 100. Consider indoor running when AQI exceeds 170.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AQI History</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={aqiData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                  <ReferenceLine y={100} stroke="hsl(160, 60%, 45%)" strokeDasharray="3 3" label="Good" />
                  <ReferenceLine y={150} stroke="hsl(30, 80%, 55%)" strokeDasharray="3 3" label="Unhealthy" />
                  <Bar
                    dataKey="aqi"
                    name="AQI"
                    radius={[4, 4, 0, 0]}
                    fill="hsl(30, 80%, 55%)"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Insights */}
        <TabsContent value="insights" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">🌡️ Do you run faster below 30°C?</h3>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-green-600">Yes!</span> Your average pace below 30°C is{" "}
                  <span className="font-medium">6:05 /km</span> vs{" "}
                  <span className="font-medium">6:50 /km</span> above 30°C.
                  That&apos;s a 12% improvement.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">💧 Does humidity affect your heart rate?</h3>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-orange-500">Significantly.</span> At 80%+ humidity,
                  your HR averages 148 bpm vs 140 bpm at 50-60% humidity.
                  That&apos;s 8 bpm higher for the same effort.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">🌅 Best time to run in Lahore summer?</h3>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-blue-600">Early morning (5:30-7:00 AM)</span> when
                  temperatures are 28-30°C. Your performance drops 15% after 9 AM
                  when it exceeds 33°C.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">🏭 Does AQI affect your running?</h3>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-red-500">Yes.</span> Above AQI 160, your average pace
                  drops by 0.3 min/km and perceived effort increases. Consider indoor alternatives on
                  high-AQI days.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Weather History List */}
      <Card>
        <CardHeader>
          <CardTitle>Weather Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {mockWeatherHistory.map((weather, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => setSelectedWeather(weather)}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{getWeatherEmoji(weather.condition)}</span>
                  <div>
                    <p className="font-medium">
                      {new Date(weather.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                    </p>
                    <p className="text-xs text-muted-foreground">{weather.condition}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span>{weather.temperature}°C</span>
                  <span className="text-muted-foreground">{weather.humidity}%</span>
                  <Badge variant={weather.aqi > 150 ? "warning" : "secondary"}>
                    AQI: {weather.aqi}
                  </Badge>
                  <span className="font-medium">{formatPace(weather.avgPace)}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detail Slider */}
      {selectedWeather && (
        <DetailSlider
          open={!!selectedWeather}
          onOpenChange={(open) => !open && setSelectedWeather(null)}
          title={`${getWeatherEmoji(selectedWeather.condition)} Weather Details`}
          subtitle={new Date(selectedWeather.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
          badges={[
            { label: selectedWeather.condition },
            { label: `AQI: ${selectedWeather.aqi}`, variant: selectedWeather.aqi > 150 ? "warning" : "secondary" },
          ]}
          fields={[
            { label: "Temperature", value: `${selectedWeather.temperature}°C`, icon: <Thermometer className="h-3 w-3" /> },
            { label: "Humidity", value: `${selectedWeather.humidity}%`, icon: <Droplets className="h-3 w-3" /> },
            { label: "AQI", value: `${selectedWeather.aqi}` },
            { label: "Condition", value: selectedWeather.condition },
            { label: "Your Pace", value: formatPace(selectedWeather.avgPace) },
            { label: "Your HR", value: `${selectedWeather.avgHR} bpm` },
          ]}
        >
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Performance Impact</h4>
            <p className="text-sm text-muted-foreground">
              {selectedWeather.temperature > 33
                ? "Hot conditions. Your pace was affected. Consider running earlier in the morning."
                : selectedWeather.humidity > 75
                ? "High humidity increased cardiac stress. Good job adapting."
                : "Favorable conditions for running. Your performance was near optimal."
              }
            </p>
          </div>
        </DetailSlider>
      )}
    </div>
  );
}
