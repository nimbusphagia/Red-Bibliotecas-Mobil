import { Link, type Href } from "expo-router";
import { ArrowUpRight } from "lucide-react-native";
import { View } from "react-native";
import { Button } from "../base/Button";
import { Surface } from "../base/Surface";
import { Text } from "../base/Text";
import { ChipRow } from "../form/select/ChipRow";

type Props = {
  title: string;
  subtitle?: string | null;
  detail?: string | null;
  href: Href;
  chips?: string[];
};

export function ItemCard({ title, subtitle, detail, href, chips }: Props) {
  return (
    <Surface row className="grow justify-between gap-4 p-4 rounded-2xl">
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
      {!!chips?.length && <ChipRow labels={chips} />}
    </Surface>
  );
}
