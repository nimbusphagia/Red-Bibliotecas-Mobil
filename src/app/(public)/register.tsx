import { useRef, useState } from "react";
import { View } from "react-native";
import type { TextInputInstance } from "react-native";
import { Image } from "expo-image";
import { FormScreen, TextField } from "@/ui/components/form";
import { Button, Text } from "@/ui/components";
import { LoadingScreen } from "@/ui/layout/LoadingScreen";
import { useSession } from "@/features/account/session";
import { completeSetup } from "@/features/account/service";
import { toFormErrors, type FormErrors } from "@/errors/messages";
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
