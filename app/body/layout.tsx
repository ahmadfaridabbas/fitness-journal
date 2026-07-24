import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Body Metrics",
  description:
    "Track body measurements — weight, body fat, muscle mass, and physical progress over time.",
  openGraph: {
    title: "Body Metrics | FitJournal",
    description: "Monitor your body composition and physical progress.",
  },
};

export default function BodyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
