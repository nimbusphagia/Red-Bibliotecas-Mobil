import { Button, PageHeader, Searchbar } from "@/features/shared/components";
import { colors } from "@/features/shared/theme";
import { SquarePlus } from "lucide-react-native";

type Props = {
  search: string;
  onSearchChange: (text: string) => void;
  onCreate: () => void;
};

export function ListHeader({ search, onSearchChange, onCreate }: Props) {
  return (
    <PageHeader
      title="Estantería"
      lead={
        <Button
          title="Nuevo"
          icon={<SquarePlus size={18} color={colors.bg} />}
          onPress={onCreate}
        />
      }
    >
      <Searchbar
        value={search}
        onChangeText={onSearchChange}
        placeholder="Buscar por nombre..."
      />
    </PageHeader>
  );
}
