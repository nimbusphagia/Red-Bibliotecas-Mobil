import type { Href } from "expo-router";
import {
  ClipboardClock,
  House,
  LibraryBig,
  LucideIcon,
  NotebookPen,
  ShelvingUnit,
  UserRound,
  Users,
} from "lucide-react-native";

export type NavItem = {
  key: string;
  label: string;
  href: Href;
  icon: LucideIcon;
};
export type Navbar = {
  main: NavItem[];
  footer: NavItem[];
};
export const NAVBAR: Navbar = {
  main: [
    {
      key: "dashboard",
      label: "Inicio",
      href: "/dashboard",
      icon: House,
    },
    {
      key: "catalog",
      label: "Libros",
      href: "/catalog",
      icon: LibraryBig,
    },
    {
      key: "loans",
      label: "Préstamos",
      href: "/loans",
      icon: NotebookPen,
    },
    {
      key: "visitors",
      label: "Visitantes",
      href: "/visitors",
      icon: Users,
    },
    {
      key: "shelves",
      label: "Organización",
      href: "/shelves",
      icon: ShelvingUnit,
    },

    {
      key: "stock",
      label: "Inventario",
      href: "/stock",
      icon: ClipboardClock,
    },
  ],
  footer: [
    {
      key: "account",
      label: "Usuario",
      href: "/account",
      icon: UserRound,
    },
  ],
};
