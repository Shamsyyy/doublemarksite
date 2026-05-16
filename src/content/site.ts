export const COMPANY = {
  name: "DubliMark",
  legalName: "ИП REMOVED_SECRET",
  inn: "REMOVED_SECRET",
  ogrnip: "REMOVED_SECRET",
  registrationDate: "REMOVED_SECRET",
  email: "REMOVED_SECRET",
  phone: "REMOVED_SECRET",
  address: "REMOVED_SECRET",
};

export const HERO = {
  title: "Дублирование кодов маркировки Честного Знака за секунды",
  subtitle:
    "Сканируйте существующий DataMatrix сканером или телефоном — Windows-приложение DubliMark подготовит дубль и отправит на печать.",
  primaryCta: "Попробовать",
  secondaryCta: "Тарифы",
};

export const BENEFITS = [
  {
    title: "Скорость на линии",
    text: "Оператор сканирует код и сразу получает печать — меньше простоя и ручных действий.",
  },
  {
    title: "Понятный сценарий",
    text: "Один рабочий процесс: сканирование → разбор GS1 → печать дубля.",
  },
  {
    title: "Windows для склада",
    text: "Настольное приложение рядом с принтером: COM, HID и загрузка фото кода.",
  },
  {
    title: "Честные ограничения",
    text: "Сайт объясняет разницу коротких и полных кодов, настройку GS/FNC1 и риски HID-обрезки.",
  },
];

export const HOW_IT_WORKS = [
  {
    step: "1",
    title: "Сканирование",
    text: "Считайте код маркировки сканером (COM/HID) или загрузите фото DataMatrix.",
  },
  {
    step: "2",
    title: "Разбор GS1",
    text: "DubliMark нормализует поля AI 01/21 и при полном коде — AI 91/92.",
  },
  {
    step: "3",
    title: "Печать дубля",
    text: "Подготовленный дубль отправляется на принтер по вашему сценарию печати.",
  },
];

export const PRODUCT_NOTES = [
  "Сейчас доступно Windows-приложение (.NET 8, WPF).",
  "Мобильное приложение для печати без 2D-сканера — в roadmap.",
  "Совместимость зависит от модели сканера и принтера.",
];

export const DESKTOP_RELEASE = {
  version: "0.1.0-mvp",
  downloadUrl: "#download-windows",
  changelog: "Первая публичная сборка: чтение ЧЗ, HID/COM, загрузка изображения.",
};