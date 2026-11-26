import {
  listLowerAccounts,
  resetAccountPassword,
} from "@/features/account/internal/service";
import { INITIAL_PASSWORD } from "@/features/account/internal/setup";
import type { PublicAccount } from "@/features/account/internal/types";
import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogHeader,
  FieldError,
  ListRow,
  Panel,
  Text,
} from "@/features/shared/components";
import { useFocusData } from "@/features/shared/hooks/useFocusData";
import { useFormSubmit } from "@/features/shared/hooks/useFormSubmit";
import { RotateCcw } from "lucide-react-native";
import { useCallback, useState } from "react";
import { View } from "react-native";

export default function LowerAccountsPanel({ actorId }: { actorId: number }) {
  const fetch = useCallback(() => listLowerAccounts(actorId), [actorId]);
  const { data, reload } = useFocusData(fetch);
  const [target, setTarget] = useState<PublicAccount | null>(null);

  if (!data?.length) return null;

  return (
    <Panel
      title="Otras cuentas"
      subtitle="Restablece la contraseña cuando alguien la olvida o deja el puesto"
    >
      {data.map((a) => (
        <ListRow key={a.id}>
          <View className="gap-0.5">
            <Text variant="item">{a.name}</Text>
            {a.mustChangePassword && (
              <Text variant="caption">Usa la contraseña inicial</Text>
            )}
          </View>
          <Button
            title="Restablecer"
            icon={RotateCcw}
            size="sm"
            variant="soft"
            onPress={() => setTarget(a)}
          />
        </ListRow>
      ))}
      {target && (
        <ResetDialog
          actorId={actorId}
          target={target}
          onClose={() => setTarget(null)}
          onDone={() => {
            setTarget(null);
            void reload();
          }}
        />
      )}
    </Panel>
  );
}

type DialogProps = {
  actorId: number;
  target: PublicAccount;
  onClose: () => void;
  onDone: () => void;
};

function ResetDialog({ actorId, target, onClose, onDone }: DialogProps) {
  const { errors, submitting, run } = useFormSubmit();

  const confirm = () =>
    run(async () => {
      await resetAccountPassword(actorId, { role: target.role });
      onDone();
    });

  return (
    <Dialog onClose={onClose} size="sm">
      <DialogHeader title={`Restablecer ${target.name}`} />
      <DialogBody>
        <Text>
          La contraseña volverá a ser{" "}
          <Text className="font-sans-medium">{INITIAL_PASSWORD}</Text>. Al
          iniciar sesión se pedirá elegir una nueva.
        </Text>
      </DialogBody>
      <FieldError>{errors.form}</FieldError>
      <DialogActions
        confirmTitle="Restablecer"
        loading={submitting}
        onConfirm={() => void confirm()}
        onCancel={onClose}
      />
    </Dialog>
  );
}
