import { useOptions } from "@/features/catalog/ui/options";
import { listSchoolGrades } from "@/features/loans/internal/reference/service";
import {
  createVisitor,
  updateVisitor,
} from "@/features/loans/internal/visitor/service";
import type {
  Visitor,
  VisitorListItem,
  VisitorRole,
} from "@/features/loans/internal/visitor/types";
import {
  Button,
  FieldError,
  InlineFilter,
  SimpleSelect,
  Text,
  TextField,
  type Option,
} from "@/features/shared/components";
import { gradeLabel } from "@/features/shared/format/translate";
import { useFormSubmit } from "@/features/shared/hooks/useFormSubmit";
import { useState } from "react";
import { ScrollView, View } from "react-native";

const ROLES: { value: VisitorRole; label: string }[] = [
  { value: "student", label: "Estudiante" },
  { value: "teacher", label: "Profesor" },
];

const loadGrades = async (): Promise<Option[]> =>
  (await listSchoolGrades()).map((g) => ({
    id: g.id,
    label: gradeLabel(g.grade, g.level),
  }));

type Props = {
  visitor?: VisitorListItem;
  initialName?: string;
  onCancel: () => void;
  onSaved: (saved: Visitor) => void;
};

export default function VisitorForm({
  visitor,
  initialName,
  onCancel,
  onSaved,
}: Props) {
  const [name, setName] = useState(visitor?.name ?? initialName ?? "");
  const [role, setRole] = useState<VisitorRole>(visitor?.role ?? "student");
  const [gradeId, setGradeId] = useState(visitor?.gradeId ?? undefined);
  const { errors, submitting, run } = useFormSubmit();
  const grades = useOptions(loadGrades);

  const save = () =>
    run(async () => {
      const saved = visitor
        ? await updateVisitor(visitor.id, {
            name,
            ...(role === "student" && { gradeId }),
          })
        : await createVisitor({
            name,
            role,
            gradeId: role === "student" ? (gradeId ?? null) : null,
          });
      onSaved(saved);
    });

  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerClassName="gap-4"
      showsVerticalScrollIndicator={false}
    >
      <Text variant="item">
        {visitor ? "Editar visitante" : "Nuevo visitante"}
      </Text>
      <TextField
        label="Nombre"
        value={name}
        onChangeText={setName}
        error={errors.fields.name}
        autoCapitalize="words"
        onSubmitEditing={save}
      />
      {!visitor && (
        <View className="gap-3">
          <Text variant="item">Rol</Text>
          <InlineFilter options={ROLES} value={role} onChange={setRole} />
        </View>
      )}
      {role === "student" && (
        <View className="gap-2">
          <SimpleSelect
            label="Grado"
            options={grades}
            value={gradeId}
            onChange={setGradeId}
          />
          <FieldError>{errors.fields.gradeId}</FieldError>
        </View>
      )}
      <FieldError>{errors.form}</FieldError>
      <View className="flex-row justify-end gap-4">
        <Button title="Cancelar" variant="secondary" onPress={onCancel} />
        <Button title="Guardar" loading={submitting} onPress={save} />
      </View>
    </ScrollView>
  );
}
