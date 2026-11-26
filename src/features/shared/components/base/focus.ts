import { createContext, useContext, useEffect, useId } from "react";

const KEYBOARD_DELAY = 150;

/** Dentro de un Dialog: id del campo que tiene el foco inicial. */
export const DialogFocusContext = createContext<{ first?: string } | null>(
  null,
);

/**
 * El primer campo que se monta en un Dialog llama a `onClaim` (enfocar o
 * abrir). Al desmontarse libera el turno, así un formulario que reemplaza
 * al buscador dentro del mismo Dialog también enfoca su primer campo.
 */
export function useDialogAutoFocus(onClaim: () => void, enabled = true) {
  const focus = useContext(DialogFocusContext);
  const id = useId();
  useEffect(() => {
    if (!focus || !enabled || focus.first) return;
    // eslint-disable-next-line react-hooks/immutability -- el contexto es un token mutable compartido a propósito.
    focus.first = id;
    // En Android, enfocar en el mismo frame del montaje (o justo después del
    // blur del campo anterior) enfoca pero no abre el teclado.
    const timer = setTimeout(onClaim, KEYBOARD_DELAY);
    return () => {
      clearTimeout(timer);
      if (focus.first === id) focus.first = undefined;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- solo al montar: el turno se reclama una vez.
  }, []);
}
