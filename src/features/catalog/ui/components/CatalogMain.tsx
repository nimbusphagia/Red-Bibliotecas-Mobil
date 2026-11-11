import { TableColumn } from "@/shared/ui/components/table/Table";
import { useRouter } from "expo-router";
import { View } from "react-native";
import { BookRow, Contributor, MOCK_BOOKS } from "../mock";
import BookList from "./bookList/BookList";

const formatContributors = (list: Contributor[]) => {
  const names = list.map((c) =>
    [c.firstName, c.lastName].filter(Boolean).join(" "),
  );
  return [...new Set(names)].join(", ");
};

const columns: TableColumn<BookRow>[] = [
  { key: "title", title: "Título", flex: 3 },
  {
    key: "contributors",
    title: "Autores",
    flex: 2,
    render: (b) => formatContributors(b.contributors),
  },
  { key: "series", title: "Serie", flex: 1, render: (b) => b.series ?? "—" },
  {
    key: "collection",
    title: "Colección",
    flex: 1.5,
    render: (b) => b.collection ?? "—",
  },
  {
    key: "category",
    title: "Categoría",
    flex: 1,
    render: (b) => b.category ?? "—",
  },
  { key: "shelf", title: "Estante", flex: 0.7, render: (b) => b.shelf ?? "—" },
  {
    key: "publisher",
    title: "Editorial",
    flex: 1,
    render: (b) => b.publisher ?? "—",
  },
  {
    key: "available",
    title: "Disp.",
    flex: 0.7,
    align: "center",
    render: (b) => `${b.availableCount}/${b.copyCount}`,
  },
];

type Props = {};
export default function CatalogMain({}: Props) {
  const router = useRouter();

  return (
    <View className="py-8">
      <BookList books={MOCK_BOOKS} />
    </View>
  );
}
