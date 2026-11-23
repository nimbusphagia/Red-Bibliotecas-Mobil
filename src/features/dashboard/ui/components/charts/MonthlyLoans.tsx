import type { MonthCount } from "@/features/dashboard/internal/types";
import { Panel, Text } from "@/features/shared/components";
import { cn, useTone } from "@/features/shared/theme";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { View } from "react-native";

// Desde aquí la barra tapa el número: se pinta con el color de texto del acento.
const LABEL_OVERLAP = 0.85;

export default function MonthlyLoans({ months }: { months: MonthCount[] }) {
  const total = months.reduce((sum, m) => sum + m.count, 0);

  return (
    <Panel
      tone="dark"
      title="Préstamos por mes"
      className="py-3 pb-4"
      lead={<Text variant="caption">{total} ejemplares</Text>}
    >
      <Bars months={months} />
    </Panel>
  );
}

// Va dentro del Panel dark para tomar sus colores.
function Bars({ months }: { months: MonthCount[] }) {
  const t = useTone();
  const max = Math.max(1, ...months.map((m) => m.count));

  return (
    <View className="flex-row gap-4 px-2 rounded-xl">
      {months.map((m) => {
        const ratio = m.count / max;
        return (
          <View key={m.month.getTime()} className="flex-1 items-center gap-1">
            <View
              className={cn(
                "h-32 w-full justify-end overflow-hidden rounded-md",
                t.inset,
              )}
            >
              <View
                className={cn("w-full rounded-md", t.accent.box)}
                style={{ height: `${ratio * 100}%`, minHeight: 4 }}
              />
              {m.count > 0 && (
                <Text
                  variant="itemSm"
                  className={cn(
                    "absolute inset-x-0 bottom-3 text-center",
                    ratio >= LABEL_OVERLAP && t.accent.label,
                  )}
                >
                  {m.count}
                </Text>
              )}
            </View>
            <Text variant="itemSm" className="capitalize">
              {format(m.month, "MMM", { locale: es })}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
