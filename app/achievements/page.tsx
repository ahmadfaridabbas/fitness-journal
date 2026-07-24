"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DetailSlider } from "@/components/shared/detail-slider";
import { mockAchievements } from "@/lib/mock-data";
import { Trophy, Lock } from "lucide-react";

const tierColors: Record<string, string> = {
  bronze: "border-orange-400 bg-orange-50",
  silver: "border-gray-400 bg-gray-50",
  gold: "border-yellow-400 bg-yellow-50",
  platinum: "border-blue-400 bg-blue-50",
  diamond: "border-cyan-400 bg-cyan-50",
  crown: "border-purple-400 bg-purple-50",
};

const tierBadgeColors: Record<string, "default" | "secondary" | "success" | "warning"> = {
  bronze: "warning",
  silver: "secondary",
  gold: "success",
  platinum: "default",
  diamond: "default",
  crown: "default",
};

export default function AchievementsPage() {
  const [selectedAchievement, setSelectedAchievement] = React.useState<typeof mockAchievements[0] | null>(null);

  const unlocked = mockAchievements.filter((a) => a.dateUnlocked);
  const inProgress = mockAchievements.filter((a) => !a.dateUnlocked);

  const categories = ["all", "distance", "streak", "weather", "heartRate"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Trophy className="h-8 w-8 text-yellow-500" />
            Achievements
          </h1>
          <p className="text-muted-foreground mt-1">
            Gamify your fitness journey. Unlock badges and climb the ranks.
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold">{unlocked.length}/{mockAchievements.length}</p>
          <p className="text-sm text-muted-foreground">Unlocked</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4 text-center">
            <span className="text-3xl">🏆</span>
            <p className="text-sm font-medium mt-1">Total Unlocked</p>
            <p className="text-2xl font-bold">{unlocked.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <span className="text-3xl">🔥</span>
            <p className="text-sm font-medium mt-1">Streak Badges</p>
            <p className="text-2xl font-bold">1</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <span className="text-3xl">📏</span>
            <p className="text-sm font-medium mt-1">Distance Badges</p>
            <p className="text-2xl font-bold">2</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <span className="text-3xl">🌞</span>
            <p className="text-sm font-medium mt-1">Weather Badges</p>
            <p className="text-2xl font-bold">1</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          {categories.map((cat) => (
            <TabsTrigger key={cat} value={cat} className="capitalize">
              {cat === "heartRate" ? "Heart Rate" : cat}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category} value={category} className="space-y-6">
            {/* Unlocked */}
            <div>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Unlocked
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {unlocked
                  .filter((a) => category === "all" || a.category === category)
                  .map((achievement) => (
                    <Card
                      key={achievement.id}
                      className={`cursor-pointer hover:shadow-md transition-all border-2 ${tierColors[achievement.tier]}`}
                      onClick={() => setSelectedAchievement(achievement)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{achievement.icon}</span>
                          <div className="flex-1">
                            <h3 className="font-semibold">{achievement.title}</h3>
                            <p className="text-xs text-muted-foreground">{achievement.description}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant={tierBadgeColors[achievement.tier]} className="capitalize">
                                {achievement.tier}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {achievement.dateUnlocked && new Date(achievement.dateUnlocked).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>

            {/* In Progress */}
            <div>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Lock className="h-5 w-5 text-muted-foreground" />
                In Progress
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {inProgress
                  .filter((a) => category === "all" || a.category === category)
                  .map((achievement) => (
                    <Card
                      key={achievement.id}
                      className="cursor-pointer hover:shadow-md transition-all opacity-80"
                      onClick={() => setSelectedAchievement(achievement)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl grayscale">{achievement.icon}</span>
                          <div className="flex-1">
                            <h3 className="font-semibold">{achievement.title}</h3>
                            <p className="text-xs text-muted-foreground">{achievement.description}</p>
                            <div className="mt-2 space-y-1">
                              <div className="flex justify-between text-xs">
                                <span>{achievement.current} / {achievement.target}</span>
                                <span>{achievement.progress}%</span>
                              </div>
                              <Progress value={achievement.progress || 0} className="h-2" />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Achievement Detail Slider */}
      {selectedAchievement && (
        <DetailSlider
          open={!!selectedAchievement}
          onOpenChange={(open) => !open && setSelectedAchievement(null)}
          title={`${selectedAchievement.icon} ${selectedAchievement.title}`}
          subtitle={selectedAchievement.description}
          badges={[
            { label: selectedAchievement.tier, variant: tierBadgeColors[selectedAchievement.tier] },
            { label: selectedAchievement.category },
            selectedAchievement.dateUnlocked
              ? { label: "Unlocked", variant: "success" as const }
              : { label: "In Progress", variant: "secondary" as const },
          ]}
          fields={[
            { label: "Category", value: selectedAchievement.category },
            { label: "Tier", value: selectedAchievement.tier },
            { label: "Progress", value: `${selectedAchievement.progress}%` },
            { label: "Current", value: `${selectedAchievement.current}` },
            { label: "Target", value: `${selectedAchievement.target}` },
            ...(selectedAchievement.dateUnlocked
              ? [{ label: "Unlocked On", value: new Date(selectedAchievement.dateUnlocked).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }) }]
              : []),
          ]}
        >
          <div>
            <h4 className="text-sm font-medium mb-2">Progress</h4>
            <Progress value={selectedAchievement.progress || 0} className="h-3" />
            <p className="text-xs text-muted-foreground mt-2 text-center">
              {selectedAchievement.current} / {selectedAchievement.target} ({selectedAchievement.progress}%)
            </p>
          </div>
        </DetailSlider>
      )}
    </div>
  );
}
