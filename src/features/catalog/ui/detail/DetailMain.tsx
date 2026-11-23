import type { BookListItem } from "@/features/catalog/internal/book/types";
import type { CopyItem } from "@/features/inventory/internal/copy/types";
import { LabelCodes } from "@/features/catalog/internal/book/types";
import { Button, DetailColumns, Panel } from "@/features/shared/components";
import { ScreenBody } from "@/features/shared/layout/Screen";
import { Link } from "expo-router";
import { useState } from "react";
import { PencilLine, Plus } from "lucide-react-native";
import { bookDetailRows, bookLabelRows } from "./bookInfo/bookRows";
import AddCopiesDialog from "./AddCopiesDialog";
import CopiesList from "./bookInfo/CopiesList";

type Props = {
  book: BookListItem;
  copies: CopyItem[];
  codes: LabelCodes | null;
  onCopiesAdded: () => void;
};

export default function DetailMain({
  book,
  copies,
  codes,
  onCopiesAdded,
}: Props) {
  const [adding, setAdding] = useState(false);

  return (
    <ScreenBody>
      <DetailColumns
        columns={[
          {
            title: "Tejuelo",
            fit: true,
            rows: bookLabelRows(book, codes),
          },
          {
            title: "Detalles",
            columns: 2,
            lead: (
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
          <Button
            title="Nuevo"
            className="gap-3"
            icon={Plus}
            size="sm"
            weight="md"
            onPress={() => setAdding(true)}
          />
        }
      >
        <CopiesList copies={copies} />
      </Panel>
      {adding && (
        <AddCopiesDialog
          bookId={book.id}
          bookTitle={book.title}
          onClose={() => setAdding(false)}
          onAdded={() => {
            setAdding(false);
            onCopiesAdded();
          }}
        />
      )}
    </ScreenBody>
  );
}
