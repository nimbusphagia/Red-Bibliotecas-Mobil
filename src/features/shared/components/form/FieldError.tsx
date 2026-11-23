import { status } from "../../theme";
import { Text } from "../base/Text";

export function FieldError({ children }: { children?: string | null }) {
  if (!children) return null;
  return (
    <Text variant="caption" className={status.error.text}>
      {children}
    </Text>
  );
}
