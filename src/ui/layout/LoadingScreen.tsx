import { ActivityIndicator, View } from "react-native";
import { Button, Text } from "@/ui/components";
import { colors } from "@/ui/utils";

export function LoadingScreen({ message }: { message?: string }) {
  return (
    <View className="flex-1 items-center justify-center gap-4">
      <ActivityIndicator size="large" color={colors.spinnerOnLight} />
      {message ? <Text>{message}</Text> : null}
    </View>
  );
}

export function BootErrorScreen({ onRetry }: { onRetry: () => void }) {
  return (
    <View className="flex-1 items-center justify-center gap-4 p-6">
      <Text className="text-xl font-bold">
        No se pudo iniciar la aplicación
      </Text>
      <Text>Ocurrió un error al preparar la base de datos.</Text>
      <Button title="Reintentar" onPress={onRetry} />
    </View>
  );
}
