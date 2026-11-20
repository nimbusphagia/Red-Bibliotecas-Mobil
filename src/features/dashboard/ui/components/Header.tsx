import { Button, PageHeader } from "@/features/shared/components";
import { Link } from "expo-router";
import { BookDown, BookUp } from "lucide-react-native";

export default function DashboardHeader() {
  return (
    <PageHeader title="Inicio">
      <Link href="/loans/new" asChild>
        <Button title="Prestar" icon={BookUp} />
      </Link>
      <Link href="/loans" asChild>
        <Button title="Devolver" icon={BookDown} />
      </Link>
    </PageHeader>
  );
}
