import { completeSetup } from "@/features/account/internal/service";
import { useSession } from "@/features/account/internal/session";
import {
  toFormErrors,
  type FormErrors,
} from "@/features/shared/errors/messages";
import { Button, Text } from "@/features/shared/ui/components";
import { FormScreen, TextField } from "@/features/shared/ui/components/form";
import { LoadingScreen } from "@/features/shared/ui/layout/LoadingScreen";
import { Image } from "expo-image";
import { useRef, useState } from "react";
import type { TextInputInstance } from "react-native";
import { View } from "react-native";
import splash from "../../../assets/images/splash1.avif";

export default function RegisterScreen() {
  const { finishSetup } = useSession();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<FormErrors>({ fields: {} });
  const [submitting, setSubmitting] = useState(false);

  const passwordRef = useRef<TextInputInstance>(null);
  const confirmRef = useRef<TextInputInstance>(null);

  async function submit() {
    if (submitting) return;
    if (password !== confirm) {
      setErrors({ fields: { confirm: "Las contraseñas no coinciden" } });
      return;
    }
    setErrors({ fields: {} });
    setSubmitting(true);
    try {
      await completeSetup({ username, password });
      finishSetup();
    } catch (error) {
      setErrors(toFormErrors(error));
      setSubmitting(false);
    }
  }

  if (submitting) {
    return <LoadingScreen message="Configurando el sistema…" />;
  }

  return (
    <View className="flex flex-row h-full">
      <FormScreen
        title="Crea tu usuario"
        subtitle="El usuario principal administra el sistema"
      >
        <TextField
          label="Nombre de usuario"
          value={username}
          onChangeText={setUsername}
          error={errors.fields.username}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="next"
          onSubmitEditing={() => passwordRef.current?.focus()}
        />
        <TextField
          ref={passwordRef}
          label="Contraseña"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          error={errors.fields.password}
          returnKeyType="next"
          onSubmitEditing={() => confirmRef.current?.focus()}
        />
        <TextField
          ref={confirmRef}
          label="Confirma tu contraseña"
          secureTextEntry
          value={confirm}
          onChangeText={setConfirm}
          error={errors.fields.confirm}
          returnKeyType="done"
          onSubmitEditing={submit}
        />
        {errors.form ? (
          <Text className="text-sm text-red-600">{errors.form}</Text>
        ) : null}
        <Button title="Registrar" onPress={submit} />
      </FormScreen>
      <Image source={splash} contentFit="cover" style={{ flex: 1 }} />
    </View>
  );
}
