// DetailMain.tsx
import type { BookListItem } from "@/features/catalog/internal/book/types";
import type { CopyItem } from "@/features/inventory/internal/copy/types";
import { LabelCodes } from "@/features/inventory/internal/label/types";
import { Button, DetailColumns, Section } from "@/features/shared/components";
import { ScreenBody } from "@/features/shared/layout/Screen";
import { Link } from "expo-router";
import { PencilLine, Tag } from "lucide-react-native";
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
        divided
        columns={[
          {
            title: "Tejuelo",
            variant: "box",
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
                <Button variant="highlight" size="sm" icon={PencilLine} />
              </Link>
            ),
            rows: bookDetailRows(book),
          },
        ]}
      />
      <Section title="Ejemplares" className="bg-white rounded-2xl p-4" expand>
        <CopiesList copies={copies} />
      </Section>
    </ScreenBody>
  );
}
