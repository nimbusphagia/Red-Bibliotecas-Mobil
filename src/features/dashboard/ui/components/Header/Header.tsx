import { Button, Text } from "@/ui/components";
import { colors } from "@/ui/utils";
import { BookDown, BookUp, NotebookPen } from "lucide-react-native";
import { View } from "react-native";

type Props = {};
export default function DashboardHeader({}: Props) {
  return (
    <View className="flex flex-row justify-between items-center">
      <Text
        className="text-highlight"
        style={{ fontSize: 24, fontWeight: 600 }}
      >
        Inicio
      </Text>
      <View className="flex flex-row gap-5">
        <Button
          title="Nuevo ejemplar"
          variant="pill"
          lucideIcon={<NotebookPen color={colors.background} />}
        />
        <Button
          title="Prestar"
          variant="pill"
          lucideIcon={<BookUp color={colors.background} />}
        />
        <Button
          title="Devolver"
          variant="pill"
          lucideIcon={<BookDown color={colors.background} />}
        />
      </View>
    </View>
  );
}
