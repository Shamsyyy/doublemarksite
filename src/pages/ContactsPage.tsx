import { FormEvent, useState } from "react";
import { COMPANY } from "../content/site";
import { User, Mail, MessageSquare, Phone, Send, MapPin } from "lucide-react";

export function ContactsPage() {
  const [sent, setSent] = useState(false);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSent(true);
  }

  return (
    <section className="section">
      <h1>Контакты</h1>
      <p>
        {COMPANY.legalName}
        <br />
        ИНН: {COMPANY.inn}
      </p>

      <div className="grid two" style={{ marginBottom: '2rem' }}>
        <div className="card">
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <Mail size={18} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: '0.1rem' }} />
            <div>
              <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Email</div>
              <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>
            </div>
          </div>
        </div>
        <div className="card">
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <MapPin size={18} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: '0.1rem' }} />
            <div>
              <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Адрес</div>
              <span className="muted" style={{ fontSize: '0.875rem' }}>{COMPANY.address}</span>
            </div>
          </div>
        </div>
      </div>

      <h2 className="form-intro">
        Предложение о сотрудничестве, напишите нам и мы свяжемся с вами.
      </h2>

      {sent ? (
        <p className="success" role="status" aria-live="polite">
          Спасибо! Мы свяжемся с вами (симуляция формы в MVP).
        </p>
      ) : (
        <form className="form card" onSubmit={onSubmit}>
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
          <label className="checkbox">
            <input type="checkbox" required />
            <span className="checkbox-text">Согласен на обработку персональных данных</span>
          </label>
          <button type="submit" className="btn btn-primary">
            <Send size={16} />
            Отправить
          </button>
        </form>
      )}
    </section>
  );
}
