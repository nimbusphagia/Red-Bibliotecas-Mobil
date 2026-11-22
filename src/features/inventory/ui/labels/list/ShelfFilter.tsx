import { loadShelves, useOptions } from "@/features/catalog/ui/options";
import {
  Button,
  Dialog,
  DialogBody,
  SimpleSelect,
} from "@/features/shared/components";
import { useState } from "react";

type Props = {
  value?: number;
  onChange: (shelfId?: number) => void;
};

export default function ShelfFilter({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const shelves = useOptions(loadShelves);
  const selected = shelves.find((s) => s.id === value);

  return (
    <>
      <Button
        title={selected?.label ?? "Estantería"}
        size="sm"
        variant={value === undefined ? "soft" : "accent"}
        onPress={() => setOpen(true)}
      />
      {open && (
        <Dialog onClose={() => setOpen(false)}>
          <DialogBody>
            <SimpleSelect
              label="Estantería"
              options={shelves}
              value={value}
              onChange={(id) => {
                onChange(id);
                setOpen(false);
              }}
            />
          </DialogBody>
        </Dialog>
      )}
    </>
  );
}
