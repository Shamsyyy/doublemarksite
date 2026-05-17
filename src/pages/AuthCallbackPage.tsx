import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle2, ShieldAlert } from "lucide-react";
import { getSupabaseClient } from "../lib/supabase/client";

export function AuthCallbackPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function completeAuthCallback() {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");

        if (code) {
          const { error: exchangeError } = await getSupabaseClient()
            .auth
            .exchangeCodeForSession(code);

          if (exchangeError) {
            throw new Error(exchangeError.message);
          }
        } else {
          const { data, error: sessionError } = await getSupabaseClient()
            .auth
            .getSession();

          if (sessionError || !data.session) {
            throw new Error(
              sessionError?.message ?? "Не удалось подтвердить ссылку авторизации.",
            );
          }
        }

        if (isMounted) {
          navigate("/account", { replace: true });
        }
      } catch (e) {
        if (isMounted) {
          setError(
            e instanceof Error
              ? e.message
              : "Не удалось завершить авторизацию. Попробуйте войти заново.",
          );
          setIsLoading(false);
        }
      }
    }

    void completeAuthCallback();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  return (
    <section className="section narrow">
      <h1>Подтверждение входа</h1>
      <article className="card">
        {error ? (
          <>
            <ShieldAlert size={24} style={{ color: "var(--danger)" }} />
            <h2>Не удалось подтвердить ссылку</h2>
            <p className="error" role="alert">{error}</p>
            <Link to="/login" className="btn btn-primary">Вернуться ко входу</Link>
          </>
        ) : (
          <>
            <CheckCircle2 size={24} style={{ color: "var(--success)" }} />
            <h2>{isLoading ? "Подтверждаем email..." : "Готово"}</h2>
            <p className="muted">Сейчас перенаправим вас в личный кабинет.</p>
          </>
        )}
      </article>
    </section>
  );
}
