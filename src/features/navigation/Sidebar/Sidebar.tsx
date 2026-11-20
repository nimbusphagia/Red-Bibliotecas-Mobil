import { NAVBAR } from "@/features/navigation/navigation";
import { Href, usePathname } from "expo-router";
import { View } from "react-native";
import { SidebarItem } from "./SidebarItem";
import { cn } from "@/features/shared/theme";

export const SIDEBAR_WIDTH = 80;

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: Href): boolean => {
    const base = String(href);
    return pathname === base || pathname.startsWith(base + "/");
  };
  return (
    <View
      className={cn(
        `w-[${SIDEBAR_WIDTH}]`,
        " flex-col items-center justify-between p-[8] py-[12] pt-[30]",
      )}
    >
      <View className="flex-1 justify-between">
        {NAVBAR.main.map((item) => {
          const active = isActive(item.href);
          return <SidebarItem key={item.key} item={item} active={active} />;
        })}
      </View>
      <View className="h-[120] justify-end">
        {NAVBAR.footer.map((item) => {
          return (
            <SidebarItem
              key={item.key}
              item={item}
              active={isActive(item.href)}
            />
          );
        })}
      </View>
    </View>
  );
}
