import { cn, useTone } from "../../theme";
import { Text } from "./Text";

export function ActiveCounter({ count }: { count: number }) {
  const t = useTone();
  return (
    <Text
      variant="itemSm"
      style={{ pointerEvents: "none" }}
      className={cn(
        "absolute right-[-6] top-[-3] rounded-full px-2 py-[1px]",
        "text-[7px] font-sans-semibold text-center",
        t.accent.box,
        t.accent.label,
      )}
    >
      {count}
    </Text>
  );
}
