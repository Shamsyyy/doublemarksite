import { FormEvent, useState } from "react";
import { COMPANY } from "../content/site";

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
        <br />
        {COMPANY.address}
      </p>

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
            <input
              name="name"
              autoComplete="name"
              required
              placeholder="Иван Иванов"
            />
          </label>
          <label>
            Email <span className="required-mark">*</span>
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="name@company.ru"
            />
          </label>
          <label>
            Ник в Telegram
            <input name="telegram" placeholder="@username" />
          </label>
          <label>
            Номер телефона
            <input
              name="phone"
              type="tel"
              autoComplete="tel"
              placeholder="+7 (900) 000-00-00"
            />
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
            Отправить
          </button>
        </form>
      )}
    </section>
  );
}
