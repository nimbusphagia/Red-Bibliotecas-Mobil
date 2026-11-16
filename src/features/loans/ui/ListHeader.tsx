import { Button, PageHeader, Searchbar } from "@/features/shared/components";
import type { ReactNode } from "react";

type Props = {
  title: string;
  toggleTitle: string;
  onToggle: () => void;
  create: ReactNode;
  search: string;
  onSearchChange: (text: string) => void;
  placeholder: string;
};

export default function ListHeader({
  title,
  toggleTitle,
  onToggle,
  create,
  search,
  onSearchChange,
  placeholder,
}: Props) {
  return (
    <PageHeader
      title={title}
      lead={
        <>
          <Button variant="secondary" title={toggleTitle} onPress={onToggle} />
          {create}
        </>
      }
    >
      <Searchbar
        value={search}
        onChangeText={onSearchChange}
        placeholder={placeholder}
      />
    </PageHeader>
  );
}
