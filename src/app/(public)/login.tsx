import { useRef, useState } from "react";
import { View } from "react-native";
import type { TextInputInstance } from "react-native";
import { Image } from "expo-image";
import { FormScreen, TextField } from "@/ui/components/form";
import { Button, Text } from "@/ui/components";
import { useSession } from "@/features/account/session";
import { toFormErrors, type FormErrors } from "@/errors/messages";
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
