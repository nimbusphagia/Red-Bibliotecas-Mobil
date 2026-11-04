import type { Href } from "expo-router";

export type NavItem = {
  key: string;
  label: string;
  href: Href;
  icon: string;
};

export const NAV_ITEMS: NavItem[] = [
  { key: "dashboard", label: "Dashboard", href: "/dashboard", icon: "D" },
  { key: "catalog", label: "Catalog", href: "/catalog", icon: "C" },
  { key: "loans", label: "Loans", href: "/loans", icon: "L" },
  { key: "stock", label: "Stock", href: "/stock", icon: "S" },
  { key: "account", label: "Account", href: "/account", icon: "A" },
];
