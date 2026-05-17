import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock, Save } from "lucide-react";
import { updatePassword } from "../lib/auth";
import { BrandLogo } from "../components/BrandLogo";

export function UpdatePasswordPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    const form = new FormData(event.currentTarget);
    const password = String(form.get("password"));
    const confirmPassword = String(form.get("confirmPassword"));

    if (password !== confirmPassword) {
      setError("Пароли не совпадают.");
      return;
    }

    setIsSubmitting(true);
    try {
      await updatePassword(password);
      setMessage("Пароль обновлён. Сейчас перенаправим вас на вход.");
      setTimeout(() => navigate("/login"), 1200);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка обновления пароля");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="section narrow">
      <BrandLogo size={44} withText={false} />
      <h1>Новый пароль</h1>
      <form className="form card" onSubmit={onSubmit}>
        <p className="muted">
          Введите новый пароль для аккаунта. Эта страница работает после перехода
          по ссылке из письма восстановления.
        </p>
        <label>
          Новый пароль
          <div className="input-wrap has-icon">
            <Lock className="input-icon" size={16} />
            <input
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
            />
          </div>
        </label>
        <label>
          Повторите пароль
          <div className="input-wrap has-icon">
            <Lock className="input-icon" size={16} />
            <input
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
            />
          </div>
        </label>
        {error && (
          <p className="error" role="alert" aria-live="assertive">
            {error}
          </p>
        )}
        {message && (
          <p className="success" role="status" aria-live="polite">
            {message}
          </p>
        )}
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          <Save size={16} />
          Сохранить пароль
        </button>
      </form>
      <p>
        <Link to="/login">Вернуться ко входу</Link>
      </p>
    </section>
  );
}
