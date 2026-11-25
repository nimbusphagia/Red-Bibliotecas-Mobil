import type { NavItem } from "@/features/navigation/navigation";
import { Icon } from "@/features/shared/components";
import { cn, navActive, useTone } from "@/features/shared/theme";
import { Link } from "expo-router";
import { Pressable } from "react-native";

type Props = {
  item: NavItem;
  active: boolean;
};

/** Se dibuja sobre un Surface dark: inactivo = su inset. El activo va en claro. */
export function SidebarItem({ item, active }: Props) {
  const t = useTone();
  const box = active ? navActive.box : t.inset;
  return (
    <Link href={item.href} asChild>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={item.label}
        accessibilityState={{ selected: active }}
        className={cn("flex items-center justify-center rounded-xl p-2.5", box)}
      >
        <Icon
          icon={item.icon}
          size="xl"
          stroke="sm"
          tone={active ? navActive.icon : t.icon}
        />
      </Pressable>
    </Link>
  );
}
