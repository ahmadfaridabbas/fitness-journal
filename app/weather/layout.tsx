import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Weather",
  description:
    "See how weather affects your performance — temperature, humidity, and conditions correlated with your runs.",
  openGraph: {
    title: "Weather Impact | FitJournal",
    description: "Analyze how weather conditions impact your running performance.",
  },
};

export default function WeatherLayout({ children }: { children: React.ReactNode }) {
  return children;
}
