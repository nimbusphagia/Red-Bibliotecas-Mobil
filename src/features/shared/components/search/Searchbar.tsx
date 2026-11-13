import { Search } from "lucide-react-native";
import { TextInput, View } from "react-native";
import { colors } from "../../theme";

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
};

export default function Searchbar({
  value,
  onChangeText,
  placeholder = "Buscar...",
}: Props) {
  return (
    <View className="flex flex-row items-center gap-2 w-[400px] h-full px-4 rounded-full bg-fg1">
      <TextInput
        className="flex-1 h-full text-primary font-sans font-medium"
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.secondary}
        returnKeyType="search"
      />
      <Search size={18} color={colors.highlight} strokeWidth={3} />
    </View>
  );
}
