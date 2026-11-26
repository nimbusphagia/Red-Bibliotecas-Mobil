import { Button, FormScreen, Text } from "@/features/shared/components";
import { Check } from "lucide-react-native";

const background = require("@/assets/images/auth-background.jpg");

type Props = { code: string; onDone: () => void };

export default function RecoveryCodeScreen({ code, onDone }: Props) {
  return (
    <FormScreen
      title="Código de recuperación"
      subtitle="Anótalo y guárdalo en un lugar seguro. Sirve para recuperar la cuenta de Administrador si se olvida la contraseña, y no se volverá a mostrar."
      background={background}
    >
      <Text
        variant="display"
        selectable
        className="self-center font-sans-medium tracking-widest"
      >
        {code}
      </Text>
      <Button
        title="Ya lo anoté"
        icon={Check}
        weight="md"
        iconSize="lg"
        accent="lg"
        size="lg"
        className="mt-2 self-end"
        onPress={onDone}
      />
    </FormScreen>
  );
}
