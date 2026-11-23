import type { NavItem } from "@/features/navigation/navigation";
import { Icon } from "@/features/shared/components";
import { cn, useTone } from "@/features/shared/theme";
import { Link } from "expo-router";
import { Pressable } from "react-native";

type Props = {
  item: NavItem;
  active: boolean;
  standalone?: boolean;
};

/** Se dibuja sobre un Surface dark: inactivo = su inset (o su superficie si va solo). El activo usa el acento. */
export function SidebarItem({ item, active, standalone = false }: Props) {
  const t = useTone();
  const box = active ? t.accent.box : standalone ? t.surface : t.inset;
  return (
    <Link href={item.href} asChild>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={item.label}
        accessibilityState={{ selected: active }}
        className={cn("flex items-center justify-center rounded-xl p-2", box)}
      >
        <Icon
          icon={item.icon}
          size="xl"
          stroke="sm"
          tone={active ? "dark1" : t.icon}
        />
      </Pressable>
    </Link>
  );
}
