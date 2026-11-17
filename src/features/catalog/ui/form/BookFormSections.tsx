import { Divider, FormSection } from "@/features/shared/components";
import { useLayoutMode } from "@/features/shared/hooks/useLayoutMode";
import { cn } from "@/features/shared/theme";
import { Fragment } from "react";
import { View } from "react-native";
import { BookFormField } from "./fields/BookFormField";
import type { Field } from "./fields/fields";
import type { BookFormState } from "./useBookForm";

type Props = { form: BookFormState; onEdit: (field: Field) => void };

export function BookFormSections({ form, onEdit }: Props) {
  const { isExpanded } = useLayoutMode();

  return (
    <View className={cn("gap-8", isExpanded && "flex-row")}>
      {form.columns.map((groups, i) => (
        <Fragment key={i}>
          {i > 0 && <Divider vertical={isExpanded} />}
          <View
            className={cn(
              "gap-8",
              isExpanded && "flex-1",
              isExpanded && i === 0 && "w-[80%]",
            )}
          >
            {groups.map((g, j) => (
              <Fragment key={g.title}>
                {j > 0 && <Divider />}
                <FormSection title={g.title}>
                  {g.fields.filter(form.isVisible).map((f) => (
                    <BookFormField
                      key={f.key}
                      field={f}
                      form={form}
                      compact={g.compact}
                      onEdit={onEdit}
                    />
                  ))}
                </FormSection>
              </Fragment>
            ))}
          </View>
        </Fragment>
      ))}
    </View>
  );
}
