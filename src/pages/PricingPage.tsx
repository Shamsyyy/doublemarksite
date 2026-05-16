import { useState } from "react";
import { Link } from "react-router-dom";
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
          Год
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
              className={`card ${plan.highlighted ? "card-highlight" : ""}`}
            >
              <h2>{plan.name}</h2>
              <p className="price">
                {displayPrice.toLocaleString("ru-RU")} ₽
                <span> / мес</span>
              </p>
              {period === "yearly" ? (
                <p className="muted price-note">
                  {plan.yearlyPriceRub.toLocaleString("ru-RU")} ₽ за год
                </p>
              ) : null}
              <ul>
                {features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
              {user ? (
                <Link to={`/checkout/${checkoutId}`} className="btn btn-primary">
                  Оформить
                </Link>
              ) : (
                <Link to="/register" className="btn btn-primary">
                  Зарегистрироваться
                </Link>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
