import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reports",
  description:
    "Generate weekly and monthly training reports — mileage summaries, progress charts, and performance breakdowns.",
  openGraph: {
    title: "Reports | FitJournal",
    description: "Weekly and monthly training reports with performance summaries.",
  },
};

export default function ReportsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
