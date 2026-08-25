import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { resolvePlanCheckout, type PlanId } from "../content/pricing";
import { useAuth } from "../context/useAuth";
import { backendAdapter } from "../lib/backend/adapter";
import { BrandLogo } from "../components/BrandLogo";
import { apiConfirmSandboxPayment } from "../lib/api/client";

export function CheckoutPage() {
  const { planId } = useParams<{ planId: PlanId }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
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

  async function startPayment() {
    if (isProcessing) return;
    setIsProcessing(true);
    setError(null);
    setStatus(null);
    try {
      const checkout = await backendAdapter.startCheckout(user!.id, resolved!.planId);
      if (checkout.sandbox) {
        setStatus("Sandbox: подтверждаем оплату…");
        await apiConfirmSandboxPayment(checkout.paymentId);
        navigate(`/checkout/result?paymentId=${encodeURIComponent(checkout.paymentId)}`);
        return;
      }
      setStatus("Перенаправляем в Альфа-Банк…");
      window.location.assign(checkout.paymentUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось создать платёж");
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <section className="section narrow">
      <BrandLogo size={44} withText={false} />
      <h1>Оплата</h1>
      <article className="card">
        <h2>
          {resolved.plan.name} · {resolved.priceRub.toLocaleString("ru-RU")} ₽
          {resolved.period === "yearly" ? " / год" : " / мес"}
        </h2>
        <p>
          Устройств по тарифу:{" "}
          <strong>
            {resolved.plan.tier === "base" ? 1 : resolved.plan.tier === "standard" ? 3 : 10}
          </strong>
          {" · "}
          пробный период: {resolved.trialDays} дн.
        </p>
        <ul>
          {resolved.features.map((feature) => (
            <li key={feature}>{feature}</li>
          ))}
        </ul>
        <p className="muted" role="note">
          Оплата оформляется на сервере через эквайринг Альфа-Банка. Пока credentials не заданы,
          используется безопасный sandbox-confirm на API.
        </p>
        {error ? (
          <p className="error" role="alert">
            {error}
          </p>
        ) : null}
        {status ? <p>{status}</p> : null}
        <div className="hero-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => void startPayment()}
            disabled={isProcessing}
          >
            {isProcessing ? "Создаём платёж…" : "Перейти к оплате"}
          </button>
          <Link to="/pricing" className="btn btn-secondary">
            Назад к тарифам
          </Link>
        </div>
      </article>
    </section>
  );
}
