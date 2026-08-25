/**
 * Единый источник юридических сведений сайта DoubleMark.
 * Реквизиты оператора внесены владельцем 24.08.2026. Телефон не передан — не выдумывается.
 */
export const CONSENT_VERSION = "2026-09-01.1";
export const PD_CONSENT_VERSION = "2026-09-01.1";
export const LEGAL_DOCUMENTS_DATE = "24.08.2026";
export const LEGAL_COMPLIANCE_TARGET = "01.09.2026";

export const SITE = {
  brandName: "DoubleMark",
  publicUrl: "https://doublemark.ru",
  apiUrl: "https://api.doublemark.ru",
} as const;

export const OPERATOR = {
  /** Публичное имя сервиса. */
  displayName: "DoubleMark",
  shortName: "ИП ГАТАУЛЛИНА ДИАНА НАИЛЕВНА",
  legalName: "ГАТАУЛЛИНА ДИАНА НАИЛЕВНА (ИП)",
  inn: "165918039851",
  ogrn: "32618000062250",
  ogrnip: "32618000062250",
  registrationDate: "",
  address: "Ижевск, ул Орджоникидзе д 26а, кв 4",
  email: "support@doublemark.ru",
  phone: "",
  pdContactEmail: "support@doublemark.ru",
  detailsComplete: true,
} as const;

export const BANK = {
  name: 'АО "АЛЬФА-БАНК"',
  inn: "7728168971",
  bik: "044525593",
  correspondentAccount: "30101810200000000593",
  account: "40802810502260006904",
  currency: "RUR",
  address: "127434, г. Москва, ш. Дмитровское, д. 15, корпус 1",
} as const;

/**
 * Совместимость с прежним импортом COMPANY.
 */
export const COMPANY = {
  name: SITE.brandName,
  shortName: OPERATOR.shortName,
  legalName: OPERATOR.legalName,
  inn: OPERATOR.inn,
  ogrnip: OPERATOR.ogrnip,
  registrationDate: OPERATOR.registrationDate,
  email: OPERATOR.email,
  phone: OPERATOR.phone,
  address: OPERATOR.address,
};

export function operatorDocumentLine(): string {
  const parts = [
    OPERATOR.legalName,
    `сокращённо ${OPERATOR.shortName}`,
    `ИНН ${OPERATOR.inn}`,
    OPERATOR.ogrnip ? `ОГРНИП ${OPERATOR.ogrnip}` : null,
    `адрес: ${OPERATOR.address}`,
  ].filter(Boolean);
  return `${parts.join(". ")}.`;
}

export const INFRASTRUCTURE = {
  frontendHost: "VPS Timeweb Cloud, IP 46.149.70.172, каталог /var/www/doublemark",
  apiHost: "тот же VPS, Docker-контейнер doublemark-api, публичный адрес https://api.doublemark.ru",
  database: "PostgreSQL в Docker (doublemark-postgres) на том же VPS, БД doublemark",
  dataCenterRegionConfirmed: true,
} as const;

export const LEGAL_PATHS = {
  privacy: "/privacy",
  cookies: "/cookies",
  personalDataConsent: "/personal-data-consent",
  terms: "/legal/terms",
  requisites: "/legal/requisites",
} as const;
