import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);
    try {
      await register({
        email: String(form.get("email")),
        password: String(form.get("password")),
        companyName: String(form.get("companyName")),
        inn: String(form.get("inn") ?? ""),
        phone: String(form.get("phone") ?? ""),
        consent: form.get("consent") === "on",
      });
      navigate("/account");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка регистрации");
    }
  }

  return (
    <section className="section narrow">
      <h1>Регистрация</h1>
      <form className="form card" onSubmit={onSubmit}>
        <label>
          Email
          <input
            name="email"
            type="email"
            autoComplete="email"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "register-form-error" : undefined}
            required
          />
        </label>
        <label>
          Пароль (мин. 8 символов)
          <input
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "register-form-error" : undefined}
            required
          />
        </label>
        <label>
          Организация
          <input name="companyName" autoComplete="organization" required />
        </label>
        <label>
          ИНН (10 или 12 цифр, необязательно)
          <input name="inn" inputMode="numeric" />
        </label>
        <label>
          Телефон
          <input name="phone" type="tel" autoComplete="tel" />
        </label>
        <label className="checkbox">
          <input name="consent" type="checkbox" required />
          <span className="checkbox-text">
            Согласен с{" "}
            <Link to="/legal/privacy" target="_blank" rel="noopener noreferrer">
              политикой конфиденциальности
            </Link>{" "}
            и{" "}
            <Link to="/legal/terms" target="_blank" rel="noopener noreferrer">
              офертой
            </Link>
          </span>
        </label>
        {error && (
          <p id="register-form-error" className="error" role="alert" aria-live="assertive">
            {error}
          </p>
        )}
        <button type="submit" className="btn btn-primary">
          Создать аккаунт
        </button>
      </form>
      <p>
        Уже есть аккаунт? <Link to="/login">Войти</Link>
      </p>
    </section>
  );
}
