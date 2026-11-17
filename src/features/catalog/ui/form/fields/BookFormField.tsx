import { FieldRow, type Option } from "@/features/shared/components";
import { display, type Field } from "./fields";
import InlinePick from "./InlinePick";
import type { BookFormState } from "../useBookForm";
import type { BookFormValues } from "./values";

type Props = {
  field: Field;
  form: BookFormState;
  compact?: boolean;
  onEdit: (field: Field) => void;
};

export function BookFormField({ field: f, form, compact, onEdit }: Props) {
  const { values, errors, locked, isRequired, onFieldChange } = form;
  const label = isRequired(f) ? `${f.label} *` : f.label;
  const error = errors.fields[f.error ?? f.key];
  const disabled = locked && f.lockable;

  if (f.inline) {
    return (
      <InlinePick
        field={f}
        label={label}
        value={values[f.key] as Option | undefined}
        disabled={disabled}
        error={error}
        onChange={(o) =>
          onFieldChange({ [f.key]: o } as Partial<BookFormValues>)
        }
      />
    );
  }

  return (
    <FieldRow
      label={label}
      value={display(values[f.key]) ?? undefined}
      error={error}
      disabled={disabled || (f.key === "collection" && !values.publisher)}
      onPress={() => onEdit(f)}
      className={compact ? "w-[50%]" : undefined}
      contentClass={compact ? "flex-1 text-center" : undefined}
    />
  );
}
