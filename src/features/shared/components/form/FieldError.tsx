import { Text } from "../base/Text";

export function FieldError({ children }: { children?: string | null }) {
  if (!children) return null;
  return <Text className="text-sm text-red-600">{children}</Text>;
}
