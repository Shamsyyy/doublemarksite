import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { Mail, Lock, Building2, Hash, Phone, UserPlus } from "lucide-react";

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    const form = new FormData(event.currentTarget);
    try {
      const result = await register({
        email: String(form.get("email")),
        password: String(form.get("password")),
        companyName: String(form.get("companyName")),
        inn: String(form.get("inn") ?? ""),
        phone: String(form.get("phone") ?? ""),
        consent: form.get("consent") === "on",
      });
      if (result.needsEmailConfirmation) {
        setMessage("Проверьте почту для подтверждения регистрации.");
        return;
      }
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
          <div className="input-wrap has-icon">
            <Mail className="input-icon" size={16} />
            <input
              name="email"
              type="email"
              autoComplete="email"
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "register-form-error" : undefined}
              required
            />
          </div>
        </label>
        <label>
          Пароль (мин. 8 символов)
          <div className="input-wrap has-icon">
            <Lock className="input-icon" size={16} />
            <input
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "register-form-error" : undefined}
              required
            />
          </div>
        </label>
        <label>
          Организация
          <div className="input-wrap has-icon">
            <Building2 className="input-icon" size={16} />
            <input name="companyName" autoComplete="organization" required />
          </div>
        </label>
        <label>
          ИНН (10 или 12 цифр, необязательно)
          <div className="input-wrap has-icon">
            <Hash className="input-icon" size={16} />
            <input name="inn" inputMode="numeric" />
          </div>
        </label>
        <label>
          Телефон
          <div className="input-wrap has-icon">
            <Phone className="input-icon" size={16} />
            <input name="phone" type="tel" autoComplete="tel" />
          </div>
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
        {message && (
          <p className="success" role="status" aria-live="polite">
            {message}
          </p>
        )}
        <button type="submit" className="btn btn-primary">
          <UserPlus size={16} />
          Создать аккаунт
        </button>
      </form>
      <p>
        Уже есть аккаунт? <Link to="/login">Войти</Link>
      </p>
    </section>
  );
}
