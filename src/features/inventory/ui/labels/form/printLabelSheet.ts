import type { PrintLabel } from "@/features/inventory/internal/copy/types";
import { buildLabelSheet } from "@/features/inventory/internal/labelSheet/pdf";
import { toISODate } from "@/features/shared/format/dates";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";

const pad = (n: number) => String(n).padStart(2, "0");

export async function shareLabelSheet(labels: PrintLabel[]): Promise<void> {
  const now = new Date();
  const bytes = await buildLabelSheet(labels, now);
  const name = `tejuelos_${toISODate(now)}_${pad(now.getHours())}${pad(now.getMinutes())}.pdf`;

  const file = new File(Paths.cache, name);
  file.create({ overwrite: true });
  file.write(bytes);

  await Sharing.shareAsync(file.uri, {
    mimeType: "application/pdf",
    dialogTitle: "Tejuelos",
  });
}
