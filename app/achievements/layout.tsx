import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Achievements",
  description:
    "Celebrate your running milestones — badges, personal records, and streaks earned through consistent training.",
  openGraph: {
    title: "Achievements | FitJournal",
    description: "Your running achievements, badges, and personal records.",
  },
};

export default function AchievementsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
