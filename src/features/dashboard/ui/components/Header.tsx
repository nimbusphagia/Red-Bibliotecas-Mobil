import { Button, PageHeader } from "@/features/shared/components";
import { colors } from "@/features/shared/theme";
import { BookDown, BookUp, NotebookPen } from "lucide-react-native";

type Props = {};
export default function DashboardHeader({}: Props) {
  return (
    <PageHeader title="Inicio">
      <Button
        title="Nuevo ejemplar"
        icon={<NotebookPen size={18} color={colors.bg} />}
      />
      <Button title="Prestar" icon={<BookUp size={18} color={colors.bg} />} />
      <Button
        title="Devolver"
        icon={<BookDown size={18} color={colors.bg} />}
      />
    </PageHeader>
  );
}
