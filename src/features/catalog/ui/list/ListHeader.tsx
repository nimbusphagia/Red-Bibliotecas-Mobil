import { Button, PageHeader, Searchbar } from "@/features/shared/components";
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
          <Button title="Registrar" icon={NotebookPen} />
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
