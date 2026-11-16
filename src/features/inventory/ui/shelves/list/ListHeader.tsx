import { Button, PageHeader, Searchbar } from "@/features/shared/components";
import { colors } from "@/features/shared/theme";
import { SquarePlus } from "lucide-react-native";

type Props = {
  search: string;
  onSearchChange: (text: string) => void;
};
export function ListHeader({ search, onSearchChange }: Props) {
  return (
    <PageHeader
      title="Estantería"
      lead={
        <Button
          className="highlight"
          title="Nuevo"
          icon={<SquarePlus size={18} color={colors.bg} />}
        />
      }
    >
      <Searchbar
        value={search}
        onChangeText={onSearchChange}
        placeholder="Buscar por tejuelo..."
      />
    </PageHeader>
  );
}
