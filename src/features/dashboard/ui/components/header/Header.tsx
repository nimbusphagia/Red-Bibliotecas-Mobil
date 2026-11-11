import { Button } from "@/shared/ui/components";
import Header from "@/shared/ui/components/header/Header";
import { colors } from "@/shared/ui/utils";
import { BookDown, BookUp, NotebookPen } from "lucide-react-native";

type Props = {};
export default function DashboardHeader({}: Props) {
  return (
    <Header title="Inicio">
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
    </Header>
  );
}
