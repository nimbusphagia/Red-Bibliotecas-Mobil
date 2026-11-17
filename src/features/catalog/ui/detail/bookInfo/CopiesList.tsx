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
        const href = isAvailable
          ? {
              pathname: "/loans/new" as const,
              params: { copyId: String(c.id) },
            }
          : c.loan && (`/loans/${c.loan.loanId}` as const);
        return (
          <PillRow key={c.id} className="flex-1 justify-around py-2">
            <PillRowColumn textVariant="subtitle" title={"#" + c.id} />
            <PillRowColumn
              variant="highlight"
              textVariant="subtitle"
              title={c.labelText ?? "---"}
            />

            <PillRowColumn
              variant={isAvailable ? "badge" : "text"}
              textVariant="subtitle"
              title={COPY_STATUS_ES[c.status]}
            />

            <PillRowColumn
              textVariant="subtitle"
              title={
                c.shelfName === "Default" ? "Estanteria General" : c.shelfName
              }
            />
            <View className="flex-row items-center gap-4">
              <Link href={`/shelves/${c.shelfId}`} asChild>
                <Button
                  variant="secondary"
                  icon={
                    <ShelvingUnit
                      size={20}
                      color={colors.highlight}
                      strokeWidth={2}
                    />
                  }
                />
              </Link>
              {href && (
                <Link href={href} asChild>
                  <Button
                    icon={
                      isAvailable ? (
                        <BookUp size={20} color={colors.bg} strokeWidth={2} />
                      ) : (
                        <BookDown size={20} color={colors.bg} strokeWidth={2} />
                      )
                    }
                  />
                </Link>
              )}
            </View>
          </PillRow>
        );
      })}
    </View>
  );
}
