import { Link } from "expo-router";
import { MainLayout } from "@/ui/layout/MainLayout";

export default function CatalogScreen() {
  return (
    <MainLayout title="Catalog">
      <Link href={{ pathname: "/catalog/[id]", params: { id: "1" } }}>
        Open book 1
      </Link>
    </MainLayout>
  );
}
