import { Icon, Surface, Text } from "@/features/shared/components";
import { cn } from "@/features/shared/theme";
import { Link, type Href } from "expo-router";
import { ArrowUpRight, type LucideIcon } from "lucide-react-native";
import type { PropsWithChildren } from "react";
import { Pressable, View } from "react-native";

type Props = PropsWithChildren<{
  title: string;
  icon: LucideIcon;
  value: number;
  href: Href;
  dark?: boolean;
  className?: string;
}>;

export default function MetricCard({
  title,
  icon,
  value,
  href,
  dark,
  className,
  children,
}: Props) {
  return (
    <Link href={href} asChild>
      <Pressable className={cn("active:opacity-80", className)}>
        <Surface tone={dark ? "dark" : undefined} className="grow gap-3 p-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-row gap-2 items-center">
              <Icon icon={icon} size="sm" stroke="md" />
              <Text variant="item" className="font-sans text-[15px]">
                {title}
              </Text>
            </View>
            <Icon icon={ArrowUpRight} size="md" stroke="sm" />
          </View>
          <View className="flex-row items-center justify-between gap-4">
            <Text variant="display" className="min-w-[30]">
              {value}
            </Text>
            <View className="flex-1 gap-0.5">{children}</View>
          </View>
        </Surface>
      </Pressable>
    </Link>
  );
}
