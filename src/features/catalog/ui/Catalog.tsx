import { View } from "react-native";
import CatalogHeader from "./components/CatalogHeader";
import CatalogMain from "./components/CatalogMain";

type Props = {};
export default function Catalog({}: Props) {
  return (
    <View>
      <CatalogHeader />
      <CatalogMain />
    </View>
  );
}
