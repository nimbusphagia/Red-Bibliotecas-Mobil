import type { LabelItem } from "@/features/inventory/internal/label/types";
import { Column, ListRow } from "@/features/shared/components";
import { StatusBadge } from "@/features/shared/components/base/Badge";
import {
  PRINT_STATUS_ES,
  shelfLabel,
} from "@/features/shared/format/translate";

type Props = { label: LabelItem };

export default function LabelRow({ label }: Props) {
  return (
    <ListRow>
      <Column variant="id" text={`#${label.copyId}`} />
      <Column
        variant="subtitled"
        text={label.bookTitle}
        subtitle1={label.authorName ?? undefined}
      />
      <Column text={label.text} />
      <Column
        text={shelfLabel({
          name: label.shelfName,
          isDefault: label.shelfIsDefault,
        })}
      />
      <Column
        variant="actions"
        expand={false}
        containerClass="w-[110] justify-end"
      >
        <StatusBadge
          text={PRINT_STATUS_ES[label.printStatus]}
          variant={label.printStatus === "printed" ? "active" : "pending"}
        />
      </Column>
    </ListRow>
  );
}
