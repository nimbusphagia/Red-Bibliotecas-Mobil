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
  DialogActions,
  DialogBody,
  DialogHeader,
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
import { View } from "react-native";

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
    <>
      <DialogHeader title={visitor ? "Editar visitante" : "Nuevo visitante"} />
      <DialogBody>
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
      </DialogBody>
      <FieldError>{errors.form}</FieldError>
      <DialogActions
        confirmTitle="Guardar"
        loading={submitting}
        onConfirm={save}
        onCancel={onCancel}
      />
    </>
  );
}
