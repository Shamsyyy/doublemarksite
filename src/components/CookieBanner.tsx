import { useEffect, useId, useState } from "react";
import { Link } from "react-router-dom";
import {
  acceptAllCookies,
  applyConsentSideEffects,
  getCookieConsent,
  hasCookieDecision,
  rejectOptionalCookies,
  saveCookieConsent,
  type CookieConsent,
} from "../lib/consent";
import { loadAllowedTrackers } from "../lib/trackers";
import { LEGAL_PATHS } from "../config/legal";

type BannerMode = "banner" | "settings";

function applyConsent(consent: CookieConsent | null): void {
  applyConsentSideEffects(consent);
  loadAllowedTrackers(consent);
}

export function CookieBanner() {
  const titleId = useId();
  const descriptionId = useId();
  const [consent, setConsent] = useState<CookieConsent | null>(() => getCookieConsent());
  const [visible, setVisible] = useState(() => !hasCookieDecision());
  const [mode, setMode] = useState<BannerMode>("banner");
  const [draft, setDraft] = useState({
    analytics: false,
    functional: false,
    marketing: false,
  });

  useEffect(() => {
    applyConsent(consent);
  }, [consent]);

  useEffect(() => {
    const onOpen = () => {
      const current = getCookieConsent();
      setDraft({
        analytics: current?.analytics ?? false,
        functional: current?.functional ?? false,
        marketing: current?.marketing ?? false,
      });
      setMode("settings");
      setVisible(true);
    };
    window.addEventListener("doublemark:open-cookie-settings", onOpen);
    return () => window.removeEventListener("doublemark:open-cookie-settings", onOpen);
  }, []);

  function closeAfter(next: CookieConsent): void {
    setConsent(next);
    applyConsent(next);
    setVisible(false);
    setMode("banner");
  }

  if (!visible) {
    return null;
  }

  if (mode === "settings") {
    return (
      <div
        className="cookie-banner cookie-settings"
        role="dialog"
        aria-modal="false"
        aria-labelledby={titleId}
      >
        <h2 id={titleId}>Настройки cookie</h2>
        <p className="muted">
          Необходимые технологии нужны для работы сайта. Остальные категории сейчас не
          подключены к сторонним сервисам и по умолчанию выключены.
        </p>
        <fieldset className="cookie-categories">
          <label className="checkbox">
            <input type="checkbox" checked disabled />
            <span className="checkbox-text">
              <strong>Необходимые</strong> — сессия, безопасность, сохранение этих настроек
            </span>
          </label>
          <label className="checkbox">
            <input
              type="checkbox"
              checked={draft.analytics}
              onChange={(event) =>
                setDraft((value) => ({ ...value, analytics: event.target.checked }))
              }
            />
            <span className="checkbox-text">
              <strong>Аналитика</strong> — сейчас не используется
            </span>
          </label>
          <label className="checkbox">
            <input
              type="checkbox"
              checked={draft.functional}
              onChange={(event) =>
                setDraft((value) => ({ ...value, functional: event.target.checked }))
              }
            />
            <span className="checkbox-text">
              <strong>Функциональные</strong> — сейчас не используется
            </span>
          </label>
          <label className="checkbox">
            <input
              type="checkbox"
              checked={draft.marketing}
              onChange={(event) =>
                setDraft((value) => ({ ...value, marketing: event.target.checked }))
              }
            />
            <span className="checkbox-text">
              <strong>Маркетинг</strong> — сейчас не используется
            </span>
          </label>
        </fieldset>
        <div className="cookie-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              if (hasCookieDecision()) {
                setVisible(false);
                setMode("banner");
                return;
              }
              setMode("banner");
            }}
          >
            Назад
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              const current = getCookieConsent();
              const next = saveCookieConsent({
                analytics: draft.analytics,
                functional: draft.functional,
                marketing: draft.marketing,
                action: current ? "update" : "grant",
                existingId: current?.id,
              });
              closeAfter(next);
            }}
          >
            Сохранить
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="cookie-banner"
      role="region"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
    >
      <p id={titleId} className="cookie-banner-title">
        Файлы cookie
      </p>
      <p id={descriptionId}>
        Мы используем необходимые файлы cookie и локальное хранилище для работы сайта и
        сохранения ваших настроек. Аналитические и рекламные модули сейчас не подключены.{" "}
        <Link to={LEGAL_PATHS.cookies}>Подробнее — в Политике использования cookie</Link>.
      </p>
      <div className="cookie-actions">
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => closeAfter(acceptAllCookies())}
        >
          Принять
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => closeAfter(rejectOptionalCookies())}
        >
          Отклонить необязательные
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => {
            const current = getCookieConsent();
            setDraft({
              analytics: current?.analytics ?? false,
              functional: current?.functional ?? false,
              marketing: current?.marketing ?? false,
            });
            setMode("settings");
          }}
        >
          Настроить
        </button>
      </div>
    </div>
  );
}

export function openCookieSettings(): void {
  window.dispatchEvent(new Event("doublemark:open-cookie-settings"));
}
