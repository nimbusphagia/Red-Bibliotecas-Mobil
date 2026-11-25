import { Icon, Surface, Text } from "@/features/shared/components";
import { cn } from "@/features/shared/theme";
import { Link, type Href } from "expo-router";
import { ArrowUpRight, type LucideIcon } from "lucide-react-native";
import type { PropsWithChildren } from "react";
import { Pressable, View } from "react-native";

const HEADER = "font-sans-medium";

type Props = PropsWithChildren<{
  title: string;
  icon: LucideIcon;
  /** Total junto al título. */
  value?: number;
  href: Href;
  className?: string;
}>;

export default function MetricCard({
  title,
  icon,
  value,
  href,
  className,
  children,
}: Props) {
  return (
    <Link href={href} asChild>
      <Pressable className={cn("active:opacity-80", className)}>
        <Surface className="grow gap-3 p-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-row gap-2 items-center">
              <Icon icon={icon} size="sm" stroke="md" />
              <Text variant="caption" className={HEADER}>
                {title}
              </Text>
              {value !== undefined && (
                <Text variant="caption" className={HEADER}>
                  {value}
                </Text>
              )}
            </View>
            <Icon icon={ArrowUpRight} size="md" stroke="sm" />
          </View>
          <View className="gap-1.5">{children}</View>
        </Surface>
      </Pressable>
    </Link>
  );
}
