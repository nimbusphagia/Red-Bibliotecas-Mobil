import { ArrowDownZa, ArrowUpAz } from "lucide-react-native";
import { View } from "react-native";
import type { SortDirection } from "../../types/types";
import { Button } from "../base/Button";

export type SortOption<K extends string> = {
  key: K;
  label: string;
  defaultDir: SortDirection;
};

type Props<K extends string> = {
  options: SortOption<K>[];
  sortBy: K;
  sortDir: SortDirection;
  onChange: (sortBy: K, sortDir: SortDirection) => void;
};

export function InlineSort<K extends string>({
  options,
  sortBy,
  sortDir,
  onChange,
}: Props<K>) {
  const Arrow = sortDir === "asc" ? ArrowUpAz : ArrowDownZa;

  return (
    <View className="flex-row gap-2">
      {options.map(({ key, label, defaultDir }) => {
        const selected = key === sortBy;
        return (
          <Button
            key={key}
            title={label}
            variant={selected ? "active" : "solid"}
            size="sm"
            weight={selected ? "md" : "sm"}
            icon={selected ? Arrow : undefined}
            onPress={() =>
              onChange(
                key,
                selected ? (sortDir === "asc" ? "desc" : "asc") : defaultDir,
              )
            }
          />
        );
      })}
    </View>
  );
}
