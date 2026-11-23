import { Icon, Panel, SplitColumns, Text } from "@/features/shared/components";
import { Info } from "lucide-react-native";
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
        <View key={i} className="gap-6">
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
                {g.description && (
                  <View className="mt-2 flex-row items-center gap-2">
                    <Icon icon={Info} size="md" tone="faint" />
                    <Text variant="captionXs" className="flex-1">
                      {g.description}
                    </Text>
                  </View>
                )}
              </Panel>
            </Fragment>
          ))}
        </View>
      ))}
    </SplitColumns>
  );
}
