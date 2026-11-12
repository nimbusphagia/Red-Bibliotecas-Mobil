import { Button } from "@/features/shared/ui/components";
import Header from "@/features/shared/ui/components/header/Header";
import { colors } from "@/features/shared/ui/utils";
import { BookDown, BookUp, NotebookPen } from "lucide-react-native";
import { View } from "react-native";

type Props = {};
export default function DashboardHeader({}: Props) {
  return (
    <Header title="Inicio">
      <View className="flex-1 flex-row justify-end items-center gap-5">
        <Button
          title="Nuevo ejemplar"
          variant="pill"
          lucideIcon={<NotebookPen size={18} color={colors.background} />}
        />
        <Button
          title="Prestar"
          variant="pill"
          lucideIcon={<BookUp size={18} color={colors.background} />}
        />
        <Button
          title="Devolver"
          variant="pill"
          lucideIcon={<BookDown size={18} color={colors.background} />}
        />
      </View>
    </Header>
  );
}
