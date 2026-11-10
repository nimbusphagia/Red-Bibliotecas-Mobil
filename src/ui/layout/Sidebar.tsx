import { View } from "react-native";
import { usePathname } from "expo-router";
import { NAV_ITEMS } from "@/config/navigation";
import { SidebarItem } from "./SidebarItem";

type Props = {
  expanded: boolean;
};

const WIDTH_EXPANDED = 220;
const WIDTH_RAIL = 72;

export function Sidebar({ expanded }: Props) {
  const pathname = usePathname();

  return (
    <View
      style={{
        width: expanded ? WIDTH_EXPANDED : WIDTH_RAIL,
        padding: 8,
        gap: 4,
      }}
    >
      {NAV_ITEMS.map((item) => {
        const base = String(item.href);
        const active = pathname === base || pathname.startsWith(base + "/");

        return (
          <SidebarItem
            key={item.key}
            item={item}
            active={active}
            expanded={expanded}
          />
        );
      })}
    </View>
  );
}
