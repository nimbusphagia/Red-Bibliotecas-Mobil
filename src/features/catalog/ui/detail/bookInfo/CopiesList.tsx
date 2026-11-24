import { CopyItem } from "@/features/inventory/internal/copy/types";
import { COPY_STATUS_ICON } from "@/features/inventory/ui/copies/statusIcon";
import {
  Button,
  Column,
  Icon,
  ListRow,
  Text,
} from "@/features/shared/components";
import { shelfLabel } from "@/features/shared/format/translate";
import { Link } from "expo-router";
import { ArrowDown, ArrowUp, ShelvingUnit } from "lucide-react-native";
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
            <Column variant="id" text={`#${c.id}`} />
            <Column text={c.labelText ?? "---"} />
            <Column>
              <Link href={`/shelves/${c.shelfId}`} asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  weight="md"
                  icon={ShelvingUnit}
                  title={shelfLabel({
                    name: c.shelfName,
                    isDefault: c.shelfIsDefault,
                  })}
                  className="-ml-4 shrink"
                />
              </Link>
            </Column>
            <Column
              variant="actions"
              expand={false}
              containerClass="w-36 shrink-0 items-center justify-between"
            >
              <Icon icon={COPY_STATUS_ICON[c.status]} size="lg" stroke="sm" />
              {href && (
                <Link href={href} asChild>
                  <Button
                    variant="soft"
                    size="sm"
                    icon={isAvailable ? ArrowUp : ArrowDown}
                    title={isAvailable ? "Prestar" : "Devolver"}
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
