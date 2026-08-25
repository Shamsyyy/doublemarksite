import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  BarChart3,
  Building2,
  ChevronsRight,
  CreditCard,
  ExternalLink,
  Home,
  Monitor,
  RefreshCw,
  ShieldAlert,
  Smartphone,
  Users,
} from "lucide-react";
import {
  getAdminDashboardStats,
  getAdminDevices,
  getAdminOrganizations,
  getAdminPayments,
  getAdminUsers,
  setAdminUserRole,
  adminDeleteUser,
  adminResendUserConfirmation,
  adminResetUserPassword,
  type AdminDashboardStats,
  type AdminDevice,
  type AdminOrganization,
  type AdminPayment,
  type AdminUser,
} from "../lib/admin";
import { useAuth } from "../context/useAuth";
import { BrandLogo } from "../components/BrandLogo";

type AdminTab = "dashboard" | "users" | "organizations" | "payments" | "devices";

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
    <article className="admin-stat-card">
      <div className="admin-stat-card-top">
        <span className="muted">{label}</span>
        <span className="admin-stat-icon">{icon}</span>
      </div>
      <strong>{value}</strong>
      {note ? <span className="muted admin-stat-note">{note}</span> : null}
    </article>
  );
}

function SidebarOption({
  icon,
  title,
  selected,
  open,
  onSelect,
  badge,
}: {
  icon: ReactNode;
  title: string;
  selected: boolean;
  open: boolean;
  onSelect: () => void;
  badge?: number;
}) {
  return (
    <button
      type="button"
      className={`admin-nav-item${selected ? " is-active" : ""}`}
      onClick={onSelect}
      aria-current={selected ? "page" : undefined}
      title={title}
    >
      <span className="admin-nav-icon">{icon}</span>
      {open ? <span className="admin-nav-label">{title}</span> : null}
      {open && badge != null && badge > 0 ? (
        <span className="admin-nav-badge">{badge}</span>
      ) : null}
    </button>
  );
}

export function AdminPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [organizations, setOrganizations] = useState<AdminOrganization[]>([]);
  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [devices, setDevices] = useState<AdminDevice[]>([]);
  const [tab, setTab] = useState<AdminTab>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roleBusy, setRoleBusy] = useState<string | null>(null);
  const [actionBusy, setActionBusy] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  async function loadAll() {
    setIsLoading(true);
    setError(null);
    try {
      const [dashboardStats, userRows, orgRows, paymentRows, deviceRows] = await Promise.all([
        getAdminDashboardStats(),
        getAdminUsers(),
        getAdminOrganizations(),
        getAdminPayments(),
        getAdminDevices(),
      ]);
      setStats(dashboardStats);
      setUsers(userRows);
      setOrganizations(orgRows);
      setPayments(paymentRows);
      setDevices(deviceRows);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка загрузки админ-панели");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (user?.role !== "admin") return;
    void loadAll();
  }, [user?.role]);

  const filteredUsers = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return users;
    return users.filter((row) =>
      [row.email, row.companyName, row.inn, row.phone, row.role, row.orgName]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(needle)),
    );
  }, [users, query]);

  async function onChangeRole(row: AdminUser, role: "admin" | "user") {
    if (row.role === role) return;
    if (role === "admin" && !window.confirm(`Выдать роль admin пользователю ${row.email}?`)) {
      return;
    }
    if (role === "user" && !window.confirm(`Снять роль admin с ${row.email}?`)) {
      return;
    }
    setRoleBusy(row.id);
    setError(null);
    try {
      const updated = await setAdminUserRole(row.id, role);
      setUsers((current) => current.map((item) => (item.id === updated.id ? updated : item)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось изменить роль");
    } finally {
      setRoleBusy(null);
    }
  }

  async function onResetPassword(row: AdminUser) {
    if (!window.confirm(`Отправить письмо для сброса пароля на ${row.email}?`)) return;
    setActionBusy(`${row.id}:reset`);
    setError(null);
    setActionMessage(null);
    try {
      const result = await adminResetUserPassword(row.id);
      setActionMessage(result.message);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось отправить сброс пароля");
    } finally {
      setActionBusy(null);
    }
  }

  async function onResendConfirmation(row: AdminUser) {
    if (!window.confirm(`Отправить письмо подтверждения на ${row.email}?`)) return;
    setActionBusy(`${row.id}:confirm`);
    setError(null);
    setActionMessage(null);
    try {
      const result = await adminResendUserConfirmation(row.id);
      setActionMessage(result.message);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось отправить подтверждение");
    } finally {
      setActionBusy(null);
    }
  }

  async function onDeleteUser(row: AdminUser) {
    if (
      !window.confirm(
        `Удалить пользователя ${row.email}? Это необратимо: устройства, платежи и профиль будут удалены.`,
      )
    ) {
      return;
    }
    setActionBusy(`${row.id}:delete`);
    setError(null);
    setActionMessage(null);
    try {
      await adminDeleteUser(row.id);
      setUsers((current) => current.filter((item) => item.id !== row.id));
      setActionMessage(`Пользователь ${row.email} удалён.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось удалить пользователя");
    } finally {
      setActionBusy(null);
    }
  }

  if (user?.role !== "admin") {
    return (
      <section className="section narrow">
        <h1>Админ-панель</h1>
        <article className="card">
          <ShieldAlert size={24} style={{ color: "var(--danger)" }} />
          <h2>Доступ запрещён</h2>
          <p>Эта страница доступна только аккаунтам с ролью admin.</p>
          <Link to="/account" className="btn btn-secondary">
            Вернуться в кабинет
          </Link>
        </article>
      </section>
    );
  }

  const titles: Record<AdminTab, { title: string; lead: string }> = {
    dashboard: {
      title: "Обзор",
      lead: "Сводка по пользователям, подпискам, платежам и устройствам.",
    },
    users: { title: "Пользователи", lead: "Роли, организации и статусы подписки." },
    organizations: {
      title: "Организации",
      lead: "Компании по ИНН, лимиты устройств и доступ к скачиванию.",
    },
    payments: { title: "Платежи", lead: "История оплат и статусы транзакций." },
    devices: {
      title: "Устройства",
      lead: "Зарегистрированные desktop-клиенты по организации.",
    },
  };

  return (
    <div className={`admin-shell${sidebarOpen ? "" : " is-collapsed"}`}>
      <aside className="admin-sidebar" aria-label="Навигация админ-панели">
        <div className="admin-sidebar-brand">
          <BrandLogo size={36} withText={false} />
          {sidebarOpen ? (
            <div>
              <strong>DoubleMark</strong>
              <span className="muted">Admin</span>
            </div>
          ) : null}
        </div>

        <nav className="admin-sidebar-nav">
          <SidebarOption
            icon={<Home size={16} />}
            title="Обзор"
            selected={tab === "dashboard"}
            open={sidebarOpen}
            onSelect={() => setTab("dashboard")}
          />
          <SidebarOption
            icon={<Users size={16} />}
            title="Пользователи"
            selected={tab === "users"}
            open={sidebarOpen}
            onSelect={() => setTab("users")}
            badge={users.length}
          />
          <SidebarOption
            icon={<Building2 size={16} />}
            title="Организации"
            selected={tab === "organizations"}
            open={sidebarOpen}
            onSelect={() => setTab("organizations")}
            badge={organizations.length}
          />
          <SidebarOption
            icon={<CreditCard size={16} />}
            title="Платежи"
            selected={tab === "payments"}
            open={sidebarOpen}
            onSelect={() => setTab("payments")}
            badge={stats?.successfulPayments}
          />
          <SidebarOption
            icon={<Monitor size={16} />}
            title="Устройства"
            selected={tab === "devices"}
            open={sidebarOpen}
            onSelect={() => setTab("devices")}
            badge={devices.length}
          />
        </nav>

        {sidebarOpen ? (
          <div className="admin-sidebar-links">
            <p className="admin-sidebar-section">Сайт</p>
            <Link to="/" className="admin-nav-item">
              <span className="admin-nav-icon">
                <ExternalLink size={16} />
              </span>
              <span className="admin-nav-label">На сайт</span>
            </Link>
            <Link to="/account" className="admin-nav-item">
              <span className="admin-nav-icon">
                <Users size={16} />
              </span>
              <span className="admin-nav-label">Кабинет</span>
            </Link>
          </div>
        ) : null}

        <button
          type="button"
          className="admin-sidebar-toggle"
          onClick={() => setSidebarOpen((v) => !v)}
          aria-label={sidebarOpen ? "Свернуть меню" : "Развернуть меню"}
        >
          <span className="admin-nav-icon">
            <ChevronsRight
              size={16}
              className={sidebarOpen ? "admin-chevron-open" : undefined}
            />
          </span>
          {sidebarOpen ? <span>Скрыть</span> : null}
        </button>
      </aside>

      <div className="admin-main">
        <header className="admin-main-header">
          <div>
            <h1>{titles[tab].title}</h1>
            <p className="muted">{titles[tab].lead}</p>
          </div>
          <div className="admin-main-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => void loadAll()}
              disabled={isLoading}
            >
              <RefreshCw size={16} />
              Обновить
            </button>
          </div>
        </header>

        {isLoading ? <p>Загружаем данные...</p> : null}
        {error ? (
          <p className="error" role="alert">
            {error}
          </p>
        ) : null}
        {actionMessage ? (
          <p className="admin-action-ok" role="status">
            {actionMessage}
          </p>
        ) : null}

        {tab === "dashboard" && stats ? (
          <>
            <div className="admin-stats">
              <StatCard
                label="Пользователи"
                value={stats.totalUsers}
                note={`+${stats.newUsers7d} за 7 дней, +${stats.newUsers30d} за 30 дней`}
                icon={<Users size={18} />}
              />
              <StatCard
                label="Организации"
                value={stats.organizations}
                note={`Кодов: ${stats.markingCodes}, операций: ${stats.codeOperations}`}
                icon={<Building2 size={18} />}
              />
              <StatCard
                label="Подписки"
                value={stats.activeSubscriptions}
                note={`Trial: ${stats.trialingSubscriptions}, истекли: ${stats.expiredSubscriptions}`}
                icon={<BarChart3 size={18} />}
              />
              <StatCard
                label="Выручка"
                value={formatRub(stats.revenueTotal)}
                note={`${formatRub(stats.revenue30d)} за 30 дней`}
                icon={<CreditCard size={18} />}
              />
              <StatCard
                label="Устройства"
                value={stats.registeredDevices}
                note={`${stats.successfulPayments} успешных платежей из ${stats.totalPayments}`}
                icon={<Smartphone size={18} />}
              />
            </div>

            <div className="admin-dashboard-grid">
              <article className="card admin-panel-card">
                <div className="admin-toolbar">
                  <h2>Недавние платежи</h2>
                  <button type="button" className="btn btn-secondary" onClick={() => setTab("payments")}>
                    Все платежи
                  </button>
                </div>
                {(stats.recentPayments?.length ?? 0) === 0 ? (
                  <p className="muted">Платежей пока нет.</p>
                ) : (
                  <ul className="admin-activity-list">
                    {stats.recentPayments.slice(0, 6).map((row) => (
                      <li key={row.id}>
                        <div>
                          <strong>{row.email ?? "—"}</strong>
                          <span className="muted">{row.status ?? "—"}</span>
                        </div>
                        <span className="muted">{formatDate(row.createdAt)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </article>

              <article className="card admin-panel-card">
                <div className="admin-toolbar">
                  <h2>Быстрые цифры</h2>
                </div>
                <div className="admin-quick-stats">
                  <div>
                    <span className="muted">Успешные платежи</span>
                    <strong>
                      {stats.successfulPayments}/{stats.totalPayments}
                    </strong>
                    <div className="admin-meter">
                      <span
                        style={{
                          width: `${stats.totalPayments ? Math.min(100, (stats.successfulPayments / stats.totalPayments) * 100) : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <span className="muted">Trial подписки</span>
                    <strong>{stats.trialingSubscriptions}</strong>
                    <div className="admin-meter admin-meter-accent">
                      <span
                        style={{
                          width: `${stats.activeSubscriptions ? Math.min(100, (stats.trialingSubscriptions / Math.max(1, stats.activeSubscriptions)) * 100) : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <span className="muted">Устройства</span>
                    <strong>{stats.registeredDevices}</strong>
                    <div className="admin-meter admin-meter-soft">
                      <span style={{ width: `${Math.min(100, stats.registeredDevices * 10)}%` }} />
                    </div>
                  </div>
                </div>
              </article>
            </div>
          </>
        ) : null}

        {tab === "users" ? (
          <article className="card account-payments">
            <div className="admin-toolbar">
              <h2>Все пользователи</h2>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Поиск по email, организации, ИНН"
                aria-label="Поиск пользователей"
              />
            </div>
            {filteredUsers.length === 0 ? (
              <p>Пользователей пока нет.</p>
            ) : (
              <div className="table-wrap">
                <table className="table">
                  <caption>Пользователи DoubleMark</caption>
                  <thead>
                    <tr>
                      <th>Дата</th>
                      <th>Email</th>
                      <th>Организация</th>
                      <th>Подписка</th>
                      <th>Почта</th>
                      <th>Скачал</th>
                      <th>Приложение</th>
                      <th>Роль</th>
                      <th>Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((row) => (
                      <tr key={row.id}>
                        <td>{formatDate(row.createdAt)}</td>
                        <td>{row.email}</td>
                        <td>
                          {row.companyName ?? row.orgName ?? "—"}
                          {row.inn ? <div className="muted">ИНН {row.inn}</div> : null}
                        </td>
                        <td>
                          {row.subscriptionStatus ?? "—"}
                          {row.planId ? <div className="muted">{row.planId}</div> : null}
                        </td>
                        <td>
                          {row.emailConfirmed ? (
                            <span className="admin-pill is-ok">подтверждена</span>
                          ) : (
                            <span className="admin-pill is-warn">не подтверждена</span>
                          )}
                        </td>
                        <td>
                          {row.hasDownloadedInstaller ? (
                            <>
                              <span className="admin-pill is-ok">да</span>
                              {row.lastInstallerDownloadAt ? (
                                <div className="muted">{formatDate(row.lastInstallerDownloadAt)}</div>
                              ) : null}
                            </>
                          ) : (
                            <span className="admin-pill">нет</span>
                          )}
                        </td>
                        <td>
                          {row.hasRegisteredDevice ? (
                            <span className="admin-pill is-ok">
                              запущено · {row.deviceCount}
                            </span>
                          ) : (
                            <span className="admin-pill">не запускал</span>
                          )}
                        </td>
                        <td>
                          <select
                            className="admin-role-select"
                            value={row.role === "admin" ? "admin" : "user"}
                            disabled={roleBusy === row.id}
                            onChange={(event) => {
                              void onChangeRole(row, event.target.value as "admin" | "user");
                            }}
                            aria-label={`Роль ${row.email}`}
                          >
                            <option value="user">user</option>
                            <option value="admin">admin</option>
                          </select>
                        </td>
                        <td>
                          <div className="admin-row-actions">
                            <button
                              type="button"
                              className="btn btn-secondary"
                              disabled={actionBusy?.startsWith(row.id)}
                              onClick={() => void onResetPassword(row)}
                            >
                              Сброс пароля
                            </button>
                            <button
                              type="button"
                              className="btn btn-secondary"
                              disabled={
                                actionBusy?.startsWith(row.id) || row.emailConfirmed
                              }
                              onClick={() => void onResendConfirmation(row)}
                              title={
                                row.emailConfirmed
                                  ? "Email уже подтверждён"
                                  : "Отправить письмо подтверждения"
                              }
                            >
                              Подтверждение
                            </button>
                            <button
                              type="button"
                              className="btn btn-danger"
                              disabled={actionBusy?.startsWith(row.id)}
                              onClick={() => void onDeleteUser(row)}
                            >
                              Удалить
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </article>
        ) : null}

        {tab === "organizations" ? (
          <article className="card account-payments">
            <h2>Организации</h2>
            {organizations.length === 0 ? (
              <p>Организаций пока нет.</p>
            ) : (
              <div className="table-wrap">
                <table className="table">
                  <caption>Организации</caption>
                  <thead>
                    <tr>
                      <th>Дата</th>
                      <th>Название</th>
                      <th>ИНН</th>
                      <th>Участники</th>
                      <th>Лимит устройств</th>
                      <th>Скачивание</th>
                    </tr>
                  </thead>
                  <tbody>
                    {organizations.map((row) => (
                      <tr key={row.id}>
                        <td>{formatDate(row.createdAt)}</td>
                        <td>{row.legalName}</td>
                        <td>{row.inn ?? "—"}</td>
                        <td>{row.memberCount}</td>
                        <td>{row.devicesLimit}</td>
                        <td>{row.canDownload ? "да" : "нет"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </article>
        ) : null}

        {tab === "payments" ? (
          <article className="card account-payments">
            <h2>Платежи</h2>
            {payments.length === 0 && (stats?.recentPayments.length ?? 0) === 0 ? (
              <p>Платежей пока нет.</p>
            ) : (
              <div className="table-wrap">
                <table className="table">
                  <caption>Платежи</caption>
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
                    {(payments.length > 0 ? payments : stats?.recentPayments ?? []).map((row) => (
                      <tr key={row.id}>
                        <td>{formatDate(row.createdAt)}</td>
                        <td>{row.email ?? "—"}</td>
                        <td>{"planId" in row ? row.planId : ""}</td>
                        <td>
                          {"amount" in row ? row.amount : 0}{" "}
                          {"currency" in row ? row.currency ?? "RUB" : "RUB"}
                        </td>
                        <td>{row.status ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </article>
        ) : null}

        {tab === "devices" ? (
          <article className="card account-payments">
            <h2>Устройства</h2>
            {devices.length === 0 ? (
              <p>Устройств пока нет.</p>
            ) : (
              <div className="table-wrap">
                <table className="table">
                  <caption>Зарегистрированные устройства</caption>
                  <thead>
                    <tr>
                      <th>Последняя активность</th>
                      <th>Email</th>
                      <th>Имя</th>
                      <th>Платформа</th>
                      <th>Статус</th>
                    </tr>
                  </thead>
                  <tbody>
                    {devices.map((row: AdminDevice) => (
                      <tr key={`${row.userId}-${row.deviceId}`}>
                        <td>{formatDate(row.lastSeenAt)}</td>
                        <td>{row.email ?? "—"}</td>
                        <td>{row.deviceName || row.deviceId}</td>
                        <td>{row.platform}</td>
                        <td>{row.revokedAt ? "отозвано" : "активно"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </article>
        ) : null}
      </div>
    </div>
  );
}
