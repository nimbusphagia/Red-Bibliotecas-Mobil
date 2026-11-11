import { codeFrom } from "./titleCode";

export const authorCode = (firstName: string, lastName: string | null) =>
  codeFrom(lastName ?? firstName);

export type LabelParts = {
  categoryCode: string;
  authorCode: string;
  subcategoryCode: string;
  titleCode: string;
  copyNumber: number;
};

export const buildLabelText = (p: LabelParts): string =>
  [
    p.categoryCode,
    p.authorCode,
    p.subcategoryCode,
    p.titleCode,
    p.copyNumber,
  ].join("-");
