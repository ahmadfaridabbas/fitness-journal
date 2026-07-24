import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Goals",
  description:
    "Set and track your fitness goals — weekly mileage, pace targets, and personal bests.",
  openGraph: {
    title: "Goals | FitJournal",
    description: "Set fitness goals and track your progress toward personal bests.",
  },
};

export default function GoalsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
