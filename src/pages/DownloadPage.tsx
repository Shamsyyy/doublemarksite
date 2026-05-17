import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Download, Monitor, CheckCircle2, ArrowRight } from "lucide-react";
import { DESKTOP_RELEASE } from "../content/site";
import { useAuth } from "../context/useAuth";
import { backendAdapter } from "../lib/backend/adapter";
import { isSubscriptionActive, type SubscriptionRecord } from "../lib/subscriptions";
import { BrandLogo } from "../components/BrandLogo";

export function DownloadPage() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const userId = user?.id;

  useEffect(() => {
    let isMounted = true;

    async function loadAccess() {
      if (!userId) {
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const currentSubscription = await backendAdapter.getActiveEntitlement(userId);
        if (isMounted) {
          setSubscription(currentSubscription);
        }
      } catch (e) {
        if (isMounted) {
          setError(e instanceof Error ? e.message : "Ошибка проверки подписки");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadAccess();

    return () => {
      isMounted = false;
    };
  }, [userId]);

  if (!user) {
    throw new Error("DownloadPage must be rendered for authenticated users");
  }

  const allowed = isSubscriptionActive(subscription);
  const validUntil = subscription?.currentPeriodEnd ?? subscription?.trialEndsAt;

  return (
    <section className="section">
      <BrandLogo size={44} withText={false} />
      <h1>Скачать DoubleMark для Windows</h1>
      <p className="lead">Настольное приложение для дублирования кодов Честного Знака</p>

      <div className="download-card">
        <div className="download-badge">
          <Monitor size={14} />
          Windows · .NET 8 · WPF
        </div>

        {isLoading ? (
          <p style={{ color: 'var(--muted)', margin: '1rem 0' }}>Проверяем подписку...</p>
        ) : error ? (
          <p className="error" role="alert">{error}</p>
        ) : allowed ? (
          <>
            <div style={{ margin: '1rem 0 0.5rem' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
                {DESKTOP_RELEASE.version}
              </div>
              <div className="muted" style={{ fontSize: '0.875rem' }}>Текущая версия</div>
            </div>
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem', margin: '1rem 0 1.5rem' }}>
              {DESKTOP_RELEASE.changelog}
            </p>
            <a className="btn btn-primary" href={DESKTOP_RELEASE.downloadUrl} style={{ width: '100%', justifyContent: 'center' }}>
              <Download size={18} />
              Скачать установщик
            </a>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}>
              <CheckCircle2 size={14} style={{ color: 'var(--success)' }} />
              <span className="muted" style={{ fontSize: '0.8rem' }}>
                Лицензия активна до{' '}
                {validUntil ? new Date(validUntil).toLocaleDateString("ru-RU") : "—"}
              </span>
            </div>
          </>
        ) : (
          <>
            <div style={{ margin: '1rem 0 1.5rem' }}>
              <p style={{ color: 'var(--muted)', margin: 0 }}>Для скачивания нужна активная лицензия.</p>
            </div>
            <Link to="/pricing" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              <ArrowRight size={16} />
              Перейти к тарифам
            </Link>
          </>
        )}
      </div>
    </section>
  );
}
