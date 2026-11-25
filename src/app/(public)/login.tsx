import { useSession } from "@/features/account/internal/session";
import {
  FormScreen,
  TextField,
  Button,
  FieldError,
} from "@/features/shared/components";

import { KeyRound } from "lucide-react-native";
import { useRef, useState } from "react";
import type { TextInputInstance } from "react-native";
import { useFormSubmit } from "@/features/shared/hooks/useFormSubmit";

const background = require("@/assets/images/auth-background.jpg");

export default function LoginScreen() {
  const { signIn } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const passwordRef = useRef<TextInputInstance>(null);

  const { errors, submitting, run } = useFormSubmit();
  const submit = () =>
    run(
      () => signIn(email, password),
      () => setPassword(""),
    );

  return (
    <FormScreen title="Inicia sesión" background={background}>
      <TextField
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
        placeholder="Ingresa tu contraseña"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        error={errors.fields.password}
        returnKeyType="done"
        onSubmitEditing={submit}
      />
      <FieldError>{errors.form}</FieldError>
      <Button
        title="Iniciar sesión"
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
