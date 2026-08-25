import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, LoaderCircle } from "lucide-react";
import { BrandLogo } from "../components/BrandLogo";
import { confirmEmail } from "../lib/auth";

export function ConfirmEmailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState("Подтверждаем email…");

  useEffect(() => {
    const token = searchParams.get("token")?.trim() ?? "";
    if (!token) {
      setError("В ссылке отсутствует токен подтверждения.");
      setMessage("");
      return;
    }

    let cancelled = false;
    void confirmEmail(token)
      .then(() => {
        if (cancelled) return;
        setMessage("Email подтверждён. Сейчас откроем страницу входа.");
        setTimeout(() => navigate("/login"), 1200);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Не удалось подтвердить email.");
        setMessage("");
      });

    return () => {
      cancelled = true;
    };
  }, [navigate, searchParams]);

  return (
    <section className="section narrow">
      <BrandLogo size={44} withText={false} />
      <h1>Подтверждение email</h1>
      {message && (
        <p className="success" role="status" aria-live="polite">
          {message}
        </p>
      )}
      {!error && (
        <p className="muted">
          <LoaderCircle size={16} style={{ verticalAlign: "text-bottom", marginRight: 8 }} />
          Проверяем ссылку из письма.
        </p>
      )}
      {error && (
        <>
          <p className="error" role="alert" aria-live="assertive">
            {error}
          </p>
          <p>
            <Link to="/login">Перейти ко входу</Link> ·{" "}
            <Link to="/register">Зарегистрироваться заново</Link>
          </p>
        </>
      )}
      {!error && message.includes("подтверждён") && (
        <p className="muted">
          <CheckCircle2 size={16} style={{ verticalAlign: "text-bottom", marginRight: 8 }} />
          После подтверждения можно войти с вашим email и паролем.
        </p>
      )}
    </section>
  );
}
