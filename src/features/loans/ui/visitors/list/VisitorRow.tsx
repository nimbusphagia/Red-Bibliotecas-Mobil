import type { VisitorListItem } from "@/features/loans/internal/visitor/types";
import { Button, Column, PillRow } from "@/features/shared/components";
import { gradeLabel, ROLE_ES } from "@/features/shared/format/translate";
import { colors } from "@/features/shared/theme";
import { Link } from "expo-router";
import { Eye, Pencil } from "lucide-react-native";

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
      <Column variant="actions" expand={false}>
        <Button
          variant="secondary"
          icon={<Pencil size={16} color={colors.highlight} strokeWidth={2} />}
          onPress={onEdit}
        />
        <Link href={`/visitors/${visitor.id}`} asChild>
          <Button
            variant="secondary"
            icon={<Eye size={16} color={colors.highlight} strokeWidth={2} />}
          />
        </Link>
      </Column>
    </PillRow>
  );
}
