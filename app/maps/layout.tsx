import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Route Maps",
  description:
    "Visualize your running routes on an interactive map — GPS tracks, elevation profiles, and pace heatmaps.",
  openGraph: {
    title: "Route Maps | FitJournal",
    description: "Explore your running routes with interactive GPS maps and elevation data.",
  },
};

export default function MapsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
