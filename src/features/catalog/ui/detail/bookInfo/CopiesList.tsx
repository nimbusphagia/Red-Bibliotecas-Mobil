import { useSession } from "@/features/account/internal/session";
import { CopyItem } from "@/features/inventory/internal/copy/types";
import { canManageStock } from "@/features/inventory/internal/movement/utils/auth";
import { canRecover } from "@/features/inventory/ui/copies/canRecover";
import RecoverCopyDialog from "@/features/inventory/ui/copies/RecoverCopyDialog";
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
import {
  ArrowDown,
  ArrowUp,
  RotateCcwClock,
  ShelvingUnit,
} from "lucide-react-native";
import { useState } from "react";
import { View } from "react-native";

type Props = {
  copies: CopyItem[];
  onChanged: () => void;
};
export default function CopiesList({ copies, onChanged }: Props) {
  const session = useSession();
  const [recovering, setRecovering] = useState<CopyItem | null>(null);
  const actorId =
    session.status === "signed-in" && canManageStock(session.account.role)
      ? session.account.id
      : null;

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
              containerClass="w-48 shrink-0 items-center justify-between"
            >
              <Icon icon={COPY_STATUS_ICON[c.status]} size="lg" stroke="sm" />
              <View className="flex-row items-center gap-2">
                {actorId !== null && canRecover(c.status) && (
                  <Button
                    variant="soft"
                    icon={RotateCcwClock}
                    onPress={() => setRecovering(c)}
                  />
                )}
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
              </View>
            </Column>
          </ListRow>
        );
      })}
      {recovering && actorId !== null && (
        <RecoverCopyDialog
          copy={{ ...recovering, copyId: recovering.id }}
          actorId={actorId}
          onClose={() => setRecovering(null)}
          onDone={() => {
            setRecovering(null);
            onChanged();
          }}
        />
      )}
    </View>
  );
}
