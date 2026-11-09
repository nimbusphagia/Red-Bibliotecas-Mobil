import { useRouter } from "expo-router";
import { FormScreen } from "@/components/ui/Formscreen";
import { Button, TextField } from "@/components/ui";

export default function LoginScreen() {
  const router = useRouter();

  return (
    <FormScreen title="Bienvenido" subtitle="Gestiona tu biblioteca">
      <TextField label="Nombre de usuario" secureTextEntry={false} />
      <TextField label="Contraseña" secureTextEntry={true} />
      <Button
        title="Iniciar sesión"
        onClick={() => router.replace("/dashboard")}
      />
    </FormScreen>
  );
}
