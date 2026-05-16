import { FormEvent, useState } from "react";
import { backendAdapter } from "../lib/backend/adapter";

export function ResetPasswordPage() {
  const [message, setMessage] = useState<string | null>(null);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const result = backendAdapter.requestPasswordReset(String(form.get("email")));
    setMessage(result.message);
  }

  return (
    <section className="section narrow">
      <h1>Сброс пароля</h1>
      <form className="form card" onSubmit={onSubmit}>
        <label>
          Email
          <input name="email" type="email" autoComplete="email" required />
        </label>
        <button type="submit" className="btn btn-primary">
          Отправить ссылку
        </button>
      </form>
      {message && (
        <p className="success" role="status" aria-live="polite">
          {message}
        </p>
      )}
    </section>
  );
}
