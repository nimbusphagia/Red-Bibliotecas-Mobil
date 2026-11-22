import { CopyItem } from "@/features/inventory/internal/copy/types";
import { Button, Column, ListRow, Text } from "@/features/shared/components";
import { StatusBadge } from "@/features/shared/components/base/Badge";
import { COPY_STATUS_ES, shelfLabel } from "@/features/shared/format/translate";
import { Link } from "expo-router";
import { ArrowDown, ArrowUp, ScanSearch } from "lucide-react-native";
import { View } from "react-native";

type Props = {
  copies: CopyItem[];
};
export default function CopiesList({ copies }: Props) {
  return (
    <View className="flex-1 gap-2">
      {copies.length < 1 && (
        <View className="h-20 justify-end p-4">
          <Text variant="caption" className="text-center">
            Este libro aún no tiene ejemplares.
          </Text>
        </View>
      )}
      {copies.map((c) => {
        const isAvailable = ["available", "damaged"].includes(c.status);
        const href = isAvailable
          ? {
              pathname: "/loans/new" as const,
              params: { copyId: String(c.id) },
            }
          : c.loan && (`/loans/${c.loan.loanId}` as const);
        return (
          <ListRow key={c.id}>
            <Column
              text={`#${c.id}`}
              variant="id"
              containerClass="justify-start"
            />
            <Column text={c.labelText ?? "---"} containerClass="" />
            <Column variant="actions" containerClass="justify-start">
              <StatusBadge
                text={COPY_STATUS_ES[c.status]}
                variant={isAvailable ? "finished" : "pending"}
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
                <Button variant="soft" icon={ScanSearch} />
              </Link>
              {href && (
                <Link href={href} asChild>
                  <Button
                    variant="soft"
                    icon={isAvailable ? ArrowUp : ArrowDown}
                  />
                </Link>
              )}
            </Column>
          </ListRow>
        );
      })}
    </View>
  );
}
