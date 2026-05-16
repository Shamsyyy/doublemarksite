import { useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import {
  getCheckoutPlanId,
  getPlansForPeriod,
  type BillingPeriod,
} from "../content/pricing";
import { useAuth } from "../context/useAuth";

export function PricingPage() {
  const { user } = useAuth();
  const [period, setPeriod] = useState<BillingPeriod>("monthly");
  const plans = getPlansForPeriod(period);

  return (
    <section className="section">
      <h1>Тарифы</h1>
      <p className="lead">
        14 дней бесплатно при оплате помесячно · 30 дней при оплате за год.
      </p>

      <div className="billing-toggle" role="group" aria-label="Период оплаты">
        <button
          type="button"
          className={period === "monthly" ? "billing-option is-active" : "billing-option"}
          onClick={() => setPeriod("monthly")}
        >
          Месяц
        </button>
        <button
          type="button"
          className={period === "yearly" ? "billing-option is-active" : "billing-option"}
          onClick={() => setPeriod("yearly")}
        >
          Год <span style={{
            marginLeft: '0.4rem',
            padding: '0.1rem 0.4rem',
            borderRadius: '999px',
            background: period === "yearly" ? 'rgba(255,255,255,0.2)' : 'rgba(52,211,153,0.15)',
            color: period === "yearly" ? 'white' : '#34d399',
            fontSize: '0.65rem',
            fontWeight: 700,
          }}>−20%</span>
        </button>
      </div>

      <div className="grid three pricing-grid">
        {plans.map((plan) => {
          const checkoutId = getCheckoutPlanId(plan.tier, period);
          const displayPrice =
            period === "yearly" ? plan.yearlyMonthlyPriceRub : plan.monthlyPriceRub;
          const features =
            period === "yearly"
              ? plan.features.map((feature) =>
                  feature.startsWith("14 дней")
                    ? "30 дней бесплатного периода"
                    : feature,
                )
              : plan.features;

          return (
            <article
              key={checkoutId}
              className={`card fade-in-up ${plan.highlighted ? "card-highlight" : ""}`}
              style={{ display: 'flex', flexDirection: 'column' }}
            >
              <div className="card-header">
                <h2>{plan.name}</h2>
                {plan.highlighted && <span className="badge">Популярный</span>}
              </div>

              <p className="price">
                {displayPrice.toLocaleString("ru-RU")} ₽
                <span> / мес</span>
              </p>

              {period === "yearly" ? (
                <p className="muted price-note">
                  {plan.yearlyPriceRub.toLocaleString("ru-RU")} ₽ за год
                </p>
              ) : null}

              <div style={{ display: 'grid', gap: '0', margin: '1rem 0 1.5rem' }}>
                {features.map((feature) => (
                  <div key={feature} className="feature-check">
                    <CheckCircle2 size={16} />
                    {feature}
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 'auto' }}>
                {user ? (
                  <Link to={`/checkout/${checkoutId}`} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                    Оформить
                  </Link>
                ) : (
                  <Link to="/register" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                    Попробовать бесплатно
                  </Link>
                )}
              </div>
            </article>
          );
        })}
      </div>

      <p className="muted" style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.9rem' }}>
        Без привязки карты · Отмена в любой момент · Тестовый период при каждой первой подписке
      </p>
    </section>
  );
}
