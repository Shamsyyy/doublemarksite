import { FormEvent, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);
    try {
      await login(String(form.get("email")), String(form.get("password")));
      const fromCandidate = (location.state as { from?: string } | null)?.from;
      const from =
        fromCandidate && /^\/(?!\/)/.test(fromCandidate) ? fromCandidate : "/account";
      navigate(from);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка входа");
    }
  }

  return (
    <section className="section narrow">
      <h1>Вход</h1>
      <form className="form card" onSubmit={onSubmit}>
        <label>
          Email
          <input
            name="email"
            type="email"
            autoComplete="email"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "login-form-error" : undefined}
            required
          />
        </label>
        <label>
          Пароль
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "login-form-error" : undefined}
            required
          />
        </label>
        {error && (
          <p id="login-form-error" className="error" role="alert" aria-live="assertive">
            {error}
          </p>
        )}
        <button type="submit" className="btn btn-primary">
          Войти
        </button>
      </form>
      <p>
        <Link to="/reset-password">Забыли пароль?</Link> · <Link to="/register">Регистрация</Link>
      </p>
    </section>
  );
}
