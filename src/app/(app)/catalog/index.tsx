import Catalog from "@/features/catalog/ui/Catalog";
import { MainLayout } from "@/features/shared/layout/MainLayout";

export default function CatalogScreen() {
  return (
    <MainLayout title="">
      <Catalog />
    </MainLayout>
  );
}
