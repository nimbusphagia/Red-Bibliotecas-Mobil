import { useSession } from "@/features/account/internal/session";
import {
  getVisitorLoanStatus,
  lendCopies,
} from "@/features/loans/internal/loan/service";
import type { VisitorLoanStatus } from "@/features/loans/internal/loan/types";
import {
  FieldError,
  FormHeader,
  Chip,
  SearchSelect,
  Text,
  TextField,
  InlineFilter,
  type Option,
} from "@/features/shared/components";
import { useFormSubmit } from "@/features/shared/hooks/useFormSubmit";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import { copyById, searchVisitors } from "./options";
import CopyQuickAdd from "./loans/CopyQuickAdd";
import CopyPicker from "./loans/CopyPicker";
import { useLayoutMode } from "@/features/shared/hooks/useLayoutMode";
import { cn } from "@/features/shared/theme";

type Tab = "form" | "search";

const TABS: { value: Tab; label: string }[] = [
  { value: "form", label: "Datos" },
  { value: "search", label: "Buscar libro" },
];

export default function LoanForm({ copyId }: { copyId?: string }) {
  const router = useRouter();
  const session = useSession();
  const { errors, submitting, run } = useFormSubmit();
  const [visitor, setVisitor] = useState<Option>();
  const [status, setStatus] = useState<VisitorLoanStatus>();
  const [copies, setCopies] = useState<Option[]>([]);
  const [notes, setNotes] = useState("");
  const { isExpanded } = useLayoutMode();
  const [tab, setTab] = useState<Tab>("form");
  const showForm = isExpanded || tab === "form";
  const showPicker = isExpanded || tab === "search";

  useEffect(() => {
    if (copyId) copyById(copyId).then((o) => o && setCopies([o]));
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

  const addCopy = (o: Option) =>
    setCopies((p) => (p.some((c) => c.id === o.id) ? p : [...p, o]));

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
      {!isExpanded && (
        <View className="px-4 pt-4">
          <InlineFilter options={TABS} value={tab} onChange={setTab} />
        </View>
      )}
      <View className={cn("flex-1", isExpanded && "flex-row gap-6")}>
        {showForm && (
          <ScrollView
            className="flex-1"
            contentContainerClassName="gap-6 p-4 pt-7"
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

            <View className="gap-3">
              <Text variant="h3">Ejemplares *</Text>
              <CopyQuickAdd onAdd={addCopy} />
              {copies.length > 0 && (
                <View className="flex-row flex-wrap gap-3">
                  {copies.map((c) => (
                    <Chip
                      key={c.id}
                      label={c.label}
                      selected
                      onPress={() =>
                        setCopies((p) => p.filter((x) => x.id !== c.id))
                      }
                    />
                  ))}
                </View>
              )}
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
        )}
        {isExpanded && <View className="w-px self-stretch bg-fg1" />}
        {showPicker && (
          <CopyPicker
            className="flex-1 px-4 pt-7"
            selected={copies}
            onAdd={addCopy}
          />
        )}
      </View>
    </>
  );
}
