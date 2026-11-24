import { useSession } from "@/features/account/internal/session";
import { CopyItem } from "@/features/inventory/internal/copy/types";
import { canManageStock } from "@/features/inventory/internal/movement/utils/auth";
import CopyRow from "@/features/inventory/ui/copies/list/CopyRow";
import { Text } from "@/features/shared/components";
import { View } from "react-native";

type Props = {
  copies: CopyItem[];
  onChanged: () => void;
};
export default function CopiesList({ copies, onChanged }: Props) {
  const session = useSession();
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
      {copies.map((c) => (
        <CopyRow key={c.id} copy={c} actorId={actorId} onChanged={onChanged} />
      ))}
    </View>
  );
}
