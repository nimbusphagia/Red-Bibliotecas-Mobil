import { Panel, SplitColumns } from "@/features/shared/components";
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
          {groups.map((g) => (
            <Fragment key={g.title}>
              <Panel title={g.title} tone={g.tone}>
                {g.fields.filter(form.isVisible).map((f) => (
                  <BookFormField
                    key={f.key}
                    field={f}
                    form={form}
                    compact={g.compact}
                    onEdit={onEdit}
                  />
                ))}
              </Panel>
            </Fragment>
          ))}
        </View>
      ))}
    </SplitColumns>
  );
}
