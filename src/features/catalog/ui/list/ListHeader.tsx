import { Button, PageHeader, Searchbar } from "@/features/shared/components";
import { colors } from "@/features/shared/theme";
import { Link } from "expo-router";
import { NotebookPen } from "lucide-react-native";

type Props = {
  search: string;
  onSearchChange: (text: string) => void;
};
export default function ListHeader({ search, onSearchChange }: Props) {
  return (
    <PageHeader
      title="Libros"
      lead={
        <Link href="/catalog/form" asChild>
          <Button
            title="Registrar"
            icon={<NotebookPen size={18} color={colors.bg} />}
          />
        </Link>
      }
    >
      <Searchbar
        value={search}
        onChangeText={onSearchChange}
        placeholder="Buscar por título, autor o editorial..."
      />
    </PageHeader>
  );
}
