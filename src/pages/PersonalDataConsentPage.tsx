import { BrandLogo } from "../components/BrandLogo";
import {
  LEGAL_DOCUMENTS_DATE,
  OPERATOR,
  operatorDocumentLine,
  PD_CONSENT_VERSION,
  SITE,
} from "../config/legal";

export function PersonalDataConsentPage() {
  return (
    <article className="section legal">
      <div className="section-header">
        <BrandLogo size={44} withText={false} />
        <h1>Согласие на обработку персональных данных</h1>
        <p className="muted">
          Версия {PD_CONSENT_VERSION}. Дата {LEGAL_DOCUMENTS_DATE}.
        </p>
      </div>

      <section>
        <h2>Кто получает согласие</h2>
        <p>
          Оператор сайта {SITE.publicUrl} под именем {OPERATOR.displayName}:{" "}
          {operatorDocumentLine()} Контакт:{" "}
          <a href={`mailto:${OPERATOR.pdContactEmail}`}>{OPERATOR.pdContactEmail}</a>.
        </p>
      </section>

      <section>
        <h2>Какие данные</h2>
        <p>
          Email, пароль (на сервере — хеш), название организации, ИНН и телефон — если вы их
          указали при регистрации.
        </p>
      </section>

      <section>
        <h2>Для чего</h2>
        <p>
          Создать аккаунт, вести профиль и организацию, учитывать подписку и доступ к загрузке
          приложения.
        </p>
      </section>

      <section>
        <h2>Что делается с данными</h2>
        <p>
          Запись и хранение в PostgreSQL на VPS, который обслуживает {SITE.apiUrl}; использование
          для входа и личного кабинета; удаление по обращению или при удалении аккаунта.
        </p>
      </section>

      <section>
        <h2>Кому передаются</h2>
        <p>
          Иностранные аналитические и рекламные сервисы эти сведения с сайта не получают.
          Отдельный обработчик по поручению в коде сайта не подключён.
        </p>
      </section>

      <section>
        <h2>Срок и отзыв</h2>
        <p>
          Согласие действует, пока существует аккаунт либо до отзыва. Отзыв не обязан отменять
          обработку, которая нужна для исполнения договора (вход, уже оказанные услуги), если
          иное не следует из закона. Чтобы отозвать согласие, напишите на{" "}
          <a href={`mailto:${OPERATOR.pdContactEmail}`}>{OPERATOR.pdContactEmail}</a>.
        </p>
      </section>

      <section>
        <h2>Как даётся согласие</h2>
        <p>
          Отдельный неотмеченный флажок на странице регистрации со ссылкой на этот текст. Оферта
          принимается другим флажком.
        </p>
      </section>
    </article>
  );
}
