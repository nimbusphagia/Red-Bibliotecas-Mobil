import { Search } from "lucide-react-native";
import { TextInput, View } from "react-native";
import { cn, colors } from "../../../theme";
import { Icon } from "../../base/Icon";

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  className?: string;
};

export function Searchbar({
  value,
  onChangeText,
  className,
  placeholder = "Buscar...",
}: Props) {
  return (
    <View
      className={cn(
        "flex flex-row items-center gap-2 w-full max-w-[400px] h-full px-4 rounded-lg bg-white",
        className,
      )}
    >
      <TextInput
        className="flex-1 h-full text-dark1 font-sans"
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.dark3}
        returnKeyType="search"
      />
      <Icon icon={Search} tone="dark1" />
    </View>
  );
}
