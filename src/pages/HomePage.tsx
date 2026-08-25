import { Link } from "react-router-dom";
import {
  ArrowRight,
  Clock,
  Monitor,
  Printer,
  Rocket,
  Route,
  ScanLine,
  Shield,
  Zap,
} from "lucide-react";
import {
  COMPANY,
  FAQ,
  FEATURES,
  HERO,
  HOW_IT_WORKS,
  TESTIMONIALS,
} from "../content/site";
import { EditorialTestimonials } from "../components/EditorialTestimonials";
import { HeroDashboard } from "../components/HeroDashboard";
import { HeroFloatCards } from "../components/HeroFloatCards";

const featureIcons = {
  zap: Zap,
  route: Route,
  monitor: Monitor,
  scan: ScanLine,
  rocket: Rocket,
  shield: Shield,
} as const;

const stepIcons = {
  scan: ScanLine,
  route: Route,
  monitor: Monitor,
} as const;

function StepPreview({ type }: { type: (typeof HOW_IT_WORKS)[number]["preview"] }) {
  if (type === "scan") {
    return (
      <div className="cos-step-ui">
        <div className="cos-step-ui-head">
          <div className="cos-step-ui-avatar">DM</div>
          <div>
            <strong>Сканирование · линия 2</strong>
            <span>COM / HID · онлайн</span>
          </div>
        </div>
        <div className="cos-step-ui-scan">
          <ScanLine size={32} strokeWidth={1.5} />
          <span>DataMatrix принят</span>
        </div>
        <div className="cos-step-ui-fields">
          <div><span>AI 01</span><strong>04601234567890</strong></div>
          <div><span>AI 21</span><strong>SN-8842-AX</strong></div>
        </div>
        <div className="cos-step-ui-progress">
          <span>Готовность к разбору</span>
          <div className="cos-step-ui-bar"><span style={{ width: "92%" }} /></div>
          <em>92%</em>
        </div>
      </div>
    );
  }

  if (type === "parse") {
    return (
      <div className="cos-step-ui">
        <p className="cos-step-ui-kicker">Разбор GS1</p>
        <div className="cos-step-ui-tags">
          <span>AI 01 · GTIN</span>
          <span>AI 21 · серийный</span>
          <span>AI 91/92</span>
        </div>
        <ul className="cos-step-ui-list">
          <li><span>GTIN распознан</span><strong>97%</strong></li>
          <li><span>FNC1 сохранён</span><strong>100%</strong></li>
          <li><span>Разделители GS</span><strong>100%</strong></li>
        </ul>
        <div className="cos-step-ui-match">
          <span className="cos-match-pill">Совместимость высокая</span>
        </div>
      </div>
    );
  }

  return (
    <div className="cos-step-ui">
      <div className="cos-step-ui-head">
        <div className="cos-step-ui-avatar cos-step-ui-avatar-print">
          <Printer size={18} />
        </div>
        <div>
          <strong>Печать дубля</strong>
          <span>Принтер готов · шаблон v3</span>
        </div>
      </div>
      <div className="cos-step-ui-pipeline">
        <div><span>Готово</span><strong>1 279</strong></div>
        <div><span>Очередь</span><strong>3</strong></div>
        <div className="cos-pipeline-won"><span>Последний</span><strong>1.2 с</strong></div>
      </div>
      <div className="cos-step-ui-progress">
        <span>Успешных печатей сегодня</span>
        <div className="cos-step-ui-bar"><span style={{ width: "99%" }} /></div>
        <em>99.6%</em>
      </div>
    </div>
  );
}

export function HomePage() {
  return (
    <>
      <section
        className="cos-hero-stage"
        style={
          {
            "--hero-bg-image": `url("${import.meta.env.BASE_URL}hero-bg-test.png")`,
          } as React.CSSProperties
        }
      >
        <div className="cos-hero-flute" aria-hidden="true" />
        <div className="cos-hero-inner">
          <span className="cos-badge">{HERO.badge}</span>
          <h1 className="cos-hero-title">
            {HERO.titleLead}
            <br />
            <span>{HERO.titleAccent}</span>
          </h1>
          <p className="cos-lead cos-lead-center">{HERO.subtitle}</p>
          <div className="cos-hero-actions cos-hero-actions-center">
            <Link to="/register" className="btn btn-primary btn-lg">
              {HERO.primaryCta}
              <ArrowRight size={22} />
            </Link>
            <Link to={HERO.secondaryHref} className="btn btn-secondary btn-lg">
              {HERO.secondaryCta}
            </Link>
          </div>
          <div className="cos-hero-visual-wrap">
            <HeroFloatCards />
            <HeroDashboard />
          </div>
        </div>
      </section>

      <section id="how" className="cos-steps-section anchor-section">
        <div className="cos-steps-flute" aria-hidden="true" />
        <div className="cos-container">
          <div className="cos-section-head cos-section-head-center">
            <span className="cos-how-badge">
              <Clock size={14} />
              Как это работает
            </span>
            <h2>Три шага до печати дубля</h2>
            <p className="cos-section-lead">
              От сканирования до принтера за минуты. Вот как устроен процесс на линии.
            </p>
          </div>
          <div className="cos-steps-flow">
            {HOW_IT_WORKS.map((step, index) => {
              const Icon = stepIcons[step.icon];
              return (
                <article
                  key={step.step}
                  className={`cos-step-row fade-in-up${index % 2 === 1 ? " cos-step-row-reverse" : ""}`}
                >
                  <div className="cos-step-content">
                    <div className="cos-step-meta">
                      <span className="cos-step-icon-wrap">
                        <Icon size={22} strokeWidth={1.75} />
                      </span>
                      <span className="cos-step-label">Шаг {step.step}</span>
                    </div>
                    <h3>{step.title}</h3>
                    <p>{step.text}</p>
                    <Link to="/register" className="cos-learn-more">
                      Подробнее
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                  <div className="cos-step-visual">
                    <StepPreview type={step.preview} />
                  </div>
                </article>
              );
            })}
          </div>
          <div className="cos-section-cta">
            <Link to="/register" className="btn btn-primary btn-lg">
              Начать бесплатно
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <section id="benefits" className="cos-section cos-section-dark anchor-section">
        <div className="cos-container">
          <div className="cos-section-head cos-section-head-center">
            <p className="cos-eyebrow cos-eyebrow-light">Возможности</p>
            <h2>Почему выбирают DoubleMark</h2>
            <p className="cos-section-lead cos-section-lead-light">
              Всё для быстрого дублирования кодов маркировки на складе и линии.
            </p>
          </div>
          <div className="cos-feature-grid">
            {FEATURES.map((item) => {
              const Icon = featureIcons[item.icon];
              return (
                <article key={item.title} className="cos-feature-card fade-in-up">
                  <div className="cos-feature-icon">
                    <Icon size={20} />
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="cos-section" id="testimonials">
        <div className="cos-container">
          <div className="cos-section-head cos-section-head-center">
            <p className="cos-eyebrow">Отзывы</p>
            <h2>Используют на складе и линии</h2>
          </div>
          <EditorialTestimonials
            items={TESTIMONIALS.map((item) => ({
              quote: item.quote,
              author: item.name,
              role: item.role,
              company: item.company,
              image: item.image,
            }))}
            emptyTitle="Пока что нет отзывов — вы можете стать первыми!"
            emptyText={`Напишите на ${COMPANY.email || "support@doublemark.ru"} после внедрения на линии: расскажем о вашем кейсе на сайте.`}
          />
        </div>
      </section>

      <section className="cos-section cos-section-alt">
        <div className="cos-container">
          <div className="cos-section-head cos-section-head-center">
            <p className="cos-eyebrow">FAQ</p>
            <h2>Частые вопросы</h2>
          </div>
          <div className="cos-faq">
            {FAQ.map((item) => (
              <details key={item.question} className="cos-faq-item fade-in-up">
                <summary>{item.question}</summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section id="contacts" className="cos-section cos-cta-band anchor-section">
        <div className="cos-container">
          <div className="cos-cta-inner">
          <h2>Готовы ускорить маркировку?</h2>
          <p>Создайте аккаунт, скачайте Windows-приложение и проверьте процесс на вашем оборудовании.</p>
          <div className="cos-hero-actions cos-hero-actions-center">
            <Link to="/register" className="btn btn-primary btn-lg">
              Создать аккаунт
            </Link>
            <Link to="/contacts" className="btn btn-secondary btn-lg">
              Связаться с нами
            </Link>
          </div>
          <p className="cos-cta-contact">
            <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>
          </p>
          </div>
        </div>
      </section>
    </>
  );
}
