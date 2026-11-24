import { Link, type Href } from "expo-router";
import { ArrowUpRight } from "lucide-react-native";
import { View } from "react-native";
import { Button } from "../base/Button";
import { cn, useTone } from "../../theme";
import { Surface } from "../base/Surface";
import { Text } from "../base/Text";
import { ChipRow, type ChipItem } from "../form/select/ChipRow";

type Props = {
  title: string;
  subtitle?: string | null;
  detail?: string | null;
  href: Href;
  chips?: ChipItem[];
  lead?: string;
};

export function ItemCard({
  title,
  subtitle,
  detail,
  href,
  chips,
  lead,
}: Props) {
  const t = useTone();
  return (
    <Surface
      row
      className={cn("grow justify-between gap-4 p-4 rounded-2xl", t.card)}
    >
      <View className="flex-row items-start gap-2">
        <View className="flex-1 gap-1">
          <Text variant="item" numberOfLines={2}>
            {title}
          </Text>
          {!!subtitle && (
            <Text variant="caption" numberOfLines={1}>
              {subtitle}
            </Text>
          )}
          {!!detail && (
            <Text variant="captionXs" numberOfLines={1}>
              {detail}
            </Text>
          )}
        </View>
        <Link href={href} asChild>
          <Button
            icon={ArrowUpRight}
            variant="soft"
            className="-mr-2 -mt-2 bg-transparent"
          />
        </Link>
      </View>
      {!!chips?.length && (
        <View className="flex-row items-center gap-2">
          {!!lead && <Text variant="itemSm">{lead}</Text>}
          <View className="flex-1">
            <ChipRow chips={chips} end={!!lead} />
          </View>
        </View>
      )}
    </Surface>
  );
}
