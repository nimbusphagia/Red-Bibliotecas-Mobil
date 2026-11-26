import { setInitialPassword } from "@/features/account/internal/service";
import { useSession } from "@/features/account/internal/session";
import {
  FormScreen,
  TextField,
  Button,
  FieldError,
} from "@/features/shared/components";
import { useFormSubmit } from "@/features/shared/hooks/useFormSubmit";
import { KeyRound, LogOut } from "lucide-react-native";
import { useRef, useState } from "react";
import { View, type TextInputInstance } from "react-native";

const background = require("@/assets/images/auth-background.jpg");

export default function NewPasswordScreen() {
  const session = useSession();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const confirmRef = useRef<TextInputInstance>(null);

  const { errors, setErrors, submitting, run } = useFormSubmit();

  if (session.status !== "signed-in") return null;
  const { account, setAccount, signOut } = session;

  function submit() {
    if (password !== confirm) {
      setErrors({ fields: { confirm: "Las contraseñas no coinciden" } });
      return;
    }
    void run(async () =>
      setAccount(
        await setInitialPassword(account.id, { newPassword: password }),
      ),
    );
  }

  return (
    <FormScreen
      title={`Hola, ${account.name}`}
      subtitle="Estás usando la contraseña inicial. Elige una nueva para continuar"
      background={background}
    >
      <TextField
        label="Nueva contraseña"
        placeholder="Crea una contraseña"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        error={errors.fields.newPassword}
        helperText="Mínimo 6 caracteres"
        returnKeyType="next"
        onSubmitEditing={() => confirmRef.current?.focus()}
      />
      <TextField
        ref={confirmRef}
        label="Confirmar contraseña"
        placeholder="Repite la contraseña"
        secureTextEntry
        value={confirm}
        onChangeText={setConfirm}
        error={errors.fields.confirm}
        returnKeyType="done"
        onSubmitEditing={submit}
      />
      <FieldError>{errors.form}</FieldError>
      <View className="mt-2 flex-row items-center justify-between">
        <Button
          title="Cerrar sesión"
          icon={LogOut}
          variant="ghost"
          size="sm"
          onPress={signOut}
        />
        <Button
          title="Guardar"
          icon={KeyRound}
          weight="md"
          iconSize="lg"
          accent="lg"
          size="lg"
          onPress={submit}
          loading={submitting}
        />
      </View>
    </FormScreen>
  );
}
