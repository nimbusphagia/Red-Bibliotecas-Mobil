import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";
import { fonts } from "./palette";

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-family": [{ font: Object.keys(fonts) }],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
