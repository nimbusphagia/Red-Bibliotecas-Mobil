import { completeSetup } from "@/features/account/internal/service";
import { useSession } from "@/features/account/internal/session";
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
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const emailRef = useRef<TextInputInstance>(null);
  const passwordRef = useRef<TextInputInstance>(null);
  const confirmRef = useRef<TextInputInstance>(null);

  const { errors, setErrors, submitting, run } = useFormSubmit();

  function submit() {
    if (password !== confirm) {
      setErrors({ fields: { confirm: "Las contraseñas no coinciden" } });
      return;
    }
    run(async () => {
      await completeSetup({ name, email, password });
      finishSetup();
    });
  }

  if (submitting) {
    return <LoadingScreen message="Configurando el sistema…" />;
  }

  return (
    <FormScreen
      title="Bienvenido,"
      subtitle="Para gestionar tu biblioteca, primero crea una cuenta de Administrador"
      background={background}
    >
      <TextField
        label="Nombre"
        placeholder="Tu nombre completo"
        value={name}
        onChangeText={setName}
        error={errors.fields.name}
        autoCapitalize="words"
        returnKeyType="next"
        onSubmitEditing={() => emailRef.current?.focus()}
      />
      <TextField
        ref={emailRef}
        label="Correo electrónico"
        placeholder="nombre@ejemplo.com"
        keyboardType="email-address"
        autoComplete="email"
        value={email}
        onChangeText={setEmail}
        error={errors.fields.email}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="next"
        onSubmitEditing={() => passwordRef.current?.focus()}
      />
      <TextField
        ref={passwordRef}
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
