import { ChangeEvent, FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { Mail, Building2, Hash, Phone, UserPlus } from "lucide-react";
import { BrandLogo } from "../components/BrandLogo";
import { PasswordInput } from "../components/PasswordInput";
import { formatPhoneInput, normalizePhoneE164 } from "../lib/phoneFormat";

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [phone, setPhone] = useState("");

  const passwordsMismatch =
    passwordConfirm.length > 0 && password !== passwordConfirm;

  function handlePhoneChange(event: ChangeEvent<HTMLInputElement>) {
    setPhone(formatPhoneInput(event.target.value));
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (password !== passwordConfirm) {
      setError("Пароли не совпадают.");
      return;
    }

    try {
      const form = new FormData(event.currentTarget);
      const result = await register({
        email: String(form.get("email")),
        password,
        passwordConfirm,
        companyName: String(form.get("companyName")),
        inn: String(form.get("inn") ?? ""),
        phone: normalizePhoneE164(phone),
        consent: form.get("personalDataConsent") === "on",
        acceptOffer: form.get("acceptOffer") === "on",
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
    <section className="section page-panel-wide">
      <div className="section-header">
        <BrandLogo size={44} withText={false} />
        <h1>Регистрация</h1>
        <p className="muted">Создайте аккаунт для подписки и загрузки DoubleMark.</p>
      </div>
      <form className="form panel" onSubmit={onSubmit}>
        <div className="panel-header">Данные организации</div>
        <div className="panel-body form">
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
            <PasswordInput
              name="password"
              show={showPassword}
              onToggle={() => setShowPassword((value) => !value)}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              invalid={Boolean(error) || passwordsMismatch}
              describedBy={
                passwordsMismatch
                  ? "register-password-mismatch"
                  : error
                    ? "register-form-error"
                    : undefined
              }
            />
          </label>
          <label>
            Подтверждение пароля
            <PasswordInput
              name="passwordConfirm"
              show={showPasswordConfirm}
              onToggle={() => setShowPasswordConfirm((value) => !value)}
              value={passwordConfirm}
              onChange={(event) => setPasswordConfirm(event.target.value)}
              invalid={Boolean(error) || passwordsMismatch}
              describedBy={
                passwordsMismatch
                  ? "register-password-mismatch"
                  : error
                    ? "register-form-error"
                    : undefined
              }
            />
          </label>
          {passwordsMismatch && (
            <p
              id="register-password-mismatch"
              className="error"
              role="alert"
              aria-live="polite"
            >
              Пароли не совпадают.
            </p>
          )}
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
              <input
                name="phone"
                type="tel"
                autoComplete="tel"
                inputMode="tel"
                value={phone}
                onChange={handlePhoneChange}
                placeholder="+7(999)123-45-67"
              />
            </div>
          </label>
          <label className="checkbox">
            <input name="personalDataConsent" type="checkbox" required />
            <span className="checkbox-text">
              Даю{" "}
              <Link to="/personal-data-consent" target="_blank" rel="noopener noreferrer">
                согласие на обработку персональных данных
              </Link>
            </span>
          </label>
          <label className="checkbox">
            <input name="acceptOffer" type="checkbox" required />
            <span className="checkbox-text">
              Принимаю{" "}
              <Link to="/legal/terms" target="_blank" rel="noopener noreferrer">
                публичную оферту
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
          <button type="submit" className="btn btn-primary" disabled={passwordsMismatch}>
            <UserPlus size={16} />
            Создать аккаунт
          </button>
        </div>
      </form>
      <p className="muted" style={{ marginTop: "1rem", fontSize: "0.875rem" }}>
        Уже есть аккаунт? <Link to="/login">Войти</Link>
      </p>
    </section>
  );
}
