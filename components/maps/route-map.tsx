"use client";

import React from "react";

interface RouteMapProps {
  coordinates: number[][]; // [lng, lat, elevation]
  width?: number;
  height?: number;
  strokeColor?: string;
  className?: string;
}

/**
 * Renders GPS route data as an SVG path.
 * No external map library needed — just plots the route shape.
 */
export function RouteMap({
  coordinates,
  width = 400,
  height = 300,
  strokeColor = "#3b82f6",
  className = "",
}: RouteMapProps) {
  if (!coordinates || coordinates.length < 2) {
    return (
      <div className={`flex items-center justify-center bg-muted rounded-lg ${className}`} style={{ width, height }}>
        <p className="text-sm text-muted-foreground">No route data</p>
      </div>
    );
  }

  // Extract lat/lng bounds
  const lngs = coordinates.map((c) => c[0]);
  const lats = coordinates.map((c) => c[1]);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);

  // Add padding
  const padding = 20;
  const innerW = width - padding * 2;
  const innerH = height - padding * 2;

  const lngRange = maxLng - minLng || 0.001;
  const latRange = maxLat - minLat || 0.001;

  // Scale coordinates to SVG space
  const points = coordinates.map((c) => {
    const x = padding + ((c[0] - minLng) / lngRange) * innerW;
    // Flip Y axis (lat increases upward)
    const y = padding + (1 - (c[1] - minLat) / latRange) * innerH;
    return `${x},${y}`;
  });

  const pathD = `M ${points.join(" L ")}`;

  // Start and end points
  const start = points[0].split(",");
  const end = points[points.length - 1].split(",");

  return (
    <svg
      width={width}
      height={height}
      className={`bg-muted/30 rounded-lg ${className}`}
      viewBox={`0 0 ${width} ${height}`}
    >
      {/* Route path */}
      <path
        d={pathD}
        fill="none"
        stroke={strokeColor}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.8"
      />
      {/* Start marker */}
      <circle cx={start[0]} cy={start[1]} r="5" fill="#22c55e" stroke="white" strokeWidth="2" />
      {/* End marker */}
      <circle cx={end[0]} cy={end[1]} r="5" fill="#ef4444" stroke="white" strokeWidth="2" />
    </svg>
  );
}
