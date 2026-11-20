import { CopyItem } from "@/features/inventory/internal/copy/types";
import { Button, Column, PillRow } from "@/features/shared/components";
import { StatusBadge } from "@/features/shared/components/base/Badge";
import { COPY_STATUS_ES, shelfLabel } from "@/features/shared/format/translate";
import { colors } from "@/features/shared/theme";
import { Link } from "expo-router";
import { BookDown, BookUp, ShelvingUnit } from "lucide-react-native";
import { View } from "react-native";

type Props = {
  copies: CopyItem[];
};
export default function CopiesList({ copies }: Props) {
  return (
    <View className="flex-1 gap-4 py-3">
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
            <Column
              text={`#${c.id}`}
              variant="id"
              containerClass="justify-start"
            />
            <Column text={c.labelText ?? "---"} containerClass="" />
            <Column variant="actions" containerClass="justify-start">
              <StatusBadge
                text={COPY_STATUS_ES[c.status]}
                variant={isAvailable ? "active" : "pending"}
              />
            </Column>
            <Column
              text={shelfLabel({
                name: c.shelfName,
                isDefault: c.shelfIsDefault,
              })}
              containerClass="justify-start"
            />
            <Column variant="actions" expand={false}>
              <Link href={`/shelves/${c.shelfId}`} asChild>
                <Button variant="secondary" icon={ShelvingUnit} />
              </Link>
              {href && (
                <Link href={href} asChild>
                  <Button icon={isAvailable ? BookUp : BookDown} />
                </Link>
              )}
            </Column>
          </PillRow>
        );
      })}
    </View>
  );
}
