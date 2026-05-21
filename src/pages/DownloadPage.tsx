import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  Archive,
  CheckCircle2,
  Download,
  Monitor,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../context/useAuth";
import { backendAdapter } from "../lib/backend/adapter";
import {
  getInstallerDownloadUrl,
  isSha256Placeholder,
  loadUpdateManifest,
  loadVersionsManifest,
  type AppVersion,
} from "../lib/appVersions";
import { isSubscriptionActive, type SubscriptionRecord } from "../lib/subscriptions";
import { BrandLogo } from "../components/BrandLogo";

const FALLBACK_LATEST: AppVersion = {
  version: "2.1.1",
  releaseDate: "2026-05-21",
  title: "DoubleMark 2.1.1",
  type: "latest",
  recommended: true,
  mandatory: false,
  installerUrl: `${import.meta.env.BASE_URL}downloads/DoubleMarkSetup-2.1.1.exe`,
  sha256: "PUT_SHA256_HASH_HERE",
  notes: [
    "Исправлена работа HID/RawInput",
    "Улучшена диагностика сканера",
    "Добавлены логи ошибок",
    "Улучшена автопечать",
  ],
};

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString("ru-RU");
}

function VersionBadge({ version }: { version: AppVersion }) {
  if (version.mandatory) {
    return <span className="version-badge version-badge-mandatory">Обязательное</span>;
  }
  if (version.type === "latest") {
    return <span className="version-badge version-badge-latest">Последняя</span>;
  }
  return <span className="version-badge version-badge-archive">Архив</span>;
}

export function DownloadPage() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionRecord | null>(null);
  const [latestVersion, setLatestVersion] = useState<AppVersion | null>(null);
  const [archivedVersions, setArchivedVersions] = useState<AppVersion[]>([]);
  const [versionsError, setVersionsError] = useState<string | null>(null);
  const [isVersionsLoading, setIsVersionsLoading] = useState(true);
  const [isAccessLoading, setIsAccessLoading] = useState(true);
  const [accessError, setAccessError] = useState<string | null>(null);
  const userId = user?.id;

  useEffect(() => {
    let isMounted = true;

    async function loadVersions() {
      setIsVersionsLoading(true);
      setVersionsError(null);
      try {
        const [versionsManifest, updateManifest] = await Promise.all([
          loadVersionsManifest(),
          loadUpdateManifest(),
        ]);

        const latest =
          versionsManifest.versions.find((entry) => entry.version === versionsManifest.latest) ??
          versionsManifest.versions.find((entry) => entry.type === "latest") ??
          null;

        if (isMounted) {
          setLatestVersion(latest ?? FALLBACK_LATEST);
          setArchivedVersions(
            versionsManifest.versions
              .filter((entry) => entry.type === "archive")
              .sort((a, b) => b.version.localeCompare(a.version, undefined, { numeric: true })),
          );
        }

        if (latest && updateManifest.version !== latest.version && isMounted) {
          console.warn(
            "update.json version differs from versions.json latest:",
            updateManifest.version,
            latest.version,
          );
        }
      } catch (error) {
        if (isMounted) {
          setVersionsError(
            error instanceof Error
              ? error.message
              : "Не удалось загрузить список версий приложения.",
          );
          setLatestVersion(FALLBACK_LATEST);
          setArchivedVersions([]);
        }
      } finally {
        if (isMounted) {
          setIsVersionsLoading(false);
        }
      }
    }

    void loadVersions();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadAccess() {
      if (!userId) {
        return;
      }
      setIsAccessLoading(true);
      setAccessError(null);
      try {
        const currentSubscription = await backendAdapter.getActiveEntitlement(userId);
        if (isMounted) {
          setSubscription(currentSubscription);
        }
      } catch (error) {
        if (isMounted) {
          setAccessError(
            error instanceof Error ? error.message : "Ошибка проверки подписки",
          );
        }
      } finally {
        if (isMounted) {
          setIsAccessLoading(false);
        }
      }
    }

    void loadAccess();

    return () => {
      isMounted = false;
    };
  }, [userId]);

  const allowed = useMemo(
    () => isSubscriptionActive(subscription),
    [subscription],
  );
  const validUntil = subscription?.currentPeriodEnd ?? subscription?.trialEndsAt;

  if (!user) {
    throw new Error("DownloadPage must be rendered for authenticated users");
  }

  const latestInstallerUrl = latestVersion
    ? getInstallerDownloadUrl(latestVersion)
    : `${import.meta.env.BASE_URL}downloads/DoubleMarkSetup-2.1.1.exe`;

  return (
    <section className="section download-page">
      <BrandLogo size={44} withText={false} />
      <h1>Скачать DoubleMark для Windows</h1>
      <p className="lead">
        Актуальная версия приложения, архив старых сборок и манифест для автообновления.
      </p>

      {versionsError && (
        <p className="error" role="alert">{versionsError}</p>
      )}

      {isVersionsLoading ? (
        <p className="muted">Загружаем информацию о версиях...</p>
      ) : (
        <>
          <h2 className="download-history-heading">История версий</h2>

          <article className="card download-latest-card">
            <div className="download-latest-header">
              <div>
                <div className="download-latest-title-row">
                  <Sparkles size={18} className="download-icon-accent" />
                  <h2>Актуальная версия</h2>
                  {latestVersion && <VersionBadge version={latestVersion} />}
                </div>
                {latestVersion && (
                  <p className="download-version-meta">
                    Версия <strong>{latestVersion.version}</strong>
                    {latestVersion.releaseDate && (
                      <> · {formatDate(latestVersion.releaseDate)}</>
                    )}
                  </p>
                )}
              </div>
              <div className="download-badge platform-badge">
                <Monitor size={14} />
                Windows · .NET 8
              </div>
            </div>

            {latestVersion ? (
              <>
                <ul className="release-notes">
                  {latestVersion.notes.map((note) => (
                    <li key={note}>{note}</li>
                  ))}
                </ul>
                {isSha256Placeholder(latestVersion.sha256) && (
                  <p className="muted download-sha-hint" role="note">
                    SHA256 будет добавлен после сборки установщика (см. docs/APP_UPDATES.md).
                  </p>
                )}
                {isAccessLoading ? (
                  <p className="muted">Проверяем подписку...</p>
                ) : accessError ? (
                  <p className="error" role="alert">{accessError}</p>
                ) : allowed ? (
                  <>
                    <a
                      className="btn btn-primary download-primary-btn"
                      href={latestInstallerUrl}
                      download={`DoubleMarkSetup-${latestVersion.version}.exe`}
                    >
                      <Download size={18} />
                      Скачать последнюю версию
                    </a>
                    <div className="download-license-status">
                      <CheckCircle2 size={14} className="download-icon-success" />
                      <span>
                        Лицензия активна до{" "}
                        {validUntil ? formatDate(validUntil) : "—"}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="muted download-access-hint">
                      Для скачивания нужна активная подписка DoubleMark.
                    </p>
                    <Link to="/pricing" className="btn btn-secondary">
                      Перейти к тарифам
                    </Link>
                  </>
                )}
              </>
            ) : (
              <p className="muted">Информация о версии недоступна.</p>
            )}
          </article>

          {archivedVersions.length > 0 && (
            <section className="download-archive-section">
              <div className="download-archive-header">
                <Archive size={20} className="download-icon-muted" />
                <div>
                  <h2>Старые версии</h2>
                  <p className="muted">
                    Старые версии могут не поддерживаться. Рекомендуем использовать последнюю
                    версию DoubleMark.
                  </p>
                </div>
              </div>

              <div className="version-list">
                {archivedVersions.map((version) => (
                  <article key={version.version} className="card version-card">
                    <div className="version-card-top">
                      <div>
                        <div className="version-card-title-row">
                          <h3>{version.title}</h3>
                          <VersionBadge version={version} />
                        </div>
                        <p className="version-card-meta">
                          v{version.version}
                          {version.releaseDate && <> · {formatDate(version.releaseDate)}</>}
                        </p>
                      </div>
                      <a
                        className="btn btn-secondary btn-small"
                        href={getInstallerDownloadUrl(version)}
                        download={`DoubleMarkSetup-${version.version}.exe`}
                      >
                        <Download size={16} />
                        Скачать
                      </a>
                    </div>
                    <ul className="version-notes">
                      {version.notes.slice(0, 2).map((note) => (
                        <li key={note}>{note}</li>
                      ))}
                      {version.notes.length > 2 && (
                        <li className="muted">+{version.notes.length - 2} изменений</li>
                      )}
                    </ul>
                    {isSha256Placeholder(version.sha256) && (
                      <p className="muted version-sha-hint">SHA256 уточняется при публикации</p>
                    )}
                  </article>
                ))}
              </div>
            </section>
          )}

          <article className="card download-update-card">
            <h2>Автообновление</h2>
            <p className="muted">
              Установленное приложение проверяет{" "}
              <a
                href={`${import.meta.env.BASE_URL}updates/update.json`}
                target="_blank"
                rel="noopener noreferrer"
              >
                update.json
              </a>{" "}
              на GitHub Pages.
            </p>
            <p className="muted" style={{ marginTop: "0.75rem" }}>
              <AlertTriangle size={14} style={{ verticalAlign: "text-top", marginRight: "0.35rem" }} />
              Перед релизом замените SHA256 в JSON-файлах на реальные значения.
            </p>
          </article>
        </>
      )}
    </section>
  );
}
