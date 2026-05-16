import { FormEvent, useState } from "react";
import { backendAdapter } from "../lib/backend/adapter";
import { Mail, Send } from "lucide-react";

export function ResetPasswordPage() {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    const form = new FormData(event.currentTarget);
    try {
      const result = await backendAdapter.requestPasswordReset(String(form.get("email")));
      setMessage(result.message);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка отправки ссылки");
    }
  }

  return (
    <section className="section narrow">
      <h1>Сброс пароля</h1>
      <form className="form card" onSubmit={onSubmit}>
        <label>
          Email
          <div className="input-wrap has-icon">
            <Mail className="input-icon" size={16} />
            <input name="email" type="email" autoComplete="email" required />
          </div>
        </label>
        <button type="submit" className="btn btn-primary">
          <Send size={16} />
          Отправить ссылку
        </button>
      </form>
      {message && (
        <p className="success" role="status" aria-live="polite">
          {message}
        </p>
      )}
      {error && (
        <p className="error" role="alert" aria-live="assertive">
          {error}
        </p>
      )}
    </section>
  );
}
