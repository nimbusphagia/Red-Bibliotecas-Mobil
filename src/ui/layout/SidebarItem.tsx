import { Pressable, Text, View } from "react-native";
import { Link } from "expo-router";
import type { NavItem } from "@/config/navigation";

type Props = {
  item: NavItem;
  active: boolean;
  expanded: boolean;
};

export function SidebarItem({ item, active, expanded }: Props) {
  return (
    <Link href={item.href} asChild>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={item.label}
        accessibilityState={{ selected: active }}
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          padding: 12,
          borderRadius: 8,
          opacity: active ? 1 : 0.6,
        }}
      >
        <View style={{ width: 24, alignItems: "center" }}>
          <Text style={{ fontWeight: "700" }}>{item.icon}</Text>
        </View>
        {expanded && <Text>{item.label}</Text>}
      </Pressable>
    </Link>
  );
}
