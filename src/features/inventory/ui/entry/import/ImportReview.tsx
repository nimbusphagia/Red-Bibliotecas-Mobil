import type {
  ImportPlan,
  ToCreate,
} from "@/features/inventory/internal/entryImport/types";
import {
  Chip,
  ChipGroup,
  Icon,
  Surface,
  Text,
} from "@/features/shared/components";
import { importProblemLabel } from "@/features/shared/format/translate";
import {
  ChevronDown,
  ChevronUp,
  TriangleExclamationPoint,
  type LucideIcon,
} from "lucide-react-native";
import { useState, type PropsWithChildren, type ReactNode } from "react";
import { Pressable, View } from "react-native";
import { isReady } from "./toLines";

const MAX_NAMES = 8;

const plural = (n: number, one: string, many: string) =>
  `${n} ${n === 1 ? one : many}`;

function names(list: { name: string }[]) {
  const shown = list.slice(0, MAX_NAMES).map((i) => i.name);
  const more = list.length - shown.length;
  return shown.join(", ") + (more > 0 ? ` y ${more} más` : "");
}

const CREATE_LABELS: {
  key: keyof ToCreate;
  one: string;
  many: string;
}[] = [
  { key: "authors", one: "autor", many: "autores" },
  { key: "publishers", one: "editorial", many: "editoriales" },
  { key: "collections", one: "colección", many: "colecciones" },
  { key: "series", one: "serie", many: "series" },
];

function Section({
  icon,
  title,
  defaultOpen = true,
  children,
}: PropsWithChildren<{
  icon?: LucideIcon;
  title: ReactNode;
  defaultOpen?: boolean;
}>) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Surface inset className="gap-4 p-4">
      <Pressable
        onPress={() => setOpen((o) => !o)}
        className="flex-row items-center gap-2"
      >
        {icon && <Icon icon={icon} size="lg" stroke="sm" />}
        <View className="flex-1">{title}</View>
        <Icon icon={open ? ChevronUp : ChevronDown} />
      </Pressable>
      {open && children}
    </Surface>
  );
}

/** Resumen de un archivo ya revisado: qué se carga, qué se crea y qué falla. */
export default function ImportReview({ plan }: { plan: ImportPlan }) {
  const ready = plan.rows.filter(isReady);
  const failed = plan.rows.filter((r) => !isReady(r));
  const copies = ready.reduce((n, r) => n + r.quantity, 0);

  return (
    <View className="gap-6">
      {plan.ignoredColumns.length > 0 && (
        <Text variant="caption">
          Columnas ignoradas: {plan.ignoredColumns.join(", ")}
        </Text>
      )}

      {CREATE_LABELS.map(({ key, one, many }) => {
        const list = plan.toCreate[key];
        return list.length === 0 ? null : (
          <View key={key} className="gap-1">
            <Text variant="item">
              Se {list.length === 1 ? "creará" : "crearán"}{" "}
              {plural(list.length, one, many)}
            </Text>
            <Text variant="caption">{names(list)}</Text>
          </View>
        );
      })}

      {ready.length > 0 && (
        <Section
          title={
            <Text variant="item">
              Resumen{" "}
              <Text variant="caption">
                ({plural(ready.length, "libro", "libros")} ·{" "}
                {plural(copies, "ejemplar", "ejemplares")})
              </Text>
            </Text>
          }
        >
          <ChipGroup>
            {ready.map((r) => (
              <Chip
                key={r.row}
                label={r.title}
                detail={[
                  ...r.writers.map((w) => w.name),
                  plural(r.quantity, "ejemplar", "ejemplares"),
                ].join(" · ")}
              />
            ))}
          </ChipGroup>
        </Section>
      )}

      {failed.length > 0 && (
        <Section
          icon={TriangleExclamationPoint}
          defaultOpen={false}
          title={
            <Text variant="item">
              Problemas{" "}
              <Text variant="caption">
                ({plural(failed.length, "libro", "libros")} · No serán
                importados)
              </Text>
            </Text>
          }
        >
          <ChipGroup>
            {failed.map((r) => (
              <Chip
                key={r.row}
                label={`#${r.row}`}
                detail={[...new Set(r.problems.map(importProblemLabel))].join(
                  ", ",
                )}
              />
            ))}
          </ChipGroup>
        </Section>
      )}
    </View>
  );
}
