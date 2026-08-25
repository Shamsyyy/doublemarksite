import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { BrandLogo } from "../components/BrandLogo";
import { User, Mail, MessageSquare, Phone, Send } from "lucide-react";
import { OPERATOR } from "../config/legal";

export function ContactsPage() {
  const [sent, setSent] = useState(false);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSent(true);
  }

  return (
    <section className="section">
      <div className="section-header">
        <BrandLogo size={44} withText={false} />
        <h1>Контакты</h1>
        <p className="muted">
          Напишите на{" "}
          <a href={`mailto:${OPERATOR.email}`}>{OPERATOR.email}</a>
          . Оператор: {OPERATOR.legalName}, ИНН {OPERATOR.inn}. Форма ниже на сервер ничего не
          отправляет.
        </p>
      </div>

      <div className="grid two" style={{ marginBottom: "2rem" }}>
        <div className="card">
          <div className="contact-info-row">
            <Mail size={18} />
            <div>
              <div className="contact-info-label">Email</div>
              <a href={`mailto:${OPERATOR.email}`}>{OPERATOR.email}</a>
            </div>
          </div>
        </div>
      </div>

      <h2 className="form-intro">
        Форма обратной связи пока не подключена к серверу. Чтобы связаться, используйте почту
        выше.
      </h2>

      {sent ? (
        <p className="success" role="status" aria-live="polite">
          Данные из формы не отправлены: канал обратной связи ещё не подключён. Напишите на{" "}
          <a href={`mailto:${OPERATOR.email}`}>{OPERATOR.email}</a>.
        </p>
      ) : (
        <form className="form panel" onSubmit={onSubmit}>
          <div className="panel-header">Обратная связь</div>
          <div className="panel-body form">
            <label>
              Имя <span className="required-mark">*</span>
              <div className="input-wrap has-icon">
                <User className="input-icon" size={16} />
                <input
                  name="name"
                  autoComplete="name"
                  required
                  placeholder="Иван Иванов"
                />
              </div>
            </label>
            <label>
              Email <span className="required-mark">*</span>
              <div className="input-wrap has-icon">
                <Mail className="input-icon" size={16} />
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="name@company.ru"
                />
              </div>
            </label>
            <label>
              Ник в Telegram
              <div className="input-wrap has-icon">
                <MessageSquare className="input-icon" size={16} />
                <input name="telegram" placeholder="@username" />
              </div>
            </label>
            <label>
              Номер телефона
              <div className="input-wrap has-icon">
                <Phone className="input-icon" size={16} />
                <input
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="+7 (900) 000-00-00"
                />
              </div>
            </label>
            <label>
              Сообщение
              <textarea
                name="message"
                rows={4}
                placeholder="Кратко опишите задачу или предложение"
              />
            </label>
            <p className="muted" style={{ fontSize: "0.875rem" }}>
              Отдельное согласие на обработку персональных данных для этой формы не
              запрашивается, потому что оператор сейчас не получает и не хранит эти
              сведения. Когда форма будет подключена к серверу, здесь появится отдельный
              флажок со ссылкой на{" "}
              <Link to="/personal-data-consent">текст согласия</Link>.
            </p>
            <button type="submit" className="btn btn-primary">
              <Send size={16} />
              Отправить
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
