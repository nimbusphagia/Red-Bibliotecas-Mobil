import type {
  ImportPlan,
  ToCreate,
} from "@/features/inventory/internal/entryImport/types";
import { Text } from "@/features/shared/components";
import { importProblemText } from "@/features/shared/format/translate";
import { View } from "react-native";
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

/** Resumen de un archivo ya revisado: qué se carga, qué se crea y qué falla. */
export default function ImportReview({ plan }: { plan: ImportPlan }) {
  const ready = plan.rows.filter(isReady);
  const failed = plan.rows.filter((r) => !isReady(r));
  const copies = ready.reduce((n, r) => n + r.quantity, 0);

  return (
    <View className="gap-4">
      <View className="gap-1">
        <Text variant="item">
          {plural(ready.length, "libro listo", "libros listos")} ·{" "}
          {plural(copies, "ejemplar", "ejemplares")}
        </Text>
        {failed.length > 0 && (
          <Text variant="caption">
            {plural(failed.length, "fila con problemas", "filas con problemas")}{" "}
            (no se cargan)
          </Text>
        )}
        {plan.ignoredColumns.length > 0 && (
          <Text variant="caption">
            Columnas ignoradas: {plan.ignoredColumns.join(", ")}
          </Text>
        )}
      </View>

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

      {failed.length > 0 && (
        <View className="gap-3">
          <Text variant="item">Filas con problemas</Text>
          {failed.map((r) => (
            <View key={r.row} className="gap-1">
              <Text variant="itemSm" numberOfLines={1}>
                Fila {r.row} · {r.title || "Sin título"}
              </Text>
              {r.problems.map((p, i) => (
                <Text key={i} variant="caption">
                  {importProblemText(p)}
                </Text>
              ))}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
