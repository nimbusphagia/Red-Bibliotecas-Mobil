import { useRouter } from "expo-router";
import { FormScreen, TextField } from "@/ui/components/form";
import { Button } from "@/ui/components";
import { View } from "react-native";
import { Image } from "expo-image";
import splash from "../../../assets/images/splash1.avif";
import { Text } from "@/ui/components/Text";

export default function LoginScreen() {
  const router = useRouter();

  return (
    <View className="flex flex-row h-full">
      <Image source={splash} contentFit="cover" style={{ flex: 1 }} />
      <FormScreen
        title="Bienvenido"
        subtitle="Administra tu biblioteca facilmente"
      >
        <TextField label="Nombre de usuario" secureTextEntry={false} />
        <TextField label="Contraseña" secureTextEntry={true} />
        <Text>¿Olvidaste tu contraseña?</Text>
        <Button
          title="Iniciar sesión"
          onClick={() => router.replace("/dashboard")}
        />
      </FormScreen>
    </View>
  );
}
