import {
  Divider,
  FormSection,
  SplitColumns,
} from "@/features/shared/components";
import { Fragment } from "react";
import { View } from "react-native";
import { BookFormField } from "./fields/BookFormField";
import type { Field } from "./fields/fields";
import type { BookFormState } from "./useBookForm";

type Props = { form: BookFormState; onEdit: (field: Field) => void };

export function BookFormSections({ form, onEdit }: Props) {
  return (
    <SplitColumns>
      {form.columns.map((groups, i) => (
        <View key={i} className="gap-8">
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
      ))}
    </SplitColumns>
  );
}
