import { Text } from "./Text";

export function ActiveCounter({ count }: { count: number }) {
  return (
    <Text
      variant="itemSm"
      style={{ pointerEvents: "none" }}
      className="absolute right-[-6] top-[-3] rounded-full bg-accent2 px-2 py-[1px] 
      text-dark1 text-[7px] 
      font-sans-bold text-center"
    >
      {count}
    </Text>
  );
}
