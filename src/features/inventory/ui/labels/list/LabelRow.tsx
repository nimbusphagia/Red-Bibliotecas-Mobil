import type { CopyItem } from "@/features/inventory/internal/copy/types";
import {
  Button,
  Column,
  ListRow,
  StatusBadge,
} from "@/features/shared/components";
import { LABEL_STATE_ES, shelfLabel } from "@/features/shared/format/translate";
import { Link } from "expo-router";
import { BADGE_VARIANT, labelStateOf } from "../labelState";

type Props = { copy: CopyItem };

export default function LabelRow({ copy }: Props) {
  const state = labelStateOf(copy);
  const action = state === "outdated" ? "Re-etiquetar" : "Etiquetar";

  return (
    <ListRow>
      <Column variant="id" text={`#${copy.id}`} />
      <Column
        variant="subtitled"
        text={copy.bookTitle}
        subtitle1={copy.labelText ?? undefined}
        subtitle2={copy.authors ?? undefined}
      />
      <Column
        text={shelfLabel({
          name: copy.shelfName,
          isDefault: copy.shelfIsDefault,
        })}
      />
      <Column variant="actions" width="lg">
        <StatusBadge
          text={LABEL_STATE_ES[state]}
          variant={BADGE_VARIANT[state]}
        />
        {state !== "labeled" && (
          <Link
            href={{ pathname: "/labels/mark", params: { copyId: copy.id } }}
            asChild
          >
            <Button title={action} size="sm" variant="soft" />
          </Link>
        )}
      </Column>
    </ListRow>
  );
}
