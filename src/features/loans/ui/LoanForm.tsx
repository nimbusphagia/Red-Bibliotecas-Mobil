import { useSession } from "@/features/account/internal/session";
import {
  getLoanExpiry,
  getVisitorLoanStatus,
  lendCopies,
} from "@/features/loans/internal/loan/service";
import type { VisitorLoanStatus } from "@/features/loans/internal/loan/types";
import {
  Button,
  Divider,
  FieldError,
  FieldRow,
  FormHeader,
  FormSection,
  LabeledItem,
  Text,
  type Option,
} from "@/features/shared/components";
import { formatDate, formatISO } from "@/features/shared/format/dates";
import { useFormSubmit } from "@/features/shared/hooks/useFormSubmit";
import { useLayoutMode } from "@/features/shared/hooks/useLayoutMode";
import { cn } from "@/features/shared/theme";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import CopyTable from "./loans/CopyTable";
import {
  CopySearchDialog,
  NotesDialog,
  PickVisitorDialog,
} from "./loans/LoanDialogs";
import { copyById, type LoanCopy } from "./options";

export default function LoanForm({ copyId }: { copyId?: string }) {
  const router = useRouter();
  const session = useSession();
  const { errors, submitting, run } = useFormSubmit();
  const { isExpanded } = useLayoutMode();
  const [visitor, setVisitor] = useState<Option>();
  const [status, setStatus] = useState<VisitorLoanStatus>();
  const [expiresBy, setExpiresBy] = useState<string>();
  const [copies, setCopies] = useState<LoanCopy[]>([]);
  const [notes, setNotes] = useState("");
  const [editing, setEditing] = useState<"visitor" | "notes" | "copies" | null>(
    null,
  );

  useEffect(() => {
    if (copyId) copyById(Number(copyId)).then((r) => r && setCopies([r.copy]));
  }, [copyId]);

  useEffect(() => {
    setStatus(undefined);
    setExpiresBy(undefined);
    if (!visitor) return;
    let stale = false;
    Promise.all([
      getVisitorLoanStatus(visitor.id),
      getLoanExpiry(visitor.id),
    ]).then(([s, e]) => {
      if (stale) return;
      setStatus(s);
      setExpiresBy(e);
    });
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

  const toggleCopy = (c: LoanCopy) =>
    setCopies((p) =>
      p.some((x) => x.id === c.id) ? p.filter((x) => x.id !== c.id) : [...p, c],
    );
  const removeCopy = (id: number) =>
    setCopies((p) => p.filter((c) => c.id !== id));
  const close = () => setEditing(null);

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
        contentContainerClassName="gap-4 p-4 pt-7"
        keyboardShouldPersistTaps="handled"
      >
        <FieldError>{errors.form}</FieldError>
        <View className={cn("gap-8", isExpanded && "flex-row")}>
          <FormSection
            title="Detalles"
            className={isExpanded ? "flex-1" : undefined}
          >
            <View className="gap-2">
              <FieldRow
                label="Visitante *"
                value={visitor?.label}
                error={errors.fields.visitorId}
                onPress={() => setEditing("visitor")}
              />
              {status && (
                <Text variant="subtitle">
                  {status.blocked
                    ? `Bloqueado: ${status.overdue} ejemplares vencidos`
                    : `${status.open} abiertos · puede llevar ${status.remaining} más`}
                </Text>
              )}
            </View>
            <LabeledItem
              label="Encargado"
              content={
                session.status === "signed-in"
                  ? session.account.username
                  : undefined
              }
              labelClass="w-[110px]"
            />
            <FieldRow
              label="Notas"
              value={notes || undefined}
              error={errors.fields.notes}
              onPress={() => setEditing("notes")}
            />
            <LabeledItem
              label="Vencimiento"
              content={expiresBy && formatISO(expiresBy)}
              labelClass="w-[110px]"
            />
            <LabeledItem
              label="Registro"
              content={formatDate(new Date())}
              labelClass="w-[110px]"
            />
          </FormSection>

          <Divider vertical={isExpanded} />

          <FormSection
            title="Ejemplares *"
            className={isExpanded ? "flex-1" : undefined}
          >
            <Button
              variant="secondary"
              title="Agregar ejemplares"
              className="self-start"
              onPress={() => setEditing("copies")}
            />
            <CopyTable
              copies={copies}
              error={errors.fields.copyIds}
              onRemove={removeCopy}
            />
          </FormSection>
        </View>
      </ScrollView>

      {editing === "visitor" && (
        <PickVisitorDialog
          value={visitor}
          onChange={setVisitor}
          onClose={close}
        />
      )}
      {editing === "notes" && (
        <NotesDialog value={notes} onChange={setNotes} onClose={close} />
      )}
      {editing === "copies" && (
        <CopySearchDialog
          selected={copies}
          onToggle={toggleCopy}
          onClose={close}
        />
      )}
    </>
  );
}
