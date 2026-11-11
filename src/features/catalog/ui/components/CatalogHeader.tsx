import { Button } from "@/shared/ui/components";
import Header from "@/shared/ui/components/header/Header";
import Searchbar from "@/shared/ui/components/search/Searchbar";
import { colors } from "@/shared/ui/utils";
import {
  ArrowDownUp,
  NotebookPen,
  SlidersHorizontal,
} from "lucide-react-native";
import { useState } from "react";

type Props = {};
export default function CatalogHeader({}: Props) {
  const [search, setSearch] = useState("");

  return (
    <Header title="Catálogo">
      <Searchbar
        value={search}
        onChangeText={setSearch}
        placeholder="Buscar libro por titulo, autor, categoría..."
      />

      <Button
        variant="pill-secondary"
        lucideIcon={<ArrowDownUp size={18} color={colors.highlight} />}
      />
      <Button
        variant="pill-secondary"
        lucideIcon={<SlidersHorizontal size={18} color={colors.highlight} />}
      />
      <Button
        title="Registrar"
        variant="pill"
        lucideIcon={<NotebookPen size={18} color={colors.background} />}
      />
    </Header>
  );
}
