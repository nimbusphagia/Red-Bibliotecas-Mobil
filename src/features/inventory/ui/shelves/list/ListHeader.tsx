import { Button, PageHeader, Searchbar } from "@/features/shared/components";
import { colors } from "@/features/shared/theme";
import { Link } from "expo-router";
import { ArrowRightLeft, SquarePlus } from "lucide-react-native";

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
        <>
          <Button
            title="Nuevo"
            icon={<SquarePlus size={18} color={colors.bg} />}
            onPress={onCreate}
          />
          <Link href="/shelves/reorganize" asChild>
            <Button
              variant="secondary"
              title="Reorganizar"
              icon={<ArrowRightLeft size={18} color={colors.primary} />}
            />
          </Link>
        </>
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
