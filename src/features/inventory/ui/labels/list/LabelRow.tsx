import type { CopyItem } from "@/features/inventory/internal/copy/types";
import { Column, ListRow, StatusBadge } from "@/features/shared/components";
import { LABELED_ES, shelfLabel } from "@/features/shared/format/translate";

type Props = { copy: CopyItem };

export default function LabelRow({ copy }: Props) {
  const labeled = copy.labeledAt !== null;
  return (
    <ListRow>
      <Column variant="id" text={`#${copy.id}`} />
      <Column text={copy.bookTitle} />
      <Column text={copy.labelText ?? "---"} />
      <Column
        text={shelfLabel({
          name: copy.shelfName,
          isDefault: copy.shelfIsDefault,
        })}
      />
      <Column variant="actions" width="md">
        <StatusBadge
          text={LABELED_ES[`${labeled}`]}
          variant={labeled ? "active" : "pending"}
        />
      </Column>
    </ListRow>
  );
}
