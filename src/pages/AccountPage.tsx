import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Building2, Mail, Phone, Hash, Shield, Download, CreditCard, CheckCircle2, Clock } from "lucide-react";
import { getPlanById } from "../content/pricing";
import { useAuth } from "../context/useAuth";
import { backendAdapter } from "../lib/backend/adapter";
import { isSubscriptionActive, type PaymentRecord, type SubscriptionRecord } from "../lib/subscriptions";
import { BrandLogo } from "../components/BrandLogo";

export function AccountPage() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionRecord | null>(null);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const userId = user?.id;

  useEffect(() => {
    let isMounted = true;

    async function loadAccount() {
      if (!userId) {
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const [currentSubscription, paymentHistory] = await Promise.all([
          backendAdapter.getActiveEntitlement(userId),
          backendAdapter.getPaymentsForUser(userId),
        ]);
        if (isMounted) {
          setSubscription(currentSubscription);
          setPayments(paymentHistory);
        }
      } catch (e) {
        if (isMounted) {
          setError(e instanceof Error ? e.message : "Ошибка загрузки личного кабинета");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadAccount();

    return () => {
      isMounted = false;
    };
  }, [userId]);

  if (!user) {
    throw new Error("AccountPage must be rendered for authenticated users");
  }

  const subscriptionIsActive = isSubscriptionActive(subscription);
  const plan = subscription ? getPlanById(subscription.planId) : null;
  const subscriptionEnd = subscription?.currentPeriodEnd ?? subscription?.trialEndsAt;

  return (
    <section className="section account-page">
      <BrandLogo size={44} withText={false} />
      <h1>Личный кабинет</h1>

      <div className="account-top">
        <article className="card account-card">
          <h2>Профиль</h2>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <Building2 size={16} style={{ color: 'var(--accent)', flexShrink: 0 }} />
              <strong>{user.companyName}</strong>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <Mail size={16} style={{ color: 'var(--muted)', flexShrink: 0 }} />
              <span>{user.email}</span>
            </div>
            {user.inn && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <Hash size={16} style={{ color: 'var(--muted)', flexShrink: 0 }} />
                <span className="muted">ИНН: {user.inn}</span>
              </div>
            )}
            {user.phone && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <Phone size={16} style={{ color: 'var(--muted)', flexShrink: 0 }} />
                <span>{user.phone}</span>
              </div>
            )}
          </div>
        </article>

        <article className="card account-card">
          <div className="card-header" style={{ marginBottom: '1rem' }}>
            <h2>Лицензия</h2>
            <Shield size={18} style={{ color: subscriptionIsActive ? 'var(--success)' : 'var(--muted)' }} />
          </div>
          {isLoading ? (
            <p>Загружаем подписку...</p>
          ) : error ? (
            <p className="error" role="alert">{error}</p>
          ) : subscriptionIsActive && plan ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <CheckCircle2 size={16} style={{ color: 'var(--success)' }} />
                <span>Тариф <strong>{plan.name}</strong> — {subscription?.status}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <Clock size={16} style={{ color: 'var(--muted)' }} />
                <span className="muted">
                  До {subscriptionEnd ? new Date(subscriptionEnd).toLocaleDateString("ru-RU") : "—"}
                  {" · "}
                  устройств: {subscription?.devicesLimit ?? 1}
                </span>
              </div>
              <Link to="/download" className="btn btn-secondary">
                <Download size={16} />
                Скачать приложение
              </Link>
            </>
          ) : (
            <>
              <p style={{ marginBottom: '1.25rem' }}>
                Подписка не активна. {subscription ? `Статус: ${subscription.status}.` : ""}
              </p>
              <Link to="/pricing" className="btn btn-secondary">
                Выбрать тариф
              </Link>
            </>
          )}
        </article>
      </div>

      <article className="card account-payments">
        <div className="card-header" style={{ marginBottom: '1rem' }}>
          <h2>История платежей</h2>
          <CreditCard size={18} style={{ color: 'var(--muted)' }} />
        </div>
        {isLoading ? (
          <p>Загружаем историю платежей...</p>
        ) : payments.length === 0 ? (
          <p>Платежей пока нет.</p>
        ) : (
          <table className="table">
            <caption>История платежей пользователя</caption>
            <thead>
              <tr>
                <th>Дата</th>
                <th>План</th>
                <th>Сумма</th>
                <th>Статус</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id}>
                  <td>{new Date(p.createdAt).toLocaleString("ru-RU")}</td>
                  <td>{p.planId}</td>
                  <td>
                    {p.amount} {p.currency}
                  </td>
                  <td>{p.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </article>
    </section>
  );
}
