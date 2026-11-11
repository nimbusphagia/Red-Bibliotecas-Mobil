import { ScrollView, View } from "react-native";
import { BookRow } from "../../mock";
import BookRowComponent from "./BookRow";

type Props = {
  books: BookRow[];
};
export default function BookList({ books }: Props) {
  return (
    <ScrollView>
      <View className="gap-5 pt-5 pb-20">
        {books.map((b, i) => (
          <BookRowComponent key={b.id} book={b} index={i} />
        ))}
      </View>
    </ScrollView>
  );
}
