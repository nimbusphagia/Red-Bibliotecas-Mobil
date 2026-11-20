import { View } from "react-native";

export function ActiveDot() {
  return (
    <View
      style={{ pointerEvents: "none" }}
      className="absolute right-[-2] top-[-2] size-3 rounded-full bg-accent1"
    />
  );
}
