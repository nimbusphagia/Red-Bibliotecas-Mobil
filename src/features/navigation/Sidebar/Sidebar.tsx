import { NAVBAR } from "@/features/navigation/navigation";
import { Href, usePathname } from "expo-router";
import { View } from "react-native";
import { SidebarItem } from "./SidebarItem";
import { cn } from "@/features/shared/theme";

export const SIDEBAR_WIDTH = 70;

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
        "flex-col items-center justify-between p-4",
      )}
    >
      <View className="gap-6 bg-dark1 p-3 rounded-2xl">
        {NAVBAR.main.map((item) => {
          const active = isActive(item.href);
          return <SidebarItem key={item.key} item={item} active={active} />;
        })}
      </View>
      <View className="bg-dark1 rounded-2xl">
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
