import { CopyItem } from "@/features/inventory/internal/copy/types";
import { Button, PillRow, PillRowColumn } from "@/features/shared/components";
import { COPY_STATUS_ES } from "@/features/shared/format/translate";
import { colors } from "@/features/shared/theme";
import { Link } from "expo-router";
import { BookDown, BookUp, ShelvingUnit } from "lucide-react-native";
import { View } from "react-native";

type Props = {
  copies: CopyItem[];
};
export default function CopiesList({ copies }: Props) {
  return (
    <View className="flex-1 gap-5 py-3">
      {copies.map((c) => {
        const isAvailable = ["available", "damaged"].includes(c.status);
        return (
          <PillRow key={c.id} className="justify-around py-2">
            <PillRowColumn textVariant="h3" title={String(c.copyNumber)} />
            <PillRowColumn
              textVariant="subtitle"
              title={c.shelfName === "Default" ? "General" : c.shelfName}
            />
            <PillRowColumn
              variant={isAvailable ? "badge" : "text"}
              textVariant="subtitle"
              title={COPY_STATUS_ES[c.status]}
            />
            <PillRowColumn
              variant="highlight"
              textVariant="subtitle"
              title={c.labelText ?? "---"}
            />
            <PillRowColumn variant="children">
              <Link href={`/shelves/${c.shelfId}`} asChild className="p-3">
                <Button
                  variant="pill-secondary"
                  lucideIcon={
                    <ShelvingUnit
                      size={20}
                      color={colors.highlight}
                      strokeWidth={2}
                    />
                  }
                />
              </Link>
              <Link
                href={isAvailable ? "/loans/new" : `/loans/${c.id}`}
                asChild
                className="p-3"
              >
                <Button
                  variant="pill"
                  className="bg-primary"
                  lucideIcon={
                    isAvailable ? (
                      <BookUp size={20} color={colors.bg} strokeWidth={2} />
                    ) : (
                      <BookDown size={20} color={colors.bg} strokeWidth={2} />
                    )
                  }
                />
              </Link>
            </PillRowColumn>
          </PillRow>
        );
      })}
    </View>
  );
}
