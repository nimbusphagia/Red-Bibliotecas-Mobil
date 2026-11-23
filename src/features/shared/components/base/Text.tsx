import { Text as RNText, type TextProps } from "react-native";
import { cn, useTone } from "../../theme";

export type TextVariant =
  | "display"
  | "title"
  | "section"
  | "item"
  | "itemSm"
  | "itemXs"
  | "caption"
  | "captionXs";

// Solo tamaño y peso. El color sale de la superficie (useTone).
const sizes: Record<TextVariant, string> = {
  display: "font-sans-semibold text-[28px]",
  title: "font-sans-medium text-[24px]",
  section: "font-sans-regular text-[18px]",
  item: "font-sans-regular text-[16px]",
  itemSm: "font-sans text-[14px]",
  itemXs: "font-sans text-[13px]",
  caption: "font-sans text-[14px]",
  captionXs: "font-sans text-[13px]",
};

type Props = TextProps & { variant?: TextVariant; className?: string };

export function Text({ variant, className, ...props }: Props) {
  const t = useTone();
  return (
    <RNText
      className={cn(
        "font-sans",
        variant && sizes[variant],
        variant === "caption" || variant === "captionXs" ? t.muted : t.text,
        className,
      )}
      {...props}
    />
  );
}
