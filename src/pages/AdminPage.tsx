import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  BarChart3,
  CreditCard,
  ShieldAlert,
  Smartphone,
  Users,
} from "lucide-react";
import {
  getAdminDashboardStats,
  type AdminDashboardStats,
} from "../lib/admin";
import { useAuth } from "../context/useAuth";

function formatRub(value: number): string {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string): string {
  return new Date(value).toLocaleString("ru-RU");
}

function StatCard({
  label,
  value,
  note,
  icon,
}: {
  label: string;
  value: string | number;
  note?: string;
  icon: ReactNode;
}) {
  return (
    <article className="card" style={{ display: "grid", gap: "0.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}>
        <span className="muted">{label}</span>
        <span style={{ color: "var(--accent)" }}>{icon}</span>
      </div>
      <strong style={{ fontSize: "2rem", lineHeight: 1 }}>{value}</strong>
      {note && <span className="muted" style={{ fontSize: "0.85rem" }}>{note}</span>}
    </article>
  );
}

export function AdminPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadStats() {
      setIsLoading(true);
      setError(null);
      try {
        const dashboardStats = await getAdminDashboardStats();
        if (isMounted) {
          setStats(dashboardStats);
        }
      } catch (e) {
        if (isMounted) {
          setError(e instanceof Error ? e.message : "Ошибка загрузки админ-панели");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadStats();

    return () => {
      isMounted = false;
    };
  }, []);

  if (user?.role !== "admin") {
    return (
      <section className="section narrow">
        <h1>Админ-панель</h1>
        <article className="card">
          <ShieldAlert size={24} style={{ color: "var(--danger)" }} />
          <h2>Доступ запрещён</h2>
          <p>Эта страница доступна только аккаунтам с ролью admin.</p>
          <Link to="/account" className="btn btn-secondary">Вернуться в кабинет</Link>
        </article>
      </section>
    );
  }

  return (
    <section className="section account-page">
      <h1>Админ-панель</h1>
      <p className="lead">Сводка по пользователям, подпискам, платежам и устройствам.</p>

      {isLoading && <p>Загружаем статистику...</p>}
      {error && <p className="error" role="alert">{error}</p>}

      {stats && (
        <>
          <div
            style={{
              display: "grid",
              gap: "1rem",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              marginBottom: "1.5rem",
            }}
          >
            <StatCard
              label="Пользователи"
              value={stats.totalUsers}
              note={`+${stats.newUsers7d} за 7 дней, +${stats.newUsers30d} за 30 дней`}
              icon={<Users size={20} />}
            />
            <StatCard
              label="Активные подписки"
              value={stats.activeSubscriptions}
              note={`Trial: ${stats.trialingSubscriptions}, истекли: ${stats.expiredSubscriptions}`}
              icon={<BarChart3 size={20} />}
            />
            <StatCard
              label="Выручка"
              value={formatRub(stats.revenueTotal)}
              note={`${formatRub(stats.revenue30d)} за 30 дней`}
              icon={<CreditCard size={20} />}
            />
            <StatCard
              label="Устройства"
              value={stats.registeredDevices}
              note={`${stats.successfulPayments} успешных платежей из ${stats.totalPayments}`}
              icon={<Smartphone size={20} />}
            />
          </div>

          <article className="card account-payments" style={{ marginBottom: "1.5rem" }}>
            <h2>Последние регистрации</h2>
            {stats.recentUsers.length === 0 ? (
              <p>Пользователей пока нет.</p>
            ) : (
              <table className="table">
                <caption>Последние зарегистрированные пользователи</caption>
                <thead>
                  <tr>
                    <th>Дата</th>
                    <th>Email</th>
                    <th>Организация</th>
                    <th>Роль</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentUsers.map((recentUser) => (
                    <tr key={recentUser.id}>
                      <td>{formatDate(recentUser.createdAt)}</td>
                      <td>{recentUser.email ?? "—"}</td>
                      <td>{recentUser.companyName ?? "—"}</td>
                      <td>{recentUser.role ?? "user"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </article>

          <article className="card account-payments">
            <h2>Последние платежи</h2>
            {stats.recentPayments.length === 0 ? (
              <p>Платежей пока нет.</p>
            ) : (
              <table className="table">
                <caption>Последние платежи пользователей</caption>
                <thead>
                  <tr>
                    <th>Дата</th>
                    <th>Email</th>
                    <th>План</th>
                    <th>Сумма</th>
                    <th>Статус</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentPayments.map((payment) => (
                    <tr key={payment.id}>
                      <td>{formatDate(payment.createdAt)}</td>
                      <td>{payment.email ?? "—"}</td>
                      <td>{payment.planId}</td>
                      <td>{payment.amount} {payment.currency}</td>
                      <td>{payment.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </article>
        </>
      )}
    </section>
  );
}
