"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Activity,
  LayoutDashboard,
  BookOpen,
  ChartNoAxesCombined,
  Target,
  Trophy,
  Scale,
  Footprints,
  CloudSun,
  Map,
  FileText,
  Settings,
  Upload,
  Menu,
  ArrowUpRight,
  Brain,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useFitness } from "@/components/fitness/provider";
const groups = [
  {
    title: "WORKSPACE",
    items: [
      ["/dashboard", "Overview", LayoutDashboard],
      ["/journal", "Workout journal", BookOpen],
      ["/analytics", "Analytics", ChartNoAxesCombined],
    ],
  },
  {
    title: "YOUR PROGRESS",
    items: [
      ["/goals", "Goals", Target],
      ["/achievements", "Milestones", Trophy],
      ["/body", "Body & weight", Scale],
    ],
  },
  {
    title: "EXPLORE",
    items: [
      ["/maps", "Routes", Map],
      ["/shoes", "Gear", Footprints],
      ["/weather", "Weather", CloudSun],
      ["/reports", "Reports", FileText],
      ["/ai-coach", "Training insights", Brain],
    ],
  },
] as const;
export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { data } = useFitness();
  function content() {
    return (
      <>
        <Link
          href="/dashboard"
          className="brand"
          onClick={() => setOpen(false)}
        >
          <span>
            <Activity size={23} />
          </span>
          FitJournal<span className="brand-dot">.</span>
        </Link>
        <nav aria-label="Main navigation" className="side-nav">
          {groups.map((g) => (
            <div key={g.title} className="nav-group">
              <p>{g.title}</p>
              {g.items.map(([href, label, Icon]) => (
                <Link
                  key={href}
                  href={href}
                  aria-current={pathname === href ? "page" : undefined}
                  onClick={() => setOpen(false)}
                >
                  <Icon size={18} />
                  {label}
                  {pathname === href && <span className="nav-active-dot" />}
                </Link>
              ))}
            </div>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <Link
            className="import-link"
            href="/import"
            onClick={() => setOpen(false)}
          >
            <Upload size={17} />
            Import activities
            <ArrowUpRight size={15} />
          </Link>
          <Link
            className="profile-link"
            href="/settings"
            aria-current={pathname === "/settings" ? "page" : undefined}
            onClick={() => setOpen(false)}
          >
            <span className="avatar">
              {data.name
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")}
            </span>
            <span>
              <strong>{data.name}</strong>
              <small>Personal workspace</small>
            </span>
            <Settings size={17} />
          </Link>
        </div>
      </>
    );
  }
  return (
    <>
      <aside className="desktop-sidebar">{content()}</aside>
      <div className="mobile-nav">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger aria-label="Open navigation menu">
            <Menu size={21} />
          </SheetTrigger>
          <SheetContent side="left" className="mobile-sidebar">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <SheetDescription className="sr-only">
              Your fitness workspace pages
            </SheetDescription>
            {content()}
          </SheetContent>
        </Sheet>
        <Link href="/dashboard">
          FitJournal<span>.</span>
        </Link>
      </div>
    </>
  );
}
