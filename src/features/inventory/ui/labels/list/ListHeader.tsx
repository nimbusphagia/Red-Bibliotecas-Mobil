import { PageHeader, Searchbar } from "@/features/shared/components";

type Props = {
  search: string;
  onSearchChange: (text: string) => void;
};

export function ListHeader({ search, onSearchChange }: Props) {
  return (
    <PageHeader title="Tejuelos">
      <Searchbar
        value={search}
        onChangeText={onSearchChange}
        placeholder="Buscar por título o tejuelo..."
      />
    </PageHeader>
  );
}
