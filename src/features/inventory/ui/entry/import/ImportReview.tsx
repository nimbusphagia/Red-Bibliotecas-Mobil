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
import { useState, type PropsWithChildren } from "react";
import { Pressable, View } from "react-native";
import { isReady } from "./toLines";

const plural = (n: number, one: string, many: string) =>
  `${n} ${n === 1 ? one : many}`;

const CREATE_LABELS: {
  key: keyof ToCreate;
  title: string;
  one: string;
  many: string;
}[] = [
  { key: "authors", title: "Autores", one: "autor", many: "autores" },
  {
    key: "publishers",
    title: "Editoriales",
    one: "editorial",
    many: "editoriales",
  },
  {
    key: "collections",
    title: "Colecciones",
    one: "colección",
    many: "colecciones",
  },
  { key: "series", title: "Series", one: "serie", many: "series" },
];

function Section({
  icon,
  title,
  subtitle,
  children,
}: PropsWithChildren<{
  icon?: LucideIcon;
  title: string;
  subtitle: string;
}>) {
  const [open, setOpen] = useState(false);
  return (
    <Surface inset className="gap-4 p-4">
      <Pressable
        onPress={() => setOpen((o) => !o)}
        className="flex-row items-center gap-2"
      >
        {icon && <Icon icon={icon} size="lg" stroke="sm" />}
        <View className="flex-1">
          <Text variant="item">{title}</Text>
          <Text variant="caption">{subtitle}</Text>
        </View>
        <Icon icon={open ? ChevronUp : ChevronDown} />
      </Pressable>
      {open && children}
    </Surface>
  );
}

function Group({
  title,
  count,
  children,
}: PropsWithChildren<{ title: string; count: number }>) {
  return (
    <Surface tone="light" className="gap-3 rounded-lg p-3">
      <View className="flex-row items-baseline gap-2">
        <Text variant="item">{title}</Text>
        <Text variant="caption">{count}</Text>
      </View>
      <ChipGroup>{children}</ChipGroup>
    </Surface>
  );
}

/** Resumen de un archivo ya revisado: qué se carga, qué se crea y qué falla. */
export default function ImportReview({ plan }: { plan: ImportPlan }) {
  const ready = plan.rows.filter(isReady);
  const failed = plan.rows.filter((r) => !isReady(r));
  const copies = ready.reduce((n, r) => n + r.quantity, 0);
  const toCreate = CREATE_LABELS.map((l) => ({
    ...l,
    list: plan.toCreate[l.key],
  })).filter((l) => l.list.length > 0);

  return (
    <View className="gap-6">
      {plan.ignoredColumns.length > 0 && (
        <Text variant="caption">
          Columnas ignoradas: {plan.ignoredColumns.join(", ")}
        </Text>
      )}

      {ready.length > 0 && (
        <Section
          title="Resumen"
          subtitle={`${plural(ready.length, "libro", "libros")} · ${plural(copies, "ejemplar", "ejemplares")}`}
        >
          <Group title="Libros" count={ready.length}>
            {ready.map((r) => (
              <Chip key={r.row} label={r.title} detail={String(r.quantity)} />
            ))}
          </Group>
        </Section>
      )}

      {toCreate.length > 0 && (
        <Section
          title="Se crearán"
          subtitle={toCreate
            .map(({ list, one, many }) => plural(list.length, one, many))
            .join(" · ")}
        >
          {toCreate.map(({ key, title, list }) => (
            <Group key={key} title={title} count={list.length}>
              {list.map((i) => (
                <Chip key={i.key} label={i.name} />
              ))}
            </Group>
          ))}
        </Section>
      )}

      {failed.length > 0 && (
        <Section
          icon={TriangleExclamationPoint}
          title="Problemas"
          subtitle={`${plural(failed.length, "libro", "libros")} · No serán importados`}
        >
          <Group title="Libros" count={failed.length}>
            {failed.map((r) => (
              <Chip
                key={r.row}
                label={`#${r.row}`}
                detail={[...new Set(r.problems.map(importProblemLabel))].join(
                  ", ",
                )}
              />
            ))}
          </Group>
        </Section>
      )}
    </View>
  );
}
