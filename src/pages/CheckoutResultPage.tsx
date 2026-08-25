import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { BrandLogo } from "../components/BrandLogo";
import { apiConfirmSandboxPayment, apiGetPaymentStatus } from "../lib/api/client";

export function CheckoutResultPage() {
  const [params] = useSearchParams();
  const paymentId = params.get("paymentId");
  const [message, setMessage] = useState("Проверяем статус оплаты…");
  const [ok, setOk] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!paymentId) {
        setOk(false);
        setMessage("Не передан идентификатор платежа.");
        return;
      }

      try {
        // If user landed from sandbox confirm URL without POST yet, try GET status first.
        let payment = await apiGetPaymentStatus(paymentId);
        if (payment.status !== "succeeded") {
          try {
            payment = await apiConfirmSandboxPayment(paymentId);
          } catch {
            // Live bank return: wait for webhook — keep pending status.
          }
        }
        if (cancelled) return;
        if (payment.status === "succeeded") {
          setOk(true);
          setMessage("Оплата прошла. Лицензия организации активирована.");
        } else if (payment.status === "failed") {
          setOk(false);
          setMessage("Оплата не прошла. Лицензия не изменена.");
        } else {
          setOk(null);
          setMessage("Платёж ещё обрабатывается. Обновите страницу через минуту.");
        }
      } catch (e) {
        if (cancelled) return;
        setOk(false);
        setMessage(e instanceof Error ? e.message : "Не удалось проверить платёж");
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [paymentId]);

  return (
    <section className="section narrow">
      <BrandLogo size={44} withText={false} />
      <h1>Результат оплаты</h1>
      <article className="card">
        <p className={ok === false ? "error" : undefined} role={ok === false ? "alert" : undefined}>
          {message}
        </p>
        <div className="hero-actions">
          <Link to="/account" className="btn btn-primary">
            В личный кабинет
          </Link>
          <Link to="/pricing" className="btn btn-secondary">
            Тарифы
          </Link>
        </div>
      </article>
    </section>
  );
}
