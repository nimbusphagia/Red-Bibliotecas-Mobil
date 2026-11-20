import { Button, PageHeader } from "@/features/shared/components";
import { colors } from "@/features/shared/theme";
import { Link } from "expo-router";
import { BookDown, BookUp } from "lucide-react-native";

export default function DashboardHeader() {
  return (
    <PageHeader title="Inicio">
      <Link href="/loans/new" asChild>
        <Button title="Prestar" icon={<BookUp size={18} color={colors.bg} />} />
      </Link>
      <Link href="/loans" asChild>
        <Button
          title="Devolver"
          icon={<BookDown size={18} color={colors.bg} />}
        />
      </Link>
    </PageHeader>
  );
}
