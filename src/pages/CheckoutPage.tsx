import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { resolvePlanCheckout, type PlanId } from "../content/pricing";
import { useAuth } from "../context/useAuth";
import { backendAdapter } from "../lib/backend/adapter";

export function CheckoutPage() {
  const { planId } = useParams<{ planId: PlanId }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const resolved = resolvePlanCheckout((planId ?? "") as PlanId);

  if (!user) {
    throw new Error("CheckoutPage must be rendered for authenticated users");
  }

  if (!resolved) {
    return (
      <section className="section">
        <h1>Тариф не найден</h1>
        <Link to="/pricing">К тарифам</Link>
      </section>
    );
  }

  const currentUser = user;
  const checkoutPlanId = resolved.planId;

  async function pay(outcome: "succeeded" | "failed") {
    if (isProcessing) {
      return;
    }
    setIsProcessing(true);
    try {
      const payment = await backendAdapter.processPaymentOutcome(
        currentUser.id,
        checkoutPlanId,
        outcome,
      );
      setStatus(
        payment.status === "succeeded"
          ? "Оплата прошла. Лицензия активирована."
          : "Оплата не прошла. Лицензия не выдана.",
      );
      if (payment.status === "succeeded") {
        setTimeout(() => navigate("/account"), 800);
      }
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <section className="section narrow">
      <h1>Оплата (sandbox)</h1>
      <article className="card">
        <h2>
          {resolved.plan.name} — {resolved.priceRub.toLocaleString("ru-RU")} ₽
          {resolved.period === "yearly" ? " / год" : " / мес"}
        </h2>
        <p>Имитация платёжного провайдера. В продакшене подключите YooKassa/CloudPayments.</p>
        <p className="muted" role="note">
          Sandbox: кнопки ниже только симулируют оплату в браузере, без реального списания и без
          защищённого платёжного шлюза. TODO: В продакшене заменить на YooKassa/CloudPayments webhook.
          Не активировать подписку только с frontend.
        </p>
        <div className="hero-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => void pay("succeeded")}
            disabled={isProcessing}
          >
            Оплатить успешно
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => void pay("failed")}
            disabled={isProcessing}
          >
            Симулировать отказ
          </button>
        </div>
        {status && (
          <p className="success" role="status" aria-live="polite">
            {status}
          </p>
        )}
      </article>
    </section>
  );
}
