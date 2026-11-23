import type { CopyItem } from "@/features/inventory/internal/copy/types";
import {
  Button,
  Column,
  Icon,
  ListRow,
  Text,
} from "@/features/shared/components";
import { LABEL_STATE_ES, shelfLabel } from "@/features/shared/format/translate";
import { Link } from "expo-router";
import { Printer, ScanSearch, Stamp } from "lucide-react-native";
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
        <Column
          variant="subtitled"
          text={copy.bookTitle}
          subtitle1={copy.authors ?? undefined}
        />
        <Column text={copy.labelText ?? "---"} />
        <Column containerClass="gap-2">
          <Icon icon={LABEL_STATE_ICON[state]} size="lg" />
          <Text variant="itemSm">{LABEL_STATE_ES[state]}</Text>
        </Column>
        <Column
          width="lg"
          text={shelfLabel({
            name: copy.shelfName,
            isDefault: copy.shelfIsDefault,
          })}
        />
        <Column variant="actions" width="md">
          {state === "labeled" ? (
            <Button
              variant="soft"
              icon={Printer}
              onPress={() => setPrinting(true)}
            />
          ) : (
            <Link
              href={{ pathname: "/copies/mark", params: { copyId: copy.id } }}
              asChild
            >
              <Button variant="soft" icon={Stamp} />
            </Link>
          )}
          <Link href={`/catalog/${copy.bookId}`} asChild>
            <Button variant="soft" icon={ScanSearch} />
          </Link>
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
