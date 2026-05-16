import { Link } from "react-router-dom";
import { DESKTOP_RELEASE } from "../content/site";
import { useAuth } from "../context/useAuth";
import { backendAdapter } from "../lib/backend/adapter";

export function DownloadPage() {
  const { user } = useAuth();
  if (!user) {
    throw new Error("DownloadPage must be rendered for authenticated users");
  }

  const allowed = backendAdapter.hasActiveLicense(user.id);
  const entitlement = backendAdapter.getActiveEntitlement(user.id);

  return (
    <section className="section">
      <h1>Скачать DubliMark для Windows</h1>
      <p className="lead">Версия {DESKTOP_RELEASE.version}</p>

      {allowed ? (
        <article className="card">
          <p>{DESKTOP_RELEASE.changelog}</p>
          <a className="btn btn-primary" href={DESKTOP_RELEASE.downloadUrl}>
            Скачать установщик
          </a>
          <p className="muted">
            Лицензия активна до{" "}
            {entitlement
              ? new Date(entitlement.validUntil).toLocaleDateString("ru-RU")
              : "—"}
          </p>
        </article>
      ) : (
        <article className="card">
          <p>Для скачивания нужна активная лицензия.</p>
          <Link to="/pricing" className="btn btn-primary">
            Перейти к тарифам
          </Link>
        </article>
      )}
    </section>
  );
}
