import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Journal",
  description:
    "Browse your complete running history — every workout with distance, pace, heart rate, and route details.",
  openGraph: {
    title: "Running Journal | FitJournal",
    description: "Your complete running journal with detailed workout history and metrics.",
  },
};

export default function JournalLayout({ children }: { children: React.ReactNode }) {
  return children;
}
