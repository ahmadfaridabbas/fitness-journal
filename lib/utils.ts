import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPace(minutesPerKm: number): string {
  if (!Number.isFinite(minutesPerKm) || minutesPerKm <= 0) return "—";
  const totalSeconds = Math.round(minutesPerKm * 60);
  return `${Math.floor(totalSeconds / 60)}:${String(totalSeconds % 60).padStart(2, "0")}`;
}

export function formatDuration(minutes: number): string {
  if (!Number.isFinite(minutes) || minutes < 0) return "—";
  const rounded = Math.round(minutes);
  const hours = Math.floor(rounded / 60);
  const mins = rounded % 60;
  if (hours === 0) return `${mins}m`;
  return `${hours}h ${mins}m`;
}

export function formatDistance(km: number): string {
  return km.toFixed(2) + " km";
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

export function calculateBMI(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return Number((weightKg / (heightM * heightM)).toFixed(1));
}

export function calculateCaloriesBurned(
  distanceKm: number,
  weightKg: number,
): number {
  return Math.round(distanceKm * weightKg * 1.036);
}

export function getWeatherEmoji(condition: string): string {
  const map: Record<string, string> = {
    clear: "☀️",
    sunny: "☀️",
    cloudy: "☁️",
    rain: "🌧️",
    storm: "⛈️",
    fog: "🌫️",
    hot: "🔥",
    cold: "❄️",
    windy: "💨",
    humid: "💧",
  };
  return map[condition.toLowerCase()] || "🌤️";
}
