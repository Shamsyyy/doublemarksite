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
  getInstallerFileName,
  isSha256Placeholder,
  loadUpdateManifest,
  loadVersionsManifest,
  type AppVersion,
} from "../lib/appVersions";
import { isSubscriptionActive, type SubscriptionRecord } from "../lib/subscriptions";
import { BrandLogo } from "../components/BrandLogo";
import { apiRecordInstallerDownload } from "../lib/api/client";

const FALLBACK_LATEST: AppVersion = {
  version: "3.0.0",
  releaseDate: "2026-08-24",
  title: "DoubleMark 3.0",
  type: "latest",
  recommended: true,
  mandatory: true,
  installerUrl: `${import.meta.env.BASE_URL}downloads/DoubleMarkSetup-3.0.0.exe`,
  sha256: "PUT_SHA256_HASH_HERE",
  notes: [
    "DoubleMark 3.0 — новый интерфейс и вход через api.doublemark.ru",
    "Обязательное обновление: старые версии 2.x больше не скачиваются",
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
  const [installerLinks, setInstallerLinks] = useState<Record<string, string>>({});
  const userId = user?.id;

  async function trackInstallerDownload(version: string, url: string) {
    try {
      const fileName = url.split("/").pop()?.split("?")[0] || `DoubleMarkSetup-${version}.exe`;
      await apiRecordInstallerDownload({ version, fileName });
    } catch {
      // Tracking must not block the download itself.
    }
  }

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
        const archived = versionsManifest.versions
          .filter((entry) => entry.version !== versionsManifest.latest)
          .filter((entry) => entry.type === "archive" || entry.version !== latest?.version)
          .sort((a, b) =>
            b.version.localeCompare(a.version, undefined, { numeric: true }),
          );

        if (isMounted) {
          setLatestVersion(latest ?? FALLBACK_LATEST);
          setArchivedVersions(archived);
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

  useEffect(() => {
    let isMounted = true;

    async function resolveInstallerLinks() {
      const versions = [
        ...(latestVersion ? [latestVersion] : []),
        ...archivedVersions,
      ];
      if (versions.length === 0) {
        return;
      }

      const entries = await Promise.all(
        versions.map(async (version) => [
          version.version,
          await getInstallerDownloadUrl(version),
        ] as const),
      );

      if (isMounted) {
        setInstallerLinks(Object.fromEntries(entries));
      }
    }

    void resolveInstallerLinks();

    return () => {
      isMounted = false;
    };
  }, [latestVersion, archivedVersions]);

  const allowed = useMemo(
    () => isSubscriptionActive(subscription),
    [subscription],
  );
  const validUntil = subscription?.currentPeriodEnd ?? subscription?.trialEndsAt;

  if (!user) {
    throw new Error("DownloadPage must be rendered for authenticated users");
  }

  const latestInstallerUrl = latestVersion
    ? installerLinks[latestVersion.version]
    : undefined;

  return (
    <section className="section download-page">
      <div className="section-header">
        <BrandLogo size={44} withText={false} />
        <h1>Скачать DoubleMark для Windows</h1>
        <p className="lead">
          Центр выпусков: актуальная сборка DoubleMark 3.0 и манифест автообновления
          с doublemark.ru. Ниже доступны предыдущие сборки 3.0 для отката и проверки.
        </p>
      </div>

      {versionsError && (
        <p className="error" role="alert">{versionsError}</p>
      )}

      {isVersionsLoading ? (
        <p className="muted">Загружаем информацию о версиях...</p>
      ) : (
        <div className="download-release-hub">
          <div className="download-hub-header">Версии · Windows · .NET 8</div>

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
                    {latestInstallerUrl ? (
                      <a
                        className="btn btn-primary download-primary-btn"
                        href={latestInstallerUrl}
                        download={getInstallerFileName(latestVersion, latestInstallerUrl)}
                        onClick={() => {
                          void trackInstallerDownload(latestVersion.version, latestInstallerUrl);
                        }}
                      >
                        <Download size={18} />
                        Скачать последнюю версию
                      </a>
                    ) : (
                      <p className="muted">Подготавливаем ссылку на установщик...</p>
                    )}
                    <div className="download-license-status">
                      <CheckCircle2 size={14} className="download-icon-success" />
                      <span>
                        Лицензия активна до{" "}
                        {validUntil ? formatDate(validUntil) : "нет данных"}
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
                      {installerLinks[version.version] ? (
                        <a
                          className="btn btn-secondary btn-small"
                          href={installerLinks[version.version]}
                          download={getInstallerFileName(
                            version,
                            installerLinks[version.version],
                          )}
                          onClick={() => {
                            void trackInstallerDownload(
                              version.version,
                              installerLinks[version.version],
                            );
                          }}
                        >
                          <Download size={16} />
                          Скачать
                        </a>
                      ) : (
                        <span className="muted btn-small">…</span>
                      )}
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
              Установленное приложение периодически проверяет{" "}
              <a
                href={`${import.meta.env.BASE_URL}updates/update.json`}
                target="_blank"
                rel="noopener noreferrer"
              >
                update.json
              </a>{" "}
              на сервере doublemark.ru.
            </p>
            <p className="muted" style={{ marginTop: "0.75rem" }}>
              <AlertTriangle size={14} style={{ verticalAlign: "text-top", marginRight: "0.35rem" }} />
              SHA256 в манифесте обновляется при каждой публикации установщика.
            </p>
          </article>
        </div>
      )}
    </section>
  );
}
