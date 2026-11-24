import { Search } from "lucide-react-native";
import { useRef } from "react";
import { TextInput, View, type TextInputInstance } from "react-native";
import { cn, colors, useTone } from "../../../theme";
import { Icon } from "../../base/Icon";
import { useDialogAutoFocus } from "../../base/focus";

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  className?: string;
};

/** Campo de nivel 2 de la superficie actual (t.inset): white sobre el lienzo, bg sobre light1, darkSolid sobre dark1. */
export function Searchbar({
  value,
  onChangeText,
  className,
  placeholder = "Buscar...",
}: Props) {
  const t = useTone();
  const input = useRef<TextInputInstance>(null);
  useDialogAutoFocus(() => input.current?.focus());
  return (
    <View
      className={cn(
        "flex flex-row items-center gap-2 w-full max-w-[400px] h-full px-4 rounded-lg",
        t.inset,
        className,
      )}
    >
      <TextInput
        className={cn("flex-1 h-full font-sans", t.text)}
        value={value}
        onChangeText={onChangeText}
        ref={input}
        placeholder={placeholder}
        placeholderTextColor={colors[t.placeholder]}
        returnKeyType="search"
      />
      <Icon icon={Search} />
    </View>
  );
}
