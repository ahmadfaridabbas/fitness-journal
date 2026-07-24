import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "View your fitness overview — weekly stats, recent runs, heart rate trends, and training load at a glance.",
  openGraph: {
    title: "Dashboard | FitJournal",
    description: "Your personal fitness dashboard with real-time analytics and progress tracking.",
  },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
