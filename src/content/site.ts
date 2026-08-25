import { COMPANY } from "../config/legal";

export { COMPANY };

export const HERO = {
  badge: "Windows-утилита для маркировки",
  titleLead: "Дублирование кодов маркировки",
  titleAccent: "без простоя линии",
  subtitle:
    "DoubleMark сканирует DataMatrix, разбирает GS1 и готовит дубль к печати за секунды. Для склада, линии и малого производства.",
  primaryCta: "Начать бесплатно",
  secondaryCta: "Смотреть как работает",
  secondaryHref: "/#how",
  statusLine: "Windows · COM · HID · GS1 · печать дубля",
};

export const WORKFLOW_STATS = [
  { value: "< 2 с", label: "скан → печать" },
  { value: "3", label: "шага процесса" },
  { value: "GS1", label: "разбор AI 01/21/91/92" },
];

export const FEATURES = [
  {
    title: "Меньше простоя",
    text: "Оператор сканирует код и сразу получает печать, без ручного копирования и лишних окон.",
    icon: "zap" as const,
  },
  {
    title: "Понятный процесс",
    text: "Один сценарий: сканирование, разбор GS1, печать дубля. Без скрытых шагов.",
    icon: "route" as const,
  },
  {
    title: "Рядом с принтером",
    text: "Настольное приложение под Windows: COM, HID и фото DataMatrix там, где стоят сканер и принтер.",
    icon: "monitor" as const,
  },
  {
    title: "Разбор GS1",
    text: "Нормализация AI 01/21 и сохранение AI 91/92 в полных кодах без потери разделителей.",
    icon: "scan" as const,
  },
  {
    title: "Быстрый старт",
    text: "Регистрация на сайте, скачивание установщика и работа на вашем оборудовании в тот же день.",
    icon: "rocket" as const,
  },
  {
    title: "Честные ограничения",
    text: "Приложение объясняет короткие и полные коды, GS/FNC1 и риски обрезки HID.",
    icon: "shield" as const,
  },
];

/** @deprecated use FEATURES */
export const BENEFITS = FEATURES.map((item, i) => ({
  title: item.title,
  text: item.text,
  status: i === 5 ? ("warn" as const) : ("ready" as const),
}));

export const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Сканирование кода",
    text: "Считайте DataMatrix сканером COM/HID или загрузите фото. DoubleMark сразу принимает код в работу.",
    preview: "scan" as const,
    icon: "scan" as const,
  },
  {
    step: "02",
    title: "Разбор GS1",
    text: "Приложение нормализует AI 01/21 и сохраняет AI 91/92 в полных кодах без потери разделителей FNC1.",
    preview: "parse" as const,
    icon: "route" as const,
  },
  {
    step: "03",
    title: "Печать дубля",
    text: "Готовый дубль уходит на принтер по вашему шаблону. Оператор видит статус и историю операций.",
    preview: "print" as const,
    icon: "monitor" as const,
  },
];

/** Реальные отзывы пока не собраны — на сайте показывается empty-state. */
export const TESTIMONIALS: Array<{
  quote: string;
  name: string;
  role: string;
  company?: string;
  image?: string;
}> = [];

export const FAQ = [
  {
    question: "Какие сканеры поддерживаются?",
    answer:
      "COM и HID сканеры, а также загрузка фото DataMatrix. Совместимость зависит от модели: проверяйте на вашем оборудовании.",
  },
  {
    question: "Нужен ли интернет для печати?",
    answer:
      "Для работы приложения интернет не обязателен. Аккаунт и подписка оформляются на сайте doublemark.ru.",
  },
  {
    question: "Чем полный код отличается от короткого?",
    answer:
      "Короткий код содержит базовые AI, полный включает криптографические блоки AI 91/92. DoubleMark сохраняет разделители GS1/FNC1.",
  },
  {
    question: "Есть ли пробный период?",
    answer:
      "Да, при первой подписке доступен бесплатный период. Подробности на странице тарифов.",
  },
];

export const TRUST_SIGNALS = [
  { label: "Платформа", value: "Windows 10/11, .NET 8" },
  { label: "Сканеры", value: "COM, HID, фото DataMatrix" },
  { label: "Аккаунт", value: "Регистрация на doublemark.ru" },
  { label: "Обновления", value: "Автопроверка через update.json" },
];

export const PRODUCT_NOTES = [
  "Сейчас доступно Windows-приложение (.NET 8, WPF).",
  "Мобильное приложение для печати без 2D-сканера в roadmap.",
  "Совместимость зависит от модели сканера и принтера: проверяйте на вашем оборудовании.",
];

/** @deprecated Use versions from public/updates/versions.json via appVersions.ts */
export const DESKTOP_RELEASE = {
  version: "3.0.0",
  downloadUrl: "/downloads/DoubleMarkSetup-3.0.0.exe",
  changelog: "См. public/updates/versions.json",
};
