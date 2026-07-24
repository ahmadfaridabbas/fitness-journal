import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shoes",
  description:
    "Manage your running shoes — track mileage, rotation, and know when it's time for a replacement.",
  openGraph: {
    title: "Shoe Tracker | FitJournal",
    description: "Track your running shoe mileage and rotation schedule.",
  },
};

export default function ShoesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
