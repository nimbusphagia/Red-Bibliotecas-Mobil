import { Button, Text } from "@/features/shared/components";
import { colors, useTone } from "@/features/shared/theme";
import { ActivityIndicator, View } from "react-native";

export function LoadingScreen({ message }: { message?: string }) {
  const t = useTone();
  return (
    <View className="flex-1 items-center justify-center gap-4">
      <ActivityIndicator size="large" color={colors[t.icon]} />
      {message ? <Text>{message}</Text> : null}
    </View>
  );
}

export function BootErrorScreen({ onRetry }: { onRetry: () => void }) {
  return (
    <View className="flex-1 items-center justify-center gap-4 p-6">
      <Text variant="section">No se pudo iniciar la aplicación</Text>
      <Text>Ocurrió un error al preparar la base de datos.</Text>
      <Button title="Reintentar" onPress={onRetry} />
    </View>
  );
}
