import { View } from "react-native";

export function ActiveDot() {
  return (
    <View
      style={{ pointerEvents: "none" }}
      className="absolute right-0 top-0 size-2.5 rounded-full bg-highlight"
    />
  );
}
