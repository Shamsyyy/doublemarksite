import { Link } from "react-router-dom";
import { BrandLogo } from "../components/BrandLogo";
import {
  CONSENT_VERSION,
  LEGAL_DOCUMENTS_DATE,
  LEGAL_PATHS,
  OPERATOR,
  operatorDocumentLine,
  SITE,
} from "../config/legal";

export function CookiePolicyPage() {
  return (
    <article className="section legal">
      <div className="section-header">
        <BrandLogo size={44} withText={false} />
        <h1>Политика использования файлов cookie</h1>
        <p className="muted">
          Версия {CONSENT_VERSION}. Дата {LEGAL_DOCUMENTS_DATE}.
        </p>
      </div>

      <section>
        <h2>1. Оператор сайта</h2>
        <p>
          Сайт {SITE.publicUrl}. Публичное имя сервиса — {OPERATOR.displayName}. Оператор:{" "}
          {operatorDocumentLine()} Контакт:{" "}
          <a href={`mailto:${OPERATOR.email}`}>{OPERATOR.email}</a>.
        </p>
      </section>

      <section>
        <h2>2. Что здесь называется cookie</h2>
        <p>
          Файлы cookie браузера и похожие технологии: localStorage и, при появлении, иные
          клиентские хранилища, которые сайт сам записывает.
        </p>
      </section>

      <section>
        <h2>3. Что реально используется</h2>
        <p>
          Сторонние аналитические и рекламные скрипты не подключены. Google Analytics, Яндекс.Метрика,
          пиксели и аналогичные системы на сайте не найдены.
        </p>
        <p>
          Категории necessary / analytics / functional / marketing — внутренняя техническая
          разметка проекта, а не перечень, который российский закон прямо называет этими словами.
        </p>
      </section>

      <section>
        <h2>4. Таблица записей</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Название</th>
                <th>Поставщик</th>
                <th>Назначение</th>
                <th>Категория</th>
                <th>Срок</th>
                <th>Тип</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>cookie_consent</td>
                <td>DoubleMark, first-party</td>
                <td>Сохранить выбор категорий. Без email, ФИО и телефона</td>
                <td>necessary</td>
                <td>до 12 месяцев (Max-Age cookie) и копия в localStorage</td>
                <td>first-party cookie и localStorage</td>
              </tr>
              <tr>
                <td>doublemark_api_session</td>
                <td>DoubleMark, first-party</td>
                <td>Access и refresh JWT после входа или регистрации</td>
                <td>necessary</td>
                <td>до выхода из аккаунта; срок самих токенов задаёт API</td>
                <td>localStorage, не cookie</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          sessionStorage, IndexedDB и service worker сайт не использует. Cookie с Domain=.doublemark.ru
          сайт не ставит.
        </p>
      </section>

      <section>
        <h2>5. Сторонние сервисы</h2>
        <p>
          После отказа от Google Fonts и Supabase в коде сайта нет загрузки аналитических или
          рекламных доменов. Запросы к {SITE.apiUrl} идут только для функций аккаунта.
        </p>
      </section>

      <section>
        <h2>6. Как изменить и отозвать выбор</h2>
        <p>
          Ссылка «Настройки cookie» в подвале открывает те же категории. Отключение необязательных
          категорий сразу записывается. Так как аналитика не подключена, отключение не удаляет данные
          у третьих лиц: сайт их туда не передавал.
        </p>
      </section>

      <section>
        <h2>7. Удаление через браузер</h2>
        <p>
          В настройках браузера можно удалить cookie и данные сайтов. После этого баннер выбора
          может показаться снова, а вход в аккаунт потребуется повторить.
        </p>
      </section>

      <section>
        <h2>8. Персональные данные</h2>
        <p>
          <Link to={LEGAL_PATHS.privacy}>Политика в отношении обработки персональных данных</Link>
        </p>
      </section>
    </article>
  );
}
