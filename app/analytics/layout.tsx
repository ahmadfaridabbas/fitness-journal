import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analytics",
  description:
    "Deep dive into your running performance — pace trends, distance charts, heart rate zones, and training insights.",
  openGraph: {
    title: "Analytics | FitJournal",
    description: "Detailed running analytics with pace, distance, heart rate, and performance trends.",
  },
};

export default function AnalyticsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
