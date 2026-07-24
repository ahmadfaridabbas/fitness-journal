import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings",
  description:
    "Manage your FitJournal profile, Apple Health data import, and app preferences.",
  openGraph: {
    title: "Settings | FitJournal",
    description: "Manage your profile and data import settings.",
  },
};

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
