import { NAVBAR } from "@/features/navigation/navigation";
import { Href, usePathname } from "expo-router";
import { View } from "react-native";
import { SIDEBAR_WIDTH } from "./constants";
import { SidebarItem } from "./SidebarItem";
import { Surface } from "@/features/shared/components";

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: Href): boolean => {
    const base = String(href);
    return pathname === base || pathname.startsWith(base + "/");
  };
  return (
    <View
      className="flex-col items-center justify-between pl-4 pr-2 pt-4 pb-10"
      style={{ width: SIDEBAR_WIDTH }}
    >
      <Surface tone="dark" className="gap-6 px-4 py-5">
        {NAVBAR.main.map((item) => {
          const active = isActive(item.href);
          return <SidebarItem key={item.key} item={item} active={active} />;
        })}
      </Surface>
      <Surface tone="dark" className="px-4 py-4">
        {NAVBAR.footer.map((item) => {
          return (
            <SidebarItem
              key={item.key}
              item={item}
              active={isActive(item.href)}
            />
          );
        })}
      </Surface>
    </View>
  );
}
