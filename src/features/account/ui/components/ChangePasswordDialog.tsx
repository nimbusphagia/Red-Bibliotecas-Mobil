import { useSession } from "@/features/account/internal/session";
import { changeOwnPassword } from "@/features/account/internal/service";
import {
  Dialog,
  DialogActions,
  DialogBody,
  DialogHeader,
  FieldError,
  TextField,
} from "@/features/shared/components";
import { InvalidCredentialsError } from "@/features/shared/errors/errors";
import { useFormSubmit } from "@/features/shared/hooks/useFormSubmit";
import { useRef, useState } from "react";
import type { TextInputInstance } from "react-native";

type Props = { onClose: () => void; onChanged: () => void };

export default function ChangePasswordDialog({ onClose, onChanged }: Props) {
  const session = useSession();
  const { errors, setErrors, submitting, run } = useFormSubmit();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [repeat, setRepeat] = useState("");

  const nextRef = useRef<TextInputInstance>(null);
  const repeatRef = useRef<TextInputInstance>(null);

  const mismatch = repeat.length > 0 && repeat !== next;
  const valid = current.length > 0 && next.length > 0 && repeat === next;

  const confirm = () => {
    if (session.status !== "signed-in" || !valid) return;
    run(
      async () => {
        await changeOwnPassword(session.account.id, {
          currentPassword: current,
          newPassword: next,
        });
        onChanged();
      },
      (_, error) => {
        if (error instanceof InvalidCredentialsError) {
          setErrors({
            fields: { currentPassword: "Contraseña incorrecta" },
          });
          setCurrent("");
        }
      },
    );
  };

  return (
    <Dialog onClose={onClose}>
      <DialogHeader title="Cambiar contraseña" />
      <DialogBody>
        <TextField
          label="Contraseña actual"
          secureTextEntry
          value={current}
          onChangeText={setCurrent}
          error={errors.fields.currentPassword}
          returnKeyType="next"
          onSubmitEditing={() => nextRef.current?.focus()}
        />
        <TextField
          ref={nextRef}
          label="Nueva contraseña"
          secureTextEntry
          value={next}
          onChangeText={setNext}
          error={errors.fields.newPassword}
          helperText="Mínimo 6 caracteres"
          returnKeyType="next"
          onSubmitEditing={() => repeatRef.current?.focus()}
        />
        <TextField
          ref={repeatRef}
          label="Repetir contraseña"
          secureTextEntry
          value={repeat}
          onChangeText={setRepeat}
          error={mismatch ? "Las contraseñas no coinciden" : undefined}
          returnKeyType="done"
          onSubmitEditing={confirm}
        />
      </DialogBody>
      <FieldError>{errors.form}</FieldError>
      <DialogActions
        confirmTitle="Guardar"
        loading={submitting}
        disabled={!valid}
        onConfirm={confirm}
        onCancel={onClose}
      />
    </Dialog>
  );
}
