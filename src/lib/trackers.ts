import type { CookieConsent } from "./consent";

/**
 * Реестр необязательных сторонних модулей.
 * Сейчас пуст: аналитика и реклама не подключены.
 * Ничего не загружается до согласия и не загружается после него,
 * пока сюда не будет добавлен реальный модуль.
 */
export const OPTIONAL_TRACKERS: readonly {
  id: string;
  category: "analytics" | "functional" | "marketing";
}[] = [];

export function loadAllowedTrackers(consent: CookieConsent | null): string[] {
  if (!consent) {
    return [];
  }
  return OPTIONAL_TRACKERS.filter((tracker) => consent[tracker.category]).map(
    (tracker) => tracker.id,
  );
}
