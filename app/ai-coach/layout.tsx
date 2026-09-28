import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Training insights",
  description: "Review calculated observations and recorded workout history.",
  openGraph: {
    title: "Training insights | FitJournal",
    description: "Observations calculated from your workout journal.",
  },
};

export default function AICoachLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
