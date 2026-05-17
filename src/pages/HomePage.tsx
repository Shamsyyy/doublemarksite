import { Link } from "react-router-dom";
import { Zap, Workflow, Monitor, ShieldCheck, ScanLine, Cpu, Printer } from "lucide-react";
import {
  BENEFITS,
  COMPANY,
  HERO,
  HOW_IT_WORKS,
  PRODUCT_NOTES,
} from "../content/site";

function AppMockup() {
  return (
    <div className="mockup-window">
      <div className="mockup-titlebar">
        <span className="mockup-dot" style={{ background: '#f87171' }} />
        <span className="mockup-dot" style={{ background: '#fbbf24' }} />
        <span className="mockup-dot" style={{ background: '#34d399' }} />
        <span style={{ marginLeft: '0.75rem', fontSize: '0.75rem', color: '#5a6a84' }}>
          DoubleMark v2.1.0
        </span>
      </div>
      <div className="mockup-body" style={{ display: 'flex', minHeight: '280px' }}>
        {/* Sidebar */}
        <div style={{
          width: '160px',
          background: '#080d14',
          borderRight: '1px solid #1e2d42',
          padding: '0.75rem 0',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
        }}>
          {[
            { label: 'Главная', active: true },
            { label: 'Сканирование', active: false },
            { label: 'Печать', active: false },
            { label: 'История', active: false },
          ].map(item => (
            <div key={item.label} style={{
              padding: '0.5rem 1rem',
              fontSize: '0.75rem',
              color: item.active ? '#f0f4fc' : '#5a6a84',
              background: item.active ? 'rgba(59,130,246,0.15)' : 'transparent',
              borderLeft: item.active ? '2px solid #3b82f6' : '2px solid transparent',
              cursor: 'pointer',
            }}>
              {item.label}
            </div>
          ))}
        </div>

        {/* Main content */}
        <div style={{ flex: 1, padding: '0.875rem', display: 'grid', gap: '0.625rem', gridTemplateColumns: '1fr 1fr', alignContent: 'start' }}>
          {/* Scanning card */}
          <div style={{
            background: '#111827',
            border: '1px solid #1e2d42',
            borderRadius: '8px',
            padding: '0.75rem',
          }}>
            <div style={{ fontSize: '0.7rem', color: '#8896b0', marginBottom: '0.5rem', fontWeight: 600 }}>Сканирование</div>
            <div style={{ fontSize: '0.65rem', color: '#34d399', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34d399', display: 'inline-block' }} />
              Сканер HID настроен
            </div>
            <div style={{
              background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
              borderRadius: '5px',
              padding: '0.35rem 0.625rem',
              fontSize: '0.65rem',
              color: 'white',
              textAlign: 'center',
              marginTop: '0.5rem',
            }}>
              Подключить
            </div>
          </div>

          {/* Autoprint card */}
          <div style={{
            background: '#111827',
            border: '1px solid #1e2d42',
            borderRadius: '8px',
            padding: '0.75rem',
          }}>
            <div style={{ fontSize: '0.7rem', color: '#8896b0', marginBottom: '0.5rem', fontWeight: 600 }}>Автопечать</div>
            <div style={{ fontSize: '0.65rem', color: '#8896b0', marginBottom: '0.35rem' }}>Принтер: По умолчанию</div>
            <div style={{
              background: 'linear-gradient(135deg, #22d3ee, #3b82f6)',
              borderRadius: '5px',
              padding: '0.35rem 0.625rem',
              fontSize: '0.65rem',
              color: 'white',
              textAlign: 'center',
              marginTop: '0.5rem',
            }}>
              Печать последнего ЧЗ
            </div>
          </div>

          {/* Last scan */}
          <div style={{
            background: '#111827',
            border: '1px solid #1e2d42',
            borderRadius: '8px',
            padding: '0.75rem',
            gridColumn: '1 / -1',
          }}>
            <div style={{ fontSize: '0.7rem', color: '#8896b0', marginBottom: '0.5rem', fontWeight: 600 }}>Последний скан</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
              {[
                { label: 'AI 21', value: '5s7Zjg7' },
                { label: 'AI 92/93', value: 'zUHK' },
                { label: 'GS count', value: '1' },
              ].map(f => (
                <div key={f.label}>
                  <div style={{ fontSize: '0.6rem', color: '#5a6a84' }}>{f.label}</div>
                  <div style={{ fontSize: '0.7rem', color: '#3b82f6', fontWeight: 600 }}>{f.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const BENEFIT_ICONS = [Zap, Workflow, Monitor, ShieldCheck];
const STEP_ICONS = [ScanLine, Cpu, Printer];

export function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <p className="eyebrow">Для малого бизнеса и склада</p>
          <h1>
            <span className="h1-gradient">{HERO.title.split(' ').slice(0, 3).join(' ')}</span>
            {' '}{HERO.title.split(' ').slice(3).join(' ')}
          </h1>
          <p className="lead">{HERO.subtitle}</p>
          <div className="hero-actions">
            <Link to="/register" className="btn btn-primary">
              <Zap size={16} />
              {HERO.primaryCta}
            </Link>
            <Link to="/pricing" className="btn btn-secondary">
              {HERO.secondaryCta}
            </Link>
          </div>
          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">&lt;&nbsp;2с</span>
              <span className="stat-label">на скан и печать</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">3</span>
              <span className="stat-label">шага в процессе</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">GS1</span>
              <span className="stat-label">полный разбор</span>
            </div>
          </div>
        </div>

        {/* Right: App Screenshot Mockup */}
        <div className="hero-mockup">
          <AppMockup />
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="section anchor-section">
        <h2>Преимущества</h2>
        <div className="grid three">
          {BENEFITS.map((item, i) => {
            const Icon = BENEFIT_ICONS[i];
            return (
              <article key={item.title} className="card fade-in-up">
                <div className="card-icon">
                  <Icon size={20} />
                </div>
                <h3>{item.title}</h3>
                <p className="muted">{item.text}</p>
              </article>
            );
          })}
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how" className="section section-muted anchor-section">
        <h2>Как это работает</h2>
        <ol className="steps">
          {HOW_IT_WORKS.map((step, i) => {
            const Icon = STEP_ICONS[i];
            return (
              <li key={step.step} className="fade-in-up">
                <span className="step-icon">
                  <Icon size={20} />
                </span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      {/* Product Notes */}
      <section className="section fade-in-up">
        <h2>О продукте</h2>
        <ul className="notes">
          {PRODUCT_NOTES.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </section>

      {/* Contacts */}
      <section id="contacts" className="section section-muted fade-in-up">
        <h2>Контакты</h2>
        <p>
          Email: <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>
          <br />
          Телефон: <a href={`tel:${COMPANY.phone}`}>{COMPANY.phone}</a>
        </p>
        <Link to="/contacts" className="btn btn-secondary">
          Форма обратной связи
        </Link>
      </section>
    </>
  );
}
