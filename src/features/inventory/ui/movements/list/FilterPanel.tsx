import { MOVEMENT_REASONS, MOVEMENT_TYPES } from "@/db/schema";
import type {
  MovementReason,
  MovementType,
} from "@/features/inventory/internal/movement/types";
import {
  Button,
  Dialog,
  DialogHeader,
  SimpleSelect,
} from "@/features/shared/components";
import {
  MOVEMENT_REASON_ES,
  MOVEMENT_TYPE_ES,
} from "@/features/shared/format/translate";
import { Minimize2 } from "lucide-react-native";

export type MovementFilters = {
  type?: MovementType;
  reason?: MovementReason;
};

const TYPE_OPTIONS = MOVEMENT_TYPES.map((id) => ({
  id,
  label: MOVEMENT_TYPE_ES[id],
}));

const REASON_OPTIONS = MOVEMENT_REASONS.map((id) => ({
  id,
  label: MOVEMENT_REASON_ES[id],
}));

type Props = {
  filters: MovementFilters;
  onChange: (filters: MovementFilters) => void;
  open: boolean;
  onClose: () => void;
};

export default function FilterPanel({
  filters,
  onChange,
  open,
  onClose,
}: Props) {
  if (!open) return null;

  return (
    <Dialog onClose={onClose}>
      <DialogHeader
        title="Filtros"
        actions={
          <>
            <Button
              title="Limpiar"
              variant="solid"
              onPress={() => onChange({})}
            />
            <Button
              variant="accent"
              icon={Minimize2}
              weight="md"
              onPress={onClose}
            />
          </>
        }
      />
      <SimpleSelect
        label="Tipo"
        options={TYPE_OPTIONS}
        value={filters.type}
        onChange={(type) => onChange({ ...filters, type })}
      />
      <SimpleSelect
        label="Motivo"
        options={REASON_OPTIONS}
        value={filters.reason}
        onChange={(reason) => onChange({ ...filters, reason })}
      />
    </Dialog>
  );
}
