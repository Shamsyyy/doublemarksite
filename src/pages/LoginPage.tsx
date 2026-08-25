import { FormEvent, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { Mail, LogIn } from "lucide-react";
import { BrandLogo } from "../components/BrandLogo";
import { PasswordInput } from "../components/PasswordInput";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

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
    <section className="section page-panel">
      <div className="section-header">
        <BrandLogo size={44} withText={false} />
        <h1>Вход</h1>
        <p className="muted">Доступ к кабинету, подписке и загрузке установщика.</p>
      </div>
      <form className="form panel" onSubmit={onSubmit}>
        <div className="panel-header">Учётные данные</div>
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
                aria-describedby={error ? "login-form-error" : undefined}
                required
              />
            </div>
          </label>
          <label>
            Пароль
            <PasswordInput
              name="password"
              show={showPassword}
              onToggle={() => setShowPassword((value) => !value)}
              autoComplete="current-password"
              minLength={1}
              invalid={Boolean(error)}
              describedBy={error ? "login-form-error" : undefined}
            />
          </label>
          {error && (
            <p id="login-form-error" className="error" role="alert" aria-live="assertive">
              {error}
            </p>
          )}
          <button type="submit" className="btn btn-primary">
            <LogIn size={16} />
            Войти
          </button>
        </div>
      </form>
      <p className="muted" style={{ marginTop: "1rem", fontSize: "0.875rem" }}>
        <Link to="/reset-password">Забыли пароль?</Link> · <Link to="/register">Регистрация</Link>
      </p>
    </section>
  );
}
