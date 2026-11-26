import { useSession } from "@/features/account/internal/session";
import { getCopy } from "@/features/inventory/internal/copy/service";
import type { CopyItem } from "@/features/inventory/internal/copy/types";
import CopySelector from "@/features/inventory/ui/picker/CopySelector";
import {
  getLoanExpiry,
  getVisitorLoanStatus,
  lendCopies,
} from "@/features/loans/internal/loan/service";
import type { VisitorLoanStatus } from "@/features/loans/internal/loan/types";
import { getVisitorItem } from "@/features/loans/internal/visitor/service";
import type { VisitorListItem } from "@/features/loans/internal/visitor/types";
import {
  FieldError,
  FieldRow,
  FormHeader,
  Icon,
  LabeledItem,
  NotesDialog,
  Panel,
  SplitColumns,
  Text,
  type Option,
} from "@/features/shared/components";
import { formatDate, formatISO } from "@/features/shared/format/dates";
import { useFormSubmit } from "@/features/shared/hooks/useFormSubmit";
import { useLayoutMode } from "@/features/shared/hooks/useLayoutMode";
import { ScreenBody } from "@/features/shared/layout/Screen";
import { useRouter } from "expo-router";
import { Info } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { View } from "react-native";
import { PickVisitorDialog } from "./loans/form/LoanDialogs";
import { visitorInfoRows } from "./visitors/visitorRows";

export default function LoanForm({ copyId }: { copyId?: string }) {
  const router = useRouter();
  const session = useSession();
  const { errors, setErrors, submitting, run } = useFormSubmit();
  const [visitor, setVisitor] = useState<Option>();
  const [visitorItem, setVisitorItem] = useState<VisitorListItem>();
  const [status, setStatus] = useState<VisitorLoanStatus>();
  const [expiresBy, setExpiresBy] = useState<string>();
  const [loadFailed, setLoadFailed] = useState(false);
  const [copies, setCopies] = useState<CopyItem[]>([]);
  const loadMore = useRef<() => void>(undefined);
  const [notes, setNotes] = useState("");
  const [editing, setEditing] = useState<"visitor" | "notes" | null>(null);
  const { isExpanded } = useLayoutMode();

  useEffect(() => {
    if (copyId)
      getCopy(Number(copyId))
        .then((c) => setCopies([c]))
        .catch(() =>
          setErrors({ form: "No se pudo cargar el ejemplar", fields: {} }),
        );
  }, [copyId, setErrors]);

  useEffect(() => {
    setVisitorItem(undefined);
    setStatus(undefined);
    setExpiresBy(undefined);
    setLoadFailed(false);
    if (!visitor) return;
    let stale = false;
    Promise.all([
      getVisitorItem(visitor.id),
      getVisitorLoanStatus(visitor.id),
      getLoanExpiry(visitor.id),
    ])
      .then(([v, s, e]) => {
        if (stale) return;
        setVisitorItem(v);
        setStatus(s);
        setExpiresBy(e);
      })
      .catch(() => {
        if (!stale) setLoadFailed(true);
      });
    return () => {
      stale = true;
    };
  }, [visitor]);

  const submit = () => {
    if (session.status !== "signed-in" || !visitor) return;
    void run(async () => {
      const { movement } = await lendCopies(session.account.id, {
        visitorId: visitor.id,
        copyIds: copies.map((c) => c.id),
        notes,
      });
      router.replace(`/loans/${movement.id}`);
    });
  };

  const toggleCopy = (c: CopyItem) =>
    setCopies((p) =>
      p.some((x) => x.id === c.id) ? p.filter((x) => x.id !== c.id) : [...p, c],
    );
  const close = () => setEditing(null);

  // En vertical no hay panel de detalles: las notas pasan al del visitante.
  const notesRow = (
    <FieldRow
      label="Notas"
      value={notes || undefined}
      error={errors.fields.notes}
      onPress={() => setEditing("notes")}
    />
  );

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
      <ScreenBody form onEndReached={() => loadMore.current?.()}>
        <FieldError>
          {errors.form ??
            (loadFailed
              ? "No se pudieron cargar los datos del visitante"
              : undefined)}
        </FieldError>
        <SplitColumns>
          <Panel
            title="Visitante"
            className="grow"
            lead={
              status && (
                <View className="flex-row items-center gap-1.5">
                  <Icon icon={Info} size="sm" />
                  {status.blocked ? (
                    <Text variant="caption">
                      Bloqueado: {status.overdue} ejemplares vencidos
                    </Text>
                  ) : (
                    <Text variant="caption">
                      {status.open === 1
                        ? "1 ejemplar prestado"
                        : `${status.open} ejemplares prestados`}
                      {status.remaining
                        ? `, puede prestar ${status.remaining} más`
                        : ", límite alcanzado"}
                    </Text>
                  )}
                </View>
              )
            }
          >
            <FieldRow
              label="Nombre *"
              value={visitor?.label}
              error={errors.fields.visitorId}
              onPress={() => setEditing("visitor")}
            />
            {visitorInfoRows(visitorItem).map((r) => (
              <LabeledItem key={r.label} {...r} labelWidth="form" />
            ))}
            {!isExpanded && notesRow}
          </Panel>
          {isExpanded && (
            <Panel title="Detalles" className="grow">
              <LabeledItem
                label="Encargado"
                content={
                  session.status === "signed-in"
                    ? session.account.name
                    : undefined
                }
                labelWidth="form"
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
              {notesRow}
            </Panel>
          )}
        </SplitColumns>
        <CopySelector
          selected={copies}
          onToggle={toggleCopy}
          error={errors.fields.copyIds}
          loadMoreRef={loadMore}
        />
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
    </>
  );
}
