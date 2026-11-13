import { TextField } from "@/features/shared/components/form";
import {
  SimpleSelect,
  type Option,
} from "@/features/shared/components/select/Select";
import type { FormErrors } from "@/features/shared/errors/messages";
import { listShelves } from "@/features/inventory/internal/shelf/service";
import { useEffect, useState } from "react";
import type { BookFormValues } from "./values";

type Props = {
  values: BookFormValues;
  errors: FormErrors;
  onChange: (patch: Partial<BookFormValues>) => void;
};

export default function CopiesFields({ values, errors, onChange }: Props) {
  const [shelves, setShelves] = useState<Option[]>([]);
  const [defaultId, setDefaultId] = useState<number>();

  useEffect(() => {
    let stale = false;
    listShelves({ limit: 100 }).then(({ items }) => {
      if (stale) return;
      setShelves(
        items.map((s) => ({
          id: s.id,
          label: s.isDefault ? "General" : s.name,
        })),
      );
      setDefaultId(items.find((s) => s.isDefault)?.id);
    });
    return () => {
      stale = true;
    };
  }, []);

  return (
    <>
      <TextField
        label="Cantidad de ejemplares"
        value={values.quantity}
        onChangeText={(t) => onChange({ quantity: t.replace(/\D/g, "") })}
        keyboardType="number-pad"
        error={errors.fields.quantity}
        helperText="Máximo 100"
      />
      <SimpleSelect
        label="Estante"
        options={shelves}
        value={values.shelfId ?? defaultId}
        onChange={(shelfId) => onChange({ shelfId })}
      />
      {(errors.fields.omitWords !== undefined || values.omitWords !== "") && (
        <TextField
          label="Palabras a omitir del tejuelo (separadas por coma)"
          value={values.omitWords}
          onChangeText={(omitWords) => onChange({ omitWords })}
          error={errors.fields.omitWords}
          autoCapitalize="none"
        />
      )}
    </>
  );
}
