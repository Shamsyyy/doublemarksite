import { BrandLogo } from "./BrandLogo";

export function HeroDashboard() {
  return (
    <div className="cos-dashboard" aria-hidden="true">
      <div className="cos-dashboard-chrome">
        <span className="cos-dashboard-title">DoubleMark · Windows</span>
      </div>

      <div className="cos-dashboard-body">
        <aside className="cos-dash-sidebar">
          <div className="cos-dash-brand">
            <BrandLogo size={28} withText={false} />
          </div>
          <nav className="cos-dash-nav">
            <span className="is-active">Обзор</span>
            <span>Сканирование</span>
            <span>Печать</span>
            <span>Настройки</span>
          </nav>
        </aside>

        <div className="cos-dash-main">
          <header className="cos-dash-header">
            <div>
              <p className="cos-dash-kicker">Обзор</p>
              <h3 className="cos-dash-greeting">Смена на линии маркировки</h3>
            </div>
            <span className="cos-dash-pill">Онлайн</span>
          </header>

          <div className="cos-dash-stats">
            <article className="cos-stat-card">
              <p className="cos-stat-label">Сканов сегодня</p>
              <p className="cos-stat-value">1 284</p>
              <p className="cos-stat-delta cos-stat-up">+18% к вчера</p>
            </article>
            <article className="cos-stat-card">
              <p className="cos-stat-label">Дублей напечатано</p>
              <p className="cos-stat-value">1 279</p>
              <p className="cos-stat-delta cos-stat-up">99.6% успех</p>
            </article>
            <article className="cos-stat-card">
              <p className="cos-stat-label">Среднее время</p>
              <p className="cos-stat-value">1.4 с</p>
              <p className="cos-stat-delta">скан → печать</p>
            </article>
          </div>

          <div className="cos-dash-grid">
            <section className="cos-dash-panel cos-dash-panel-wide">
              <div className="cos-panel-head">
                <h4>Последние операции</h4>
                <span className="cos-dash-tag">GS1 DataMatrix</span>
              </div>
              <ul className="cos-scan-list">
                <li>
                  <span className="cos-scan-id">AI 01 · 04601234567890</span>
                  <span className="cos-scan-status cos-scan-ok">Напечатано</span>
                </li>
                <li>
                  <span className="cos-scan-id">AI 21 · SN-8842-AX</span>
                  <span className="cos-scan-status cos-scan-ok">Напечатано</span>
                </li>
                <li>
                  <span className="cos-scan-id">Полный код · AI 91/92</span>
                  <span className="cos-scan-status cos-scan-queue">В очереди</span>
                </li>
              </ul>
            </section>

            <section className="cos-dash-panel">
              <div className="cos-panel-head">
                <h4>Оборудование</h4>
              </div>
              <dl className="cos-equipment">
                <div>
                  <dt>Сканер</dt>
                  <dd>COM / HID</dd>
                </div>
                <div>
                  <dt>Принтер</dt>
                  <dd>Готов</dd>
                </div>
                <div>
                  <dt>Версия</dt>
                  <dd>3.0</dd>
                </div>
              </dl>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
