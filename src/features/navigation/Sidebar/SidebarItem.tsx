import type { NavItem } from "@/features/navigation/navigation";
import { Icon } from "@/features/shared/components";
import { Link } from "expo-router";
import { Pressable } from "react-native";

type Props = {
  item: NavItem;
  active: boolean;
};

export function SidebarItem({ item, active }: Props) {
  const [iconColor, bgColor, activeClass] = active
    ? ["bg" as const, "bg-primary", "shadow-md shadow-highlight/80 opacity-100"]
    : ["primary" as const, "bg-fg1", "shadow-none opacity-100"];
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
        <Icon icon={item.icon} size="lg" tone={iconColor} />
      </Pressable>
    </Link>
  );
}
