import { PageHeader, Searchbar } from "@/features/shared/components";
import type { ReactNode } from "react";

type Props = {
  title: string;
  create: ReactNode;
  search: string;
  onSearchChange: (text: string) => void;
  placeholder: string;
};

export default function ListHeader({
  title,
  create,
  search,
  onSearchChange,
  placeholder,
}: Props) {
  return (
    <PageHeader title={title} lead={create}>
      <Searchbar
        value={search}
        onChangeText={onSearchChange}
        placeholder={placeholder}
      />
    </PageHeader>
  );
}
