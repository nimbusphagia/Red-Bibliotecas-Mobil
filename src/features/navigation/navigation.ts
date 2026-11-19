import type { Href } from "expo-router";
import {
  House,
  LibraryBig,
  LucideIcon,
  PackageSearch,
  ShelvingUnit,
  Tags,
  Tickets,
  UserRound,
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
      key: "labels",
      label: "Tejuelos",
      href: "/labels",
      icon: Tags,
    },
    {
      key: "visitors",
      label: "Visitantes",
      href: "/visitors",
      icon: UserRoundGroup,
    },

    {
      key: "stock",
      label: "Inventario",
      href: "/stock",
      icon: PackageSearch,
    },

    {
      key: "shelves",
      label: "Organización",
      href: "/shelves",
      icon: ShelvingUnit,
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
