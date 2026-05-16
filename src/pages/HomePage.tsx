import { Link } from "react-router-dom";
import {
  BENEFITS,
  COMPANY,
  HERO,
  HOW_IT_WORKS,
  PRODUCT_NOTES,
} from "../content/site";

export function HomePage() {
  return (
    <>
      <section className="hero">
        <p className="eyebrow">Для малого бизнеса и склада</p>
        <h1>{HERO.title}</h1>
        <p className="lead">{HERO.subtitle}</p>
        <div className="hero-actions">
          <Link to="/register" className="btn btn-primary">
            {HERO.primaryCta}
          </Link>
          <Link to="/pricing" className="btn btn-secondary">
            {HERO.secondaryCta}
          </Link>
        </div>
      </section>

      <section id="benefits" className="section anchor-section">
        <h2>Преимущества</h2>
        <div className="grid three">
          {BENEFITS.map((item) => (
            <article key={item.title} className="card">
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="how" className="section section-muted anchor-section">
        <h2>Как это работает</h2>
        <ol className="steps">
          {HOW_IT_WORKS.map((step) => (
            <li key={step.step}>
              <span className="step-num">{step.step}</span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="section">
        <h2>О продукте</h2>
        <ul className="notes">
          {PRODUCT_NOTES.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </section>

      <section id="contacts" className="section section-muted">
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
