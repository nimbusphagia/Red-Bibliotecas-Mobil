import type { ShelfCopy } from "@/features/inventory/internal/shelf/types";
import { Button, Column, PillRow } from "@/features/shared/components";
import { StatusBadge } from "@/features/shared/components/base/Badge";
import { COPY_STATUS_ES } from "@/features/shared/format/translate";
import { colors } from "@/features/shared/theme";
import { Link } from "expo-router";
import { ArrowRightLeft, Eye } from "lucide-react-native";

type Props = { copy: ShelfCopy; onMove: () => void };

export default function ShelfCopyRow({ copy, onMove }: Props) {
  return (
    <PillRow className="gap-6 py-1">
      <Column variant="id" text={`#${copy.id}`} />
      <Column
        variant="subtitled"
        text={copy.bookTitle}
        subtitle1={copy.labelText ?? undefined}
      />
      <Column variant="actions">
        <StatusBadge
          text={COPY_STATUS_ES[copy.status]}
          variant={copy.status === "on_loan" ? "pending" : "active"}
        />
      </Column>
      <Column
        variant="actions"
        expand={false}
        containerClass="w-[104px] justify-end"
      >
        <Button
          variant="secondary"
          icon={<ArrowRightLeft size={16} color={colors.highlight} />}
          onPress={onMove}
        />
        <Link href={`/catalog/${copy.bookId}`} asChild>
          <Button
            variant="secondary"
            icon={<Eye size={16} color={colors.highlight} />}
          />
        </Link>
      </Column>
    </PillRow>
  );
}
