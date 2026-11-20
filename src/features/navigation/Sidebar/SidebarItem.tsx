import type { NavItem } from "@/features/navigation/navigation";
import { Button, Icon } from "@/features/shared/components";
import { Link } from "expo-router";
import { Pressable } from "react-native";

type Props = {
  item: NavItem;
  active: boolean;
};

export function SidebarItem({ item, active }: Props) {
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
        className={`flex items-center justify-center 
                    rounded-xl p-2 
                    ${bgColor} ${activeClass}`}
      >
        <Icon icon={item.icon} size="lg" tone={iconColor} />
      </Pressable>
    </Link>
  );
}
