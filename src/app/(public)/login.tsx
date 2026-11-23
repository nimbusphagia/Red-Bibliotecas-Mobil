import { useSession } from "@/features/account/internal/session";
import {
  FormScreen,
  TextField,
  Button,
  FieldError,
} from "@/features/shared/components";

import { Image } from "expo-image";
import { useRef, useState } from "react";
import type { TextInputInstance } from "react-native";
import { View } from "react-native";
import splash from "../../../assets/images/splash1.avif";
import { useFormSubmit } from "@/features/shared/hooks/useFormSubmit";

export default function LoginScreen() {
  const { signIn } = useSession();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const passwordRef = useRef<TextInputInstance>(null);

  const { errors, submitting, run } = useFormSubmit();
  const submit = () =>
    run(
      () => signIn(username, password),
      () => setPassword(""),
    );

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
        <FieldError>{errors.form}</FieldError>
        <Button title="Iniciar sesión" onPress={submit} loading={submitting} />
      </FormScreen>
    </View>
  );
}
