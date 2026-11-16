import { useSession } from "@/features/account/internal/session";
import {
  getVisitorLoanStatus,
  lendCopies,
} from "@/features/loans/internal/loan/service";
import type { VisitorLoanStatus } from "@/features/loans/internal/loan/types";
import {
  FieldError,
  FormHeader,
  MultiSearchSelect,
  SearchSelect,
  Text,
  TextField,
  type Option,
} from "@/features/shared/components";
import { useFormSubmit } from "@/features/shared/hooks/useFormSubmit";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import { searchCopy, searchVisitors } from "./options";

export default function LoanForm({ copyId }: { copyId?: string }) {
  const router = useRouter();
  const session = useSession();
  const { errors, submitting, run } = useFormSubmit();
  const [visitor, setVisitor] = useState<Option>();
  const [status, setStatus] = useState<VisitorLoanStatus>();
  const [copies, setCopies] = useState<Option[]>([]);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (copyId) searchCopy(copyId).then(setCopies);
  }, [copyId]);

  useEffect(() => {
    setStatus(undefined);
    if (!visitor) return;
    let stale = false;
    getVisitorLoanStatus(visitor.id).then((s) => !stale && setStatus(s));
    return () => {
      stale = true;
    };
  }, [visitor]);

  const submit = () => {
    if (session.status !== "signed-in" || !visitor) return;
    run(async () => {
      const { movement } = await lendCopies(session.account.id, {
        visitorId: visitor.id,
        copyIds: copies.map((c) => c.id),
        notes,
      });
      router.replace(`/loans/${movement.id}`);
    });
  };

  return (
    <>
      <FormHeader
        title="Nuevo préstamo"
        submitTitle="Registrar"
        submitting={submitting}
        canSubmit={!!visitor && copies.length > 0 && !status?.blocked}
        onSubmit={submit}
        onCancel={() => router.back()}
      />
      <ScrollView
        className="flex-1"
        contentContainerClassName="w-full max-w-xl gap-6 p-4 pt-7"
        keyboardShouldPersistTaps="handled"
      >
        <FieldError>{errors.form}</FieldError>

        <View className="gap-2">
          <SearchSelect
            label="Visitante *"
            value={visitor}
            onChange={setVisitor}
            fetchOptions={searchVisitors}
            placeholder="Buscar visitante..."
          />
          {status && (
            <Text variant="subtitle">
              {status.blocked
                ? `Bloqueado: ${status.overdue} ejemplares vencidos`
                : `${status.open} abiertos · puede llevar ${status.remaining} más`}
            </Text>
          )}
          <FieldError>{errors.fields.visitorId}</FieldError>
        </View>

        <View className="gap-2">
          <MultiSearchSelect
            label="Ejemplares *"
            values={copies}
            onChange={setCopies}
            fetchOptions={searchCopy}
            exact
            placeholder="Agregar por tejuelo o ID..."
          />
          <FieldError>{errors.fields.copyIds}</FieldError>
        </View>

        <TextField
          label="Notas"
          value={notes}
          onChangeText={setNotes}
          error={errors.fields.notes}
          maxLength={500}
        />
      </ScrollView>
    </>
  );
}
