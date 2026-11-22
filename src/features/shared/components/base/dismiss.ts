import { createContext } from "react";

/**
 * Cada toque dentro del panel de un Dialog sube `tick`. `except` es el id del
 * control (SearchSelect) sobre el que cayó el toque, si lo hubo: ese no debe
 * cerrarse. Los demás controles desplegables se cierran solos, sin cerrar el
 * Dialog.
 */
export type DialogDismiss = {
  tick: number;
  except: string | null;
  protect: (id: string) => void;
};

export const DialogDismissContext = createContext<DialogDismiss>({
  tick: 0,
  except: null,
  protect: () => {},
});
