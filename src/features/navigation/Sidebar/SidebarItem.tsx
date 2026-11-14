import type { NavItem } from "@/features/navigation/navigation";
import { colors } from "@/features/shared/theme";
import { Link } from "expo-router";
import { Pressable } from "react-native";

type Props = {
  item: NavItem;
  active: boolean;
};

export function SidebarItem({ item, active }: Props) {
  const [iconColor, bgColor, activeClass] = active
    ? [colors.fg1, "bg-highlight", "shadow-md shadow-highlight/80 opacity-100"]
    : [colors.highlight, "bg-fg2 border border-fg1", "shadow-none opacity-100"];
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
        <item.icon color={iconColor} strokeWidth={1.5} />
      </Pressable>
    </Link>
  );
}
