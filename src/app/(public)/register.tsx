import { completeSetup } from "@/features/account/internal/service";
import { useSession } from "@/features/account/internal/session";
import RecoveryCodeScreen from "@/features/account/ui/components/RecoveryCodeScreen";
import {
  FormScreen,
  TextField,
  Button,
  FieldError,
} from "@/features/shared/components";
import { ArrowRight } from "lucide-react-native";
import { useRef, useState } from "react";
import type { TextInputInstance } from "react-native";
import { useFormSubmit } from "@/features/shared/hooks/useFormSubmit";
import { LoadingScreen } from "@/features/shared/layout/LoadingScreen";

const background = require("@/assets/images/auth-background.jpg");

export default function RegisterScreen() {
  const { finishSetup } = useSession();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [code, setCode] = useState<string | null>(null);

  const confirmRef = useRef<TextInputInstance>(null);

  const { errors, setErrors, submitting, run, release } = useFormSubmit();

  function submit() {
    if (password !== confirm) {
      setErrors({ fields: { confirm: "Las contraseñas no coinciden" } });
      return;
    }
    void run(async () => {
      setCode(await completeSetup({ password }));
      release();
    });
  }

  if (code) return <RecoveryCodeScreen code={code} onDone={finishSetup} />;

  if (submitting) {
    return <LoadingScreen message="Configurando el sistema…" />;
  }

  return (
    <FormScreen
      title="Bienvenido,"
      subtitle="Para gestionar tu biblioteca, primero crea la contraseña del Administrador"
      background={background}
    >
      <TextField
        label="Contraseña"
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
        title="Empezar"
        icon={ArrowRight}
        iconPosition="end"
        weight="md"
        iconSize="lg"
        accent="lg"
        size="lg"
        className="mt-2 self-end"
        onPress={submit}
      />
    </FormScreen>
  );
}
