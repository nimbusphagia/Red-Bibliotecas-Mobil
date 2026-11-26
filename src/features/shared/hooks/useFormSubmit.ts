import { useState } from "react";
import { toFormErrors, type FormErrors } from "../errors/messages";

export function useFormSubmit() {
  const [errors, setErrors] = useState<FormErrors>({ fields: {} });
  const [submitting, setSubmitting] = useState(false);

  async function run(
    action: () => Promise<unknown>,
    onError?: (errors: FormErrors, error: unknown) => void,
  ) {
    if (submitting) return;
    setErrors({ fields: {} });
    setSubmitting(true);
    try {
      await action();
    } catch (error) {
      const e = toFormErrors(error);
      setErrors(e);
      setSubmitting(false);
      onError?.(e, error);
    }
  }

  // Tras un envío correcto `submitting` sigue en true (la pantalla suele
  // cerrarse); `release` lo libera cuando el formulario queda abierto.
  const release = () => setSubmitting(false);

  return { errors, setErrors, submitting, run, release };
}
