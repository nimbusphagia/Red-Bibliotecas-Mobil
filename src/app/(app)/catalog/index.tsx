import { Link } from "expo-router";
import { ScreenPlaceholder } from "@/ui/layout/ScreenPlaceholder";

export default function CatalogScreen() {
  return (
    <ScreenPlaceholder title="Catalog">
      <Link href={{ pathname: "/catalog/[id]", params: { id: "1" } }}>
        Open book 1
      </Link>
    </ScreenPlaceholder>
  );
}
