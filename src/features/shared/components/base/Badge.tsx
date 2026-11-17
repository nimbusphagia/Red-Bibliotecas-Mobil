import { cn } from "../../theme";
import { Text } from "./Text";

type Variant = "active" | "pending" | "finished";
type Props = {
  variant: Variant;
  text: string;
  className?: string;
};
export function StatusBadge({ text, variant, className }: Props) {
  const baseClass = "px-2 py-1 rounded-full";
  const variantClass = {
    active: "border border-fg1 bg-fg1/50 text-primary",
    pending: "bg-primary text-bg",
    finished:
      "border border-fg1 bg-fg1/50 text-secondary px-2 py-1 rounded-full",
  };
  return (
    <Text
      variant="subtitle"
      className={cn(baseClass, variantClass[variant], className)}
    >
      {text}
    </Text>
  );
}
