import type { VisitorListItem } from "@/features/loans/internal/visitor/types";
import { Button, PillRow, Text } from "@/features/shared/components";
import { gradeLabel, ROLE_ES } from "@/features/shared/format/translate";
import { colors } from "@/features/shared/theme";
import { Pencil } from "lucide-react-native";
import { View } from "react-native";

type Props = { visitor: VisitorListItem; onEdit: () => void };

export default function VisitorRow({ visitor, onEdit }: Props) {
  return (
    <PillRow>
      <View className="flex-1 justify-center gap-[1px]">
        <Text variant="h3" className="text-highlight">
          {visitor.name}
        </Text>
        <Text variant="subtitle">{ROLE_ES[visitor.role]}</Text>
      </View>
      <View className="flex-1 justify-center">
        {visitor.grade !== null && visitor.level !== null && (
          <Text variant="h3" className="font-semibold text-[15px]">
            {gradeLabel(visitor.grade, visitor.level)}
          </Text>
        )}
      </View>
      <View className="flex-row items-center">
        <Button
          variant="secondary"
          icon={<Pencil size={18} color={colors.highlight} />}
          onPress={onEdit}
        />
      </View>
    </PillRow>
  );
}
