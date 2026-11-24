import type { CopyItem } from "@/features/inventory/internal/copy/types";
import {
  Button,
  Column,
  Icon,
  ListRow,
  Text,
} from "@/features/shared/components";
import { shelfLabel } from "@/features/shared/format/translate";
import { Link } from "expo-router";
import { Printer, ShelvingUnit, Stamp } from "lucide-react-native";
import { useState } from "react";
import PrintLabelsDialog from "../../labels/form/PrintLabelsDialog";
import { LABEL_STATE_ICON, labelStateOf } from "../../labels/labelState";

type Props = { copy: CopyItem };

export default function CopyRow({ copy }: Props) {
  const state = labelStateOf(copy);
  const [printing, setPrinting] = useState(false);

  return (
    <>
      <ListRow>
        <Column variant="id" text={`#${copy.id}`} />
        <Column text={copy.labelText ?? "---"} />
        <Column containerClass="gap-2">
          <Icon icon={ShelvingUnit} size="lg" stroke="sm" />
          <Text variant="itemSm" className="shrink" numberOfLines={1}>
            {shelfLabel({
              name: copy.shelfName,
              isDefault: copy.shelfIsDefault,
            })}
          </Text>
        </Column>
        <Column
          variant="actions"
          expand={false}
          containerClass="w-36 shrink-0 items-center justify-between"
        >
          <Icon icon={LABEL_STATE_ICON[state]} size="lg" stroke="sm" />
          {state === "labeled" ? (
            <Button
              variant="soft"
              size="sm"
              icon={Printer}
              title="Imprimir"
              onPress={() => setPrinting(true)}
            />
          ) : (
            <Link
              href={{ pathname: "/copies/mark", params: { copyId: copy.id } }}
              asChild
            >
              <Button
                variant="soft"
                size="sm"
                icon={Stamp}
                title="Etiquetar"
              />
            </Link>
          )}
        </Column>
      </ListRow>
      {printing && (
        <PrintLabelsDialog
          initial={[copy]}
          onClose={() => setPrinting(false)}
        />
      )}
    </>
  );
}
