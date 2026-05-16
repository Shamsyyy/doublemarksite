import { Link } from "react-router-dom";
import { Building2, Mail, Phone, Hash, Shield, Download, CreditCard, CheckCircle2, Clock } from "lucide-react";
import { getPlanById } from "../content/pricing";
import { useAuth } from "../context/useAuth";
import { backendAdapter } from "../lib/backend/adapter";

export function AccountPage() {
  const { user } = useAuth();
  if (!user) {
    throw new Error("AccountPage must be rendered for authenticated users");
  }

  const entitlement = backendAdapter.getActiveEntitlement(user.id);
  const plan = entitlement ? getPlanById(entitlement.planId) : null;
  const payments = backendAdapter.getPaymentsForUser(user.id);

  return (
    <section className="section account-page">
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
            <Shield size={18} style={{ color: entitlement ? 'var(--success)' : 'var(--muted)' }} />
          </div>
          {entitlement && plan ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <CheckCircle2 size={16} style={{ color: 'var(--success)' }} />
                <span>Тариф <strong>{plan.name}</strong> — активен</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <Clock size={16} style={{ color: 'var(--muted)' }} />
                <span className="muted">До {new Date(entitlement.validUntil).toLocaleDateString("ru-RU")}</span>
              </div>
            </>
          ) : (
            <p style={{ marginBottom: '1.25rem' }}>
              Лицензия не активна. <Link to="/pricing">Выберите тариф</Link>
            </p>
          )}
          <Link to="/download" className="btn btn-secondary">
            <Download size={16} />
            Скачать приложение
          </Link>
        </article>
      </div>

      <article className="card account-payments">
        <div className="card-header" style={{ marginBottom: '1rem' }}>
          <h2>История платежей</h2>
          <CreditCard size={18} style={{ color: 'var(--muted)' }} />
        </div>
        {payments.length === 0 ? (
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
