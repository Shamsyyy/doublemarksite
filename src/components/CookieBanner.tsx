import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { hasCookieDecision, saveCookieConsent } from "../lib/cookies";

export function CookieBanner() {
  const [visible, setVisible] = useState(() => !hasCookieDecision());
  const acceptButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!visible) {
      return;
    }
    const previousActive = document.activeElement as HTMLElement | null;
    acceptButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        saveCookieConsent(false, false);
        setVisible(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      previousActive?.focus();
    };
  }, [visible]);

  if (!visible) {
    return null;
  }

  return (
    <div
      className="cookie-banner"
      role="alertdialog"
      aria-modal="true"
      aria-label="Согласие на cookie"
      aria-describedby="cookie-banner-description"
    >
      <p id="cookie-banner-description">
        Сейчас загружаются только необходимые cookie для работы сайта; аналитика и
        маркетинг пока не подключены.{" "}
        <Link to="/legal/cookies">Подробнее</Link>
      </p>
      <div className="cookie-actions">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => {
            saveCookieConsent(false, false);
            setVisible(false);
          }}
        >
          Только необходимые (аналитика не загружается)
        </button>
        <button
          type="button"
          className="btn btn-primary"
          ref={acceptButtonRef}
          onClick={() => {
            saveCookieConsent(true, false);
            setVisible(false);
          }}
        >
          Сохранить выбор (аналитика пока не загружается)
        </button>
      </div>
    </div>
  );
}
