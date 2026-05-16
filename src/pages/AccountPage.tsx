import { Link } from "react-router-dom";
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
          <p>
            <strong>{user.companyName}</strong>
            <br />
            {user.email}
            {user.inn ? (
              <>
                <br />
                ИНН: {user.inn}
              </>
            ) : null}
            {user.phone ? (
              <>
                <br />
                {user.phone}
              </>
            ) : null}
          </p>
        </article>

        <article className="card account-card">
          <h2>Лицензия</h2>
          {entitlement && plan ? (
            <p>
              Активен тариф <strong>{plan.name}</strong> до{" "}
              {new Date(entitlement.validUntil).toLocaleDateString("ru-RU")}
            </p>
          ) : (
            <p>
              Лицензия не активна. <Link to="/pricing">Выберите тариф</Link>
            </p>
          )}
          <Link to="/download" className="btn btn-secondary">
            Скачать приложение
          </Link>
        </article>
      </div>

      <article className="card account-payments">
        <h2>История платежей</h2>
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
