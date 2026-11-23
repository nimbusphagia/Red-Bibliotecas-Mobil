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

  return { errors, setErrors, submitting, run };
}
