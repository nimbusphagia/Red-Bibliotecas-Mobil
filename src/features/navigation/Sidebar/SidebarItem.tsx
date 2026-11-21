import type { NavItem } from "@/features/navigation/navigation";
import { Icon } from "@/features/shared/components";
import { cn } from "@/features/shared/theme";
import { Link } from "expo-router";
import { Pressable } from "react-native";

type Props = {
  item: NavItem;
  active: boolean;
  standalone?: boolean;
};

export function SidebarItem({ item, active, standalone = false }: Props) {
  const specialClass = standalone ? "bg-dark1 text-white" : "";
  const [iconColor, bgColor, activeClass] = active
    ? [
        "dark1" as const,
        "bg-white",
        "shadow-md shadow-highlight/80 opacity-100",
      ]
    : ["white" as const, "bg-dark2", "shadow-none opacity-100"];
  return (
    <Link href={item.href} asChild>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={item.label}
        accessibilityState={{ selected: active }}
        className={cn(
          "flex items-center justify-center rounded-xl p-2",
          bgColor,
          activeClass,
          specialClass,
        )}
      >
        <Icon icon={item.icon} size="lg" stroke="sm" tone={iconColor} />
      </Pressable>
    </Link>
  );
}
