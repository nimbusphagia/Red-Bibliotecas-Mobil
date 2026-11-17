import type { Href } from "expo-router";
import {
  House,
  LibraryBig,
  LucideIcon,
  PackageSearch,
  ShelvingUnit,
  Tickets,
  User,
  UserRoundGroup,
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
      icon: Tickets,
    },
    {
      key: "visitors",
      label: "Visitantes",
      href: "/visitors",
      icon: UserRoundGroup,
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
      icon: PackageSearch,
    },
  ],
  footer: [
    {
      key: "account",
      label: "Usuario",
      href: "/account",
      icon: User,
    },
  ],
};
