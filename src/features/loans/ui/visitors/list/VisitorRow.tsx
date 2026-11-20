import type { VisitorListItem } from "@/features/loans/internal/visitor/types";
import { Button, Column, ListRow } from "@/features/shared/components";
import { gradeLabel, ROLE_ES } from "@/features/shared/format/translate";
import { Link } from "expo-router";
import { Eye, Pencil } from "lucide-react-native";

type Props = { visitor: VisitorListItem; onEdit: () => void };

export default function VisitorRow({ visitor, onEdit }: Props) {
  return (
    <ListRow>
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
        <Button variant="secondary" icon={Pencil} onPress={onEdit} />
        <Link href={`/visitors/${visitor.id}`} asChild>
          <Button variant="secondary" icon={Eye} />
        </Link>
      </Column>
    </ListRow>
  );
}
