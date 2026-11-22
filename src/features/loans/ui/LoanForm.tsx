import { useSession } from "@/features/account/internal/session";
import {
  getLoanExpiry,
  getVisitorLoanStatus,
  lendCopies,
} from "@/features/loans/internal/loan/service";
import type { VisitorLoanStatus } from "@/features/loans/internal/loan/types";
import {
  Button,
  FieldError,
  FieldRow,
  FormHeader,
  Icon,
  LabeledItem,
  Panel,
  SplitColumns,
  Text,
  type Option,
} from "@/features/shared/components";
import { formatDate, formatISO } from "@/features/shared/format/dates";
import { useFormSubmit } from "@/features/shared/hooks/useFormSubmit";
import { ScreenBody } from "@/features/shared/layout/Screen";
import { useRouter } from "expo-router";
import { Dot } from "lucide-react-native";
import { useEffect, useState } from "react";
import { View } from "react-native";
import CopyTable from "./loans/form/CopyTable";
import {
  CopySearchDialog,
  NotesDialog,
  PickVisitorDialog,
} from "./loans/form/LoanDialogs";
import { copyById, type LoanCopy } from "./options";

export default function LoanForm({ copyId }: { copyId?: string }) {
  const router = useRouter();
  const session = useSession();
  const { errors, submitting, run } = useFormSubmit();
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
      <ScreenBody form>
        <FieldError>{errors.form}</FieldError>
        <SplitColumns>
          <Panel title="Detalles">
            <FieldRow
              label="Visitante *"
              value={visitor?.label}
              error={errors.fields.visitorId}
              onPress={() => setEditing("visitor")}
            />
            <LabeledItem
              label="Encargado"
              content={
                session.status === "signed-in"
                  ? session.account.username
                  : undefined
              }
              labelWidth="form"
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
              labelWidth="form"
            />
            <LabeledItem
              label="Registro"
              content={formatDate(new Date())}
              labelWidth="form"
            />
            {status && (
              <View className="flex-row items-center justify-end">
                {status.blocked ? (
                  <Text variant="caption">
                    Bloqueado: {status.overdue} ejemplares vencidos
                  </Text>
                ) : (
                  <>
                    <Text variant="caption">
                      {status.open} préstamos activos
                    </Text>
                    <Icon icon={Dot} tone="faint" />
                    <Text variant="caption">
                      {status.remaining
                        ? `Puede prestar ${status.remaining} más`
                        : "Límite alcanzado"}
                    </Text>
                  </>
                )}
              </View>
            )}
          </Panel>

          <Panel
            title="Ejemplares"
            lead={
              <Button
                title="Agregar"
                size="sm"
                onPress={() => setEditing("copies")}
              />
            }
          >
            <CopyTable
              copies={copies}
              error={errors.fields.copyIds}
              onRemove={removeCopy}
            />
          </Panel>
        </SplitColumns>
      </ScreenBody>

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
