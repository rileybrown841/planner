import type { ComponentType } from "react";
import type { Route } from "next";
import {
  BookOpen,
  CalendarDays,
  GraduationCap,
  LayoutDashboard,
  ListChecks,
  Settings,
  Sparkles,
  Wallet,
} from "lucide-react";

export type NavItem = {
  href: Route;
  label: string;
  icon: ComponentType<{ className?: string }>;
  /** Show in the mobile bottom tab bar (space for 5). */
  primary?: boolean;
  /** Extra path prefixes that should also mark this item active. */
  alsoActiveFor?: string[];
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/today", label: "Today", icon: LayoutDashboard, primary: true },
  { href: "/calendar", label: "Calendar", icon: CalendarDays, primary: true },
  { href: "/tasks", label: "Tasks", icon: ListChecks, primary: true },
  { href: "/habits", label: "Habits", icon: Sparkles, primary: true },
  { href: "/budget", label: "Budget", icon: Wallet, primary: true },
  { href: "/exams", label: "Exams & projects", icon: GraduationCap },
  {
    href: "/classes",
    label: "Classes & semesters",
    icon: BookOpen,
    alsoActiveFor: ["/semesters"],
  },
];

export const SECONDARY_NAV_ITEMS: NavItem[] = [
  { href: "/settings", label: "Settings", icon: Settings },
];

export const PRIMARY_NAV_ITEMS = NAV_ITEMS.filter((item) => item.primary);

export function isNavItemActive(pathname: string, item: NavItem): boolean {
  const prefixes = [item.href, ...(item.alsoActiveFor ?? [])];
  return prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}
