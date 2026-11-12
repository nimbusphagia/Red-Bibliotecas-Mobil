import { NAVBAR } from "@/navigation/navigation";
import { Href, usePathname } from "expo-router";
import { View } from "react-native";
import { SidebarItem } from "./SidebarItem";

type Props = {
  expanded: boolean;
};

export function Sidebar({ expanded }: Props) {
  const pathname = usePathname();

  const isActive = (href: Href): boolean => {
    const base = String(href);
    return pathname === base || pathname.startsWith(base + "/");
  };
  return (
    <View
      className="w-[80] flex flex-col items-center justify-between p-[8] pt-[12]
      pb-[10] border-r border-foreground"
    >
      <View className=" gap-[10%]">
        {NAVBAR.main.map((item) => {
          const active = isActive(item.href);
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
      <View className="gap-[10%]">
        {NAVBAR.footer.map((item) => {
          return (
            <SidebarItem
              key={item.key}
              item={item}
              active={isActive(item.href)}
              expanded={expanded}
            />
          );
        })}
      </View>
    </View>
  );
}
