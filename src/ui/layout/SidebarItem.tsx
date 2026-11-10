import { Pressable, Text, View } from "react-native";
import { Link } from "expo-router";
import type { NavItem } from "@/config/navigation";
import { colors } from "../utils";

type Props = {
  item: NavItem;
  active: boolean;
  expanded: boolean;
};

export function SidebarItem({ item, active, expanded }: Props) {
  const [iconColor, bgColor, activeClass] = active
    ? [colors.background, "bg-primary", "shadow-md shadow-black/50 opacity-1"]
    : [colors.highlight, "bg-background", "opacity-[0.9]"];
  return (
    <Link href={item.href} asChild>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={item.label}
        accessibilityState={{ selected: active }}
        className={`flex items-center justify-center 
                    rounded-full size-[46] 
                    ${bgColor} ${activeClass}`}
      >
        <item.icon color={iconColor} />
        {expanded && <Text>{item.label}</Text>}
      </Pressable>
    </Link>
  );
}
