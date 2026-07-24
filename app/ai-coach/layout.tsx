import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Coach",
  description:
    "Get personalized AI coaching insights — training recommendations, recovery tips, and performance predictions.",
  openGraph: {
    title: "AI Coach | FitJournal",
    description: "AI-powered coaching insights and personalized training recommendations.",
  },
};

export default function AICoachLayout({ children }: { children: React.ReactNode }) {
  return children;
}
