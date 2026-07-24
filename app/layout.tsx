import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { ThemeToggle } from "@/components/layout/theme-toggle";

const inter = Inter({ subsets: ["latin"] });

const SITE_URL = "https://ahmadfaridfitness.netlify.app";

export const metadata: Metadata = {
  title: {
    default: "FitJournal - Personal Fitness Analytics & Running Tracker",
    template: "%s | FitJournal",
  },
  description:
    "Track your runs, monitor heart rate, GPS routes, cadence, and get AI coaching insights. Your all-in-one personal fitness analytics platform with Apple Health integration.",
  keywords: [
    "fitness tracker",
    "running journal",
    "run analytics",
    "heart rate tracking",
    "GPS running",
    "Apple Health",
    "fitness analytics",
    "AI coach",
    "running pace",
    "workout tracker",
    "cadence tracker",
    "personal fitness",
  ],
  authors: [{ name: "Ahmad Farid Abbas" }],
  creator: "Ahmad Farid Abbas",
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "FitJournal",
    title: "FitJournal - Personal Fitness Analytics & Running Tracker",
    description:
      "Track your runs, monitor heart rate, GPS routes, cadence, and get AI coaching insights. Your all-in-one personal fitness analytics platform.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "FitJournal - Personal Fitness Analytics Dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FitJournal - Personal Fitness Analytics & Running Tracker",
    description:
      "Track your runs, monitor heart rate, GPS routes, cadence, and get AI coaching insights.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider>
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto">
              <div className="container mx-auto p-6 lg:p-8 max-w-7xl">
                <div className="flex justify-end mb-4">
                  <ThemeToggle />
                </div>
                {children}
              </div>
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
