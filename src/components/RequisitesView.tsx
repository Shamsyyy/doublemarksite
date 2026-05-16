import { COMPANY } from "../content/site";

const COMPANY_ROWS = [
  { label: "Наименование", value: COMPANY.legalName },
  { label: "ОГРНИП", value: COMPANY.ogrnip },
  { label: "ИНН", value: COMPANY.inn },
  { label: "Дата регистрации", value: COMPANY.registrationDate },
] as const;

const CONTACT_ROWS = [
  { label: "Юридический адрес", value: COMPANY.address },
  { label: "Телефон", value: COMPANY.phone },
  { label: "E-mail", value: COMPANY.email },
] as const;

function RequisitesBlock({
  title,
  rows,
}: {
  title: string;
  rows: readonly { label: string; value: string }[];
}) {
  return (
    <section className="requisites-block">
      <h2 className="requisites-heading">{title}</h2>
      <dl className="requisites-table">
        {rows.map((row) => (
          <div key={row.label} className="requisites-row">
            <dt>{row.label}</dt>
            <dd>{row.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function RequisitesView() {
  return (
    <article className="section requisites-page">
      <h1>Реквизиты</h1>
      <RequisitesBlock title="Реквизиты" rows={COMPANY_ROWS} />
      <RequisitesBlock title="Контакты" rows={CONTACT_ROWS} />
    </article>
  );
}
