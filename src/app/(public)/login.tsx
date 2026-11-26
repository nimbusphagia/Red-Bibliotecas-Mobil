import { ACCOUNT_ROLES } from "@/db/schema";
import { useSession } from "@/features/account/internal/session";
import { ACCOUNT_NAMES } from "@/features/account/internal/setup";
import type { AccountRole } from "@/features/account/internal/types";
import {
  FormScreen,
  TextField,
  Button,
  FieldError,
  InlineFilter,
  Text,
} from "@/features/shared/components";

import { router } from "expo-router";
import { KeyRound } from "lucide-react-native";
import { useState } from "react";
import { View } from "react-native";
import { useFormSubmit } from "@/features/shared/hooks/useFormSubmit";

const background = require("@/assets/images/auth-background.jpg");

const ROLES = ACCOUNT_ROLES.map((value) => ({
  value,
  label: ACCOUNT_NAMES[value],
}));

export default function LoginScreen() {
  const { signIn } = useSession();
  const [role, setRole] = useState<AccountRole>("staff");
  const [password, setPassword] = useState("");

  const { errors, submitting, run } = useFormSubmit();
  const submit = () =>
    run(
      () => signIn(role, password),
      () => setPassword(""),
    );

  return (
    <FormScreen title="Inicia sesión" background={background}>
      <View className="gap-3">
        <Text variant="item">Cuenta</Text>
        <InlineFilter options={ROLES} value={role} onChange={setRole} />
      </View>
      <TextField
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
      <View className="mt-2 flex-row items-center justify-between">
        {role === "admin" ? (
          <Button
            title="¿Olvidaste la contraseña?"
            variant="ghost"
            size="sm"
            onPress={() => router.push("/recover")}
          />
        ) : (
          <Text variant="caption" className="flex-1">
            Si la olvidaste, pide a una cuenta superior que la restablezca
          </Text>
        )}
        <Button
          title="Iniciar sesión"
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
