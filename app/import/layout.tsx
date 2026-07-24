import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Import",
  description:
    "Import your Apple Health running data — upload export.xml and sync workouts, heart rate, GPS routes, and more.",
  openGraph: {
    title: "Import Data | FitJournal",
    description: "Import Apple Health data to sync all your running workouts.",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function ImportLayout({ children }: { children: React.ReactNode }) {
  return children;
}
