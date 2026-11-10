import type { Href } from "expo-router";
import {
  House,
  LibraryBig,
  LucideIcon,
  PackageSearch,
  Tickets,
  User,
} from "lucide-react-native";

export type NavItem = {
  key: string;
  label: string;
  href: Href;
  icon: LucideIcon;
};

export const NAV_ITEMS: NavItem[] = [
  { key: "dashboard", label: "Inicio", href: "/dashboard", icon: House },
  { key: "catalog", label: "Libros", href: "/catalog", icon: LibraryBig },
  { key: "loans", label: "Prestamos", href: "/loans", icon: Tickets },
  { key: "stock", label: "Inventario", href: "/stock", icon: PackageSearch },
  { key: "account", label: "Usuario", href: "/account", icon: User },
];
