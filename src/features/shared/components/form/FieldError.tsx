import { Text } from "../base/Text";

export function FieldError({ children }: { children?: string | null }) {
  if (!children) return null;
  return (
    <Text variant="caption" className="text-error">
      {children}
    </Text>
  );
}
