import { BANK, COMPANY, OPERATOR } from "../config/legal";
import { BrandLogo } from "./BrandLogo";

export function RequisitesView() {
  return (
    <article className="section requisites-page">
      <BrandLogo size={44} withText={false} />
      <h1>Реквизиты</h1>
      <section className="requisites-block">
        <h2 className="requisites-heading">Контакты</h2>
        <dl className="requisites-table">
          <div className="requisites-row">
            <dt>E-mail</dt>
            <dd>
              <a href={`mailto:${OPERATOR.email}`}>{OPERATOR.email}</a>
            </dd>
          </div>
          <div className="requisites-row">
            <dt>По вопросам персональных данных</dt>
            <dd>
              <a href={`mailto:${OPERATOR.pdContactEmail}`}>{OPERATOR.pdContactEmail}</a>
            </dd>
          </div>
        </dl>
      </section>
      {OPERATOR.detailsComplete ? (
        <>
          <section className="requisites-block">
            <h2 className="requisites-heading">Организация</h2>
            <dl className="requisites-table">
              <div className="requisites-row">
                <dt>Полное наименование</dt>
                <dd>{COMPANY.legalName}</dd>
              </div>
              <div className="requisites-row">
                <dt>Сокращённое наименование</dt>
                <dd>{COMPANY.shortName}</dd>
              </div>
              {COMPANY.ogrnip ? (
                <div className="requisites-row">
                  <dt>ОГРНИП</dt>
                  <dd>{COMPANY.ogrnip}</dd>
                </div>
              ) : null}
              {COMPANY.inn ? (
                <div className="requisites-row">
                  <dt>ИНН</dt>
                  <dd>{COMPANY.inn}</dd>
                </div>
              ) : null}
              {COMPANY.address ? (
                <div className="requisites-row">
                  <dt>Юридический адрес</dt>
                  <dd>{COMPANY.address}</dd>
                </div>
              ) : null}
              {COMPANY.phone ? (
                <div className="requisites-row">
                  <dt>Телефон</dt>
                  <dd>{COMPANY.phone}</dd>
                </div>
              ) : null}
            </dl>
          </section>
          <section className="requisites-block">
            <h2 className="requisites-heading">Банковские реквизиты</h2>
            <dl className="requisites-table">
              <div className="requisites-row">
                <dt>Расчётный счёт</dt>
                <dd>
                  {BANK.account} ({BANK.currency})
                </dd>
              </div>
              <div className="requisites-row">
                <dt>Банк</dt>
                <dd>{BANK.name}</dd>
              </div>
              <div className="requisites-row">
                <dt>ИНН банка</dt>
                <dd>{BANK.inn}</dd>
              </div>
              <div className="requisites-row">
                <dt>БИК</dt>
                <dd>{BANK.bik}</dd>
              </div>
              <div className="requisites-row">
                <dt>Корреспондентский счёт</dt>
                <dd>{BANK.correspondentAccount}</dd>
              </div>
              <div className="requisites-row">
                <dt>Адрес банка</dt>
                <dd>{BANK.address}</dd>
              </div>
            </dl>
          </section>
        </>
      ) : (
        <p>
          Наименование, ИНН, ОГРН/ОГРНИП и адрес оператора в конфигурации сайта не заполнены и
          поэтому здесь не публикуются.
        </p>
      )}
    </article>
  );
}
