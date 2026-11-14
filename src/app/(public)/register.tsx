import { completeSetup } from "@/features/account/internal/service";
import { useSession } from "@/features/account/internal/session";
import {
  FormScreen,
  TextField,
  Button,
  Text,
  FieldError,
} from "@/features/shared/components";
import { Image } from "expo-image";
import { useRef, useState } from "react";
import type { TextInputInstance } from "react-native";
import { View } from "react-native";
import splash from "../../../assets/images/splash1.avif";
import { useFormSubmit } from "@/features/shared/hooks/useFormSubmit";
import { LoadingScreen } from "@/features/shared/layout/LoadingScreen";

export default function RegisterScreen() {
  const { finishSetup } = useSession();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const passwordRef = useRef<TextInputInstance>(null);
  const confirmRef = useRef<TextInputInstance>(null);

  const { errors, setErrors, submitting, run } = useFormSubmit();

  function submit() {
    if (password !== confirm) {
      setErrors({ fields: { confirm: "Las contraseñas no coinciden" } });
      return;
    }
    run(async () => {
      await completeSetup({ username, password });
      finishSetup();
    });
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
        <FieldError>{errors.form}</FieldError>
        <Button title="Registrar" onPress={submit} />
      </FormScreen>
      <Image source={splash} contentFit="cover" style={{ flex: 1 }} />
    </View>
  );
}
