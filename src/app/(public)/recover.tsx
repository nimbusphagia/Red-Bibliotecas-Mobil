import { recoverAdmin } from "@/features/account/internal/service";
import RecoveryCodeScreen from "@/features/account/ui/components/RecoveryCodeScreen";
import {
  FormScreen,
  TextField,
  Button,
  FieldError,
} from "@/features/shared/components";
import { InvalidCredentialsError } from "@/features/shared/errors/errors";
import { useFormSubmit } from "@/features/shared/hooks/useFormSubmit";
import { router } from "expo-router";
import { KeyRound } from "lucide-react-native";
import { useRef, useState } from "react";
import type { TextInputInstance } from "react-native";

const background = require("@/assets/images/auth-background.jpg");

export default function RecoverScreen() {
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [newCode, setNewCode] = useState<string | null>(null);

  const passwordRef = useRef<TextInputInstance>(null);
  const confirmRef = useRef<TextInputInstance>(null);

  const { errors, setErrors, submitting, run, release } = useFormSubmit();

  function submit() {
    if (password !== confirm) {
      setErrors({ fields: { confirm: "Las contraseñas no coinciden" } });
      return;
    }
    void run(
      async () => {
        setNewCode(await recoverAdmin({ code, password }));
        release();
      },
      (_, error) => {
        if (error instanceof InvalidCredentialsError) {
          setErrors({ fields: { code: "Código incorrecto" } });
        }
      },
    );
  }

  if (newCode) {
    return <RecoveryCodeScreen code={newCode} onDone={() => router.back()} />;
  }

  return (
    <FormScreen
      title="Recuperar cuenta"
      subtitle="Ingresa el código de recuperación del Administrador y elige una contraseña nueva"
      background={background}
    >
      <TextField
        label="Código de recuperación"
        placeholder="XXXX-XXXX-XXXX"
        value={code}
        onChangeText={setCode}
        error={errors.fields.code}
        autoCapitalize="characters"
        autoCorrect={false}
        returnKeyType="next"
        onSubmitEditing={() => passwordRef.current?.focus()}
      />
      <TextField
        ref={passwordRef}
        label="Nueva contraseña"
        placeholder="Crea una contraseña"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        error={errors.fields.password}
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
      <Button
        title="Cambiar contraseña"
        icon={KeyRound}
        weight="md"
        iconSize="lg"
        accent="lg"
        size="lg"
        className="mt-2 self-end"
        onPress={submit}
        loading={submitting}
      />
    </FormScreen>
  );
}
