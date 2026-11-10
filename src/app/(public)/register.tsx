import { useRouter } from "expo-router";
import { FormScreen, TextField } from "@/ui/components/form";
import { Button } from "@/ui/components";
import { View } from "react-native";
import { Image } from "expo-image";
import splash from "../../../assets/images/splash1.avif";

export default function RegisterScreen() {
  const router = useRouter();

  return (
    <View className="flex flex-row h-full">
      <FormScreen
        title="Crea tu usuario"
        subtitle="El usuario principal administra el sistema"
      >
        <TextField label="Nombre de usuario" secureTextEntry={false} />
        <TextField label="Contraseña" secureTextEntry={true} />
        <TextField label="Confirma tu contraseña" secureTextEntry={true} />
        <Button
          title="Registrar"
          onClick={() => router.replace("/dashboard")}
        />
      </FormScreen>
      <Image source={splash} contentFit="cover" style={{ flex: 1 }} />
    </View>
  );
}
