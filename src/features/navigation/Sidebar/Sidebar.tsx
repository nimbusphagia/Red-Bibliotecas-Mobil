import { NAVBAR } from "@/features/navigation/navigation";
import { Href, usePathname } from "expo-router";
import { View } from "react-native";
import { SIDEBAR_WIDTH } from "./constants";
import { SidebarItem } from "./SidebarItem";
import { Surface } from "@/features/shared/components";
import { cn } from "@/features/shared/theme";

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
      <Surface tone="dark" className="gap-6 p-3">
        {NAVBAR.main.map((item) => {
          const active = isActive(item.href);
          return <SidebarItem key={item.key} item={item} active={active} />;
        })}
      </Surface>
      <Surface tone="dark">
        {NAVBAR.footer.map((item) => {
          return (
            <SidebarItem
              key={item.key}
              item={item}
              active={isActive(item.href)}
              standalone
            />
          );
        })}
      </Surface>
    </View>
  );
}
