import type { VisitorListItem } from "@/features/loans/internal/visitor/types";
import { Button, Column, PillRow } from "@/features/shared/components";
import { gradeLabel, ROLE_ES } from "@/features/shared/format/translate";
import { colors } from "@/features/shared/theme";
import { Pencil } from "lucide-react-native";

type Props = { visitor: VisitorListItem; onEdit: () => void };

export default function VisitorRow({ visitor, onEdit }: Props) {
  return (
    <PillRow>
      <Column variant="id" text={`#${visitor.id}`} />
      <Column
        variant="subtitled"
        text={visitor.name}
        subtitle1={ROLE_ES[visitor.role]}
        subtitle2={
          visitor.role === "student"
            ? gradeLabel(visitor.grade!, visitor.level!)
            : undefined
        }
      />
      <Column
        variant="subtitled"
        text={`${visitor.returnedCount} / ${visitor.lineCount}`}
        subtitle1="Libros devueltos"
      />
      <Column
        variant="subtitled"
        text={String(visitor.problemCount)}
        subtitle1="Perdidos o dañados"
      />
      <Column variant="actions" expand={false}>
        <Button
          variant="secondary"
          icon={<Pencil size={16} color={colors.highlight} />}
          onPress={onEdit}
        />
      </Column>
    </PillRow>
  );
}
