import { PageHeader, Button } from "@/features/shared/components";
import { colors } from "@/features/shared/theme";
import { BookDown, BookUp, NotebookPen } from "lucide-react-native";
import { View } from "react-native";

type Props = {};
export default function DashboardHeader({}: Props) {
  return (
    <PageHeader title="Inicio">
      <View className="flex-1 flex-row justify-end items-center gap-5">
        <Button
          title="Nuevo ejemplar"
          variant="pill"
          lucideIcon={<NotebookPen size={18} color={colors.bg} />}
        />
        <Button
          title="Prestar"
          variant="pill"
          lucideIcon={<BookUp size={18} color={colors.bg} />}
        />
        <Button
          title="Devolver"
          variant="pill"
          lucideIcon={<BookDown size={18} color={colors.bg} />}
        />
      </View>
    </PageHeader>
  );
}
