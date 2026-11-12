import { useSession } from "@/features/account/internal/session";
import {
  toFormErrors,
  type FormErrors,
} from "@/features/shared/errors/messages";
import { Button, Text } from "@/features/shared/ui/components";
import { FormScreen, TextField } from "@/features/shared/ui/components/form";
import { Image } from "expo-image";
import { useRef, useState } from "react";
import type { TextInputInstance } from "react-native";
import { View } from "react-native";
import splash from "../../../assets/images/splash1.avif";

export default function LoginScreen() {
  const { signIn } = useSession();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({ fields: {} });
  const [submitting, setSubmitting] = useState(false);

  const passwordRef = useRef<TextInputInstance>(null);

  async function submit() {
    if (submitting) return;
    setErrors({ fields: {} });
    setSubmitting(true);
    try {
      await signIn(username, password);
    } catch (error) {
      setErrors(toFormErrors(error));
      setPassword("");
      setSubmitting(false);
    }
  }

  return (
    <View className="flex flex-row h-full">
      <Image source={splash} contentFit="cover" style={{ flex: 1 }} />
      <FormScreen
        title="Bienvenido"
        subtitle="Administra tu biblioteca facilmente"
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
          returnKeyType="done"
          onSubmitEditing={submit}
        />
        {errors.form ? (
          <Text className="text-sm text-red-600">{errors.form}</Text>
        ) : null}
        <Button title="Iniciar sesión" onPress={submit} loading={submitting} />
      </FormScreen>
    </View>
  );
}
