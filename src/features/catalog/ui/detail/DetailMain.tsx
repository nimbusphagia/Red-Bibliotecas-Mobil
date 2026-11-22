// DetailMain.tsx
import type { BookListItem } from "@/features/catalog/internal/book/types";
import type { CopyItem } from "@/features/inventory/internal/copy/types";
import { LabelCodes } from "@/features/inventory/internal/label/types";
import { Button, DetailColumns, Panel } from "@/features/shared/components";
import { ScreenBody } from "@/features/shared/layout/Screen";
import { Link } from "expo-router";
import { NotebookPen, PencilLine } from "lucide-react-native";
import { bookDetailRows, bookLabelRows } from "./bookInfo/bookRows";
import CopiesList from "./bookInfo/CopiesList";

type Props = {
  book: BookListItem;
  copies: CopyItem[];
  codes: LabelCodes | null;
};

export default function DetailMain({ book, copies, codes }: Props) {
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
                <Button title="Editar" icon={PencilLine} size="sm" />
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
          <Link
            href={{
              pathname: "/catalog/form",
              params: { id: String(book.id) },
            }}
            asChild
          >
            <Button title="Agregar" icon={NotebookPen} size="sm" />
          </Link>
        }
      >
        <CopiesList copies={copies} />
      </Panel>
    </ScreenBody>
  );
}
