"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { DetailSlider } from "@/components/shared/detail-slider";
import { mockShoes } from "@/lib/mock-data";
import { Footprints, Plus, AlertTriangle } from "lucide-react";

export default function ShoesPage() {
  const [selectedShoe, setSelectedShoe] = React.useState<typeof mockShoes[0] | null>(null);

  const totalDistance = mockShoes.reduce((sum, s) => sum + s.currentDistance, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Footprints className="h-8 w-8 text-primary" />
            Shoe Tracking
          </h1>
          <p className="text-muted-foreground mt-1">
            Track mileage on every pair. Know when to retire them.
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Active Shoes</p>
            <p className="text-2xl font-bold">{mockShoes.filter(s => !s.retired).length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Total Distance (all shoes)</p>
            <p className="text-2xl font-bold">{totalDistance} km</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Nearing Retirement</p>
            <p className="text-2xl font-bold text-orange-500">
              {mockShoes.filter(s => s.currentDistance / s.retireAt > 0.75).length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Shoe Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {mockShoes.map((shoe) => {
          const percentUsed = Math.round((shoe.currentDistance / shoe.retireAt) * 100);
          const remaining = shoe.retireAt - shoe.currentDistance;
          const isWarning = percentUsed > 75;

          return (
            <Card
              key={shoe.id}
              className={`cursor-pointer hover:shadow-md transition-shadow ${isWarning ? "border-orange-300" : ""}`}
              onClick={() => setSelectedShoe(shoe)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{shoe.brand} {shoe.model}</CardTitle>
                  {isWarning && (
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{shoe.notes}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Shoe image */}
                <div className="h-48 rounded-lg flex items-center justify-center overflow-hidden p-2">
                  {shoe.imageUrl ? (
                    <img src={shoe.imageUrl} alt={`${shoe.brand} ${shoe.model}`} className="h-full w-full object-contain" />
                  ) : (
                    <span className="text-4xl">👟</span>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Distance</span>
                    <span className="font-medium">{shoe.currentDistance} / {shoe.retireAt} km</span>
                  </div>
                  <Progress
                    value={percentUsed}
                    className={`h-2 ${isWarning ? "[&>div]:bg-orange-500" : ""}`}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{percentUsed}% used</span>
                    <span>{remaining} km remaining</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <Badge variant={isWarning ? "warning" : "success"}>
                    {isWarning ? "Nearing Retirement" : "Good Condition"}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Since {new Date(shoe.purchaseDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Detail Slider */}
      {selectedShoe && (
        <DetailSlider
          open={!!selectedShoe}
          onOpenChange={(open) => !open && setSelectedShoe(null)}
          title={`${selectedShoe.brand} ${selectedShoe.model}`}
          subtitle={selectedShoe.notes || "Running shoe"}
          badges={[
            { label: selectedShoe.retired ? "Retired" : "Active", variant: selectedShoe.retired ? "destructive" : "success" },
            { label: `${Math.round((selectedShoe.currentDistance / selectedShoe.retireAt) * 100)}% used` },
          ]}
          fields={[
            { label: "Brand", value: selectedShoe.brand },
            { label: "Model", value: selectedShoe.model },
            { label: "Purchase Date", value: new Date(selectedShoe.purchaseDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) },
            { label: "Current Distance", value: `${selectedShoe.currentDistance} km` },
            { label: "Expected Lifetime", value: `${selectedShoe.expectedLifetime} km` },
            { label: "Retire At", value: `${selectedShoe.retireAt} km` },
            { label: "Remaining", value: `${selectedShoe.retireAt - selectedShoe.currentDistance} km` },
            { label: "Status", value: selectedShoe.retired ? "Retired" : "Active" },
          ]}
        >
          <div>
            <h4 className="text-sm font-medium mb-2">Mileage Progress</h4>
            <Progress
              value={Math.round((selectedShoe.currentDistance / selectedShoe.retireAt) * 100)}
              className="h-3"
            />
            <p className="text-xs text-muted-foreground mt-2 text-center">
              {selectedShoe.currentDistance} / {selectedShoe.retireAt} km
            </p>
          </div>
        </DetailSlider>
      )}
    </div>
  );
}
