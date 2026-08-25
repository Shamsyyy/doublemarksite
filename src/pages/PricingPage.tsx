import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Check, Star } from "lucide-react";
import {
  getCheckoutPlanId,
  getPlansForPeriod,
  type BillingPeriod,
} from "../content/pricing";
import { useAuth } from "../context/useAuth";
import { BrandLogo } from "../components/BrandLogo";

function AnimatedRub({ value }: { value: number }) {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);

  useEffect(() => {
    const from = fromRef.current;
    const to = value;
    if (from === to) {
      setDisplay(to);
      return;
    }
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      fromRef.current = to;
      setDisplay(to);
      return;
    }

    const started = performance.now();
    const duration = 480;
    let raf = 0;

    const tick = (now: number) => {
      const t = Math.min(1, (now - started) / duration);
      const eased = 1 - (1 - t) ** 3;
      setDisplay(Math.round(from + (to - from) * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
      else fromRef.current = to;
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return <>{display.toLocaleString("ru-RU")}</>;
}

export function PricingPage() {
  const { user } = useAuth();
  const [period, setPeriod] = useState<BillingPeriod>("monthly");
  const plans = getPlansForPeriod(period);
  const switchRef = useRef<HTMLButtonElement>(null);

  function setBilling(next: BillingPeriod) {
    setPeriod(next);
    if (next === "yearly" && switchRef.current) {
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduceMotion) return;
      const rect = switchRef.current.getBoundingClientRect();
      burstConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2);
    }
  }

  return (
    <section className="section pricing-page">
      <div className="section-header pricing-hero">
        <BrandLogo size={44} withText={false} />
        <h1>Тарифы</h1>
        <p className="lead">
          Простые и прозрачные планы. 14 дней бесплатно при оплате помесячно · 30 дней при
          оплате за год. Выберите план под масштаб склада или линии.
        </p>
      </div>

      <div className="pricing-period-bar" role="group" aria-label="Период оплаты">
        <button
          ref={switchRef}
          type="button"
          className={`pricing-period-switch${period === "yearly" ? " is-yearly" : ""}`}
          aria-pressed={period === "yearly"}
          onClick={() => setBilling(period === "monthly" ? "yearly" : "monthly")}
        >
          <span className="pricing-period-knob" aria-hidden="true" />
          <span className="sr-only">
            {period === "yearly" ? "Годовой период" : "Месячный период"}
          </span>
        </button>
        <div className="pricing-period-labels">
          <button
            type="button"
            className={period === "monthly" ? "is-active" : undefined}
            onClick={() => setBilling("monthly")}
          >
            Месяц
          </button>
          <button
            type="button"
            className={period === "yearly" ? "is-active" : undefined}
            onClick={() => setBilling("yearly")}
          >
            Год <span className="billing-discount">−20%</span>
          </button>
        </div>
      </div>

      <div className="pricing-showcase">
        {plans.map((plan, index) => {
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
              key={plan.tier}
              className={`pricing-card${plan.highlighted ? " is-popular" : ""}${
                index === 0 ? " is-side-left" : index === 2 ? " is-side-right" : ""
              }`}
            >
              {plan.highlighted ? (
                <div className="pricing-popular-badge">
                  <Star size={14} />
                  Рекомендуем
                </div>
              ) : null}

              <p className="pricing-card-name">{plan.name}</p>
              <p className="pricing-card-price">
                <AnimatedRub value={displayPrice} />
                <span> ₽</span>
                <small>/ мес</small>
              </p>
              <p className="muted pricing-card-billed">
                {period === "yearly"
                  ? `${plan.yearlyPriceRub.toLocaleString("ru-RU")} ₽ за год`
                  : "оплата помесячно"}
              </p>

              <ul className="pricing-feature-list">
                {features.map((feature) => (
                  <li key={feature}>
                    <Check size={16} aria-hidden="true" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <hr className="pricing-divider" />

              {user ? (
                <Link
                  to={`/checkout/${checkoutId}`}
                  className={`btn btn-block${plan.highlighted ? " btn-primary" : " btn-secondary"}`}
                >
                  Оформить
                </Link>
              ) : (
                <Link
                  to="/register"
                  className={`btn btn-block${plan.highlighted ? " btn-primary" : " btn-secondary"}`}
                >
                  Попробовать бесплатно
                </Link>
              )}

              <p className="muted pricing-card-foot">
                {plan.tier === "elite"
                  ? "Для линий с несколькими постами и beta-функциями"
                  : plan.tier === "standard"
                    ? "Оптимально для растущей команды на складе"
                    : "Старт для одного рабочего места"}
              </p>
            </article>
          );
        })}
      </div>

      <p className="pricing-trust">
        Без привязки карты · Отмена в любой момент · Тестовый период при первой подписке
      </p>
    </section>
  );
}

function burstConfetti(x: number, y: number) {
  const root = document.createElement("div");
  root.className = "pricing-confetti";
  root.setAttribute("aria-hidden", "true");
  document.body.appendChild(root);

  const colors = ["var(--accent-bright)", "var(--accent)", "#f4a261", "#e9c46a", "#2a9d8f"];
  const ox = (x / window.innerWidth) * 100;
  const oy = (y / window.innerHeight) * 100;

  for (let i = 0; i < 28; i += 1) {
    const bit = document.createElement("span");
    const angle = (Math.PI * 2 * i) / 28;
    const dist = 40 + Math.random() * 70;
    bit.style.setProperty("--dx", `${Math.cos(angle) * dist}px`);
    bit.style.setProperty("--dy", `${Math.sin(angle) * dist - 30}px`);
    bit.style.left = `${ox}%`;
    bit.style.top = `${oy}%`;
    bit.style.background = colors[i % colors.length];
    root.appendChild(bit);
  }

  window.setTimeout(() => root.remove(), 900);
}
