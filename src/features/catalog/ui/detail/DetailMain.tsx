import type { BookListItem } from "@/features/catalog/internal/book/types";
import type { CopyItem } from "@/features/inventory/internal/copy/types";
import { LabelCodes } from "@/features/catalog/internal/book/types";
import { Button, DetailColumns, Panel } from "@/features/shared/components";
import { ScreenBody } from "@/features/shared/layout/Screen";
import { useLayoutMode } from "@/features/shared/hooks/useLayoutMode";
import { useCanManageStock } from "@/features/inventory/ui/useCanManageStock";
import { Link } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { PencilLine, Plus } from "lucide-react-native";
import { bookDetailRows, bookLabelRows } from "./bookInfo/bookRows";
import AddCopiesDialog from "./AddCopiesDialog";
import CopiesList from "./bookInfo/CopiesList";

type Props = {
  book: BookListItem;
  copies: CopyItem[];
  codes: LabelCodes | null;
  onCopiesChanged: () => void;
};

export default function DetailMain({
  book,
  copies,
  codes,
  onCopiesChanged,
}: Props) {
  const [adding, setAdding] = useState(false);
  const { isCompact } = useLayoutMode();
  const canManage = useCanManageStock();
  // Mantiene la altura del encabezado cuando se oculta su botón.
  const spacer = <View className="h-9" />;

  return (
    <ScreenBody>
      <DetailColumns
        columns={[
          ...(isCompact
            ? []
            : [
                {
                  title: "Tejuelo",
                  fit: true,
                  rows: bookLabelRows(book, codes),
                },
              ]),
          {
            title: "Detalles",
            columns: 2,
            lead: !canManage ? (
              spacer
            ) : (
              <Link
                href={{
                  pathname: "/catalog/form",
                  params: { id: String(book.id) },
                }}
                asChild
              >
                <Button
                  title="Editar"
                  icon={PencilLine}
                  size="sm"
                  weight="md"
                />
              </Link>
            ),
            rows: bookDetailRows(book),
          },
        ]}
      />
      <Panel
        title="Ejemplares"
        className="flex-1 gap-2"
        lead={
          !canManage ? (
            spacer
          ) : (
            <Button
              title="Nuevo"
              className="gap-3"
              icon={Plus}
              size="sm"
              weight="md"
              onPress={() => setAdding(true)}
            />
          )
        }
      >
        <CopiesList copies={copies} onChanged={onCopiesChanged} />
      </Panel>
      {adding && (
        <AddCopiesDialog
          bookId={book.id}
          bookTitle={book.title}
          onClose={() => setAdding(false)}
          onAdded={() => {
            setAdding(false);
            onCopiesChanged();
          }}
        />
      )}
    </ScreenBody>
  );
}
