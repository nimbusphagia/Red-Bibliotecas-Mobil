import type { NavItem } from "@/config/navigation";
import { Link } from "expo-router";
import { Pressable, Text } from "react-native";
import { colors } from "../../utils";

type Props = {
  item: NavItem;
  active: boolean;
  expanded: boolean;
};

export function SidebarItem({ item, active, expanded }: Props) {
  const [iconColor, bgColor, activeClass] = active
    ? [
        colors.foreground,
        "bg-highlight",
        "shadow-md shadow-highlight/80 opacity-100",
      ]
    : [colors.highlight, "bg-foreground", "shadow-none opacity-100"];
  return (
    <Link href={item.href} asChild>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={item.label}
        accessibilityState={{ selected: active }}
        className={`flex items-center justify-center 
                    rounded-full size-[44] 
                    ${bgColor} ${activeClass}`}
      >
        <item.icon color={iconColor} />
        {expanded && <Text>{item.label}</Text>}
      </Pressable>
    </Link>
  );
}
