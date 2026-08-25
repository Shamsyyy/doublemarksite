/** Extract up to 11 digits; leading 8 (RU trunk prefix) becomes 7. */
export function extractPhoneDigits(raw: string): string {
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("8")) {
    digits = `7${digits.slice(1)}`;
  }
  return digits.slice(0, 11);
}

/** Live mask: +A(BBB)CCC-CC-CC (e.g. +7(999)123-45-67). */
export function formatPhoneInput(raw: string): string {
  let digits = extractPhoneDigits(raw);
  if (!digits) {
    return "";
  }

  if (!digits.startsWith("7") && digits.startsWith("9")) {
    digits = `7${digits}`;
  }
  digits = digits.slice(0, 11);

  let formatted = `+${digits[0] ?? ""}`;
  if (digits.length > 1) {
    formatted += `(${digits.slice(1, 4)}`;
  }
  if (digits.length >= 4) {
    formatted += ")";
  }
  if (digits.length > 4) {
    formatted += digits.slice(4, 7);
  }
  if (digits.length > 7) {
    formatted += `-${digits.slice(7, 9)}`;
  }
  if (digits.length > 9) {
    formatted += `-${digits.slice(9, 11)}`;
  }
  return formatted;
}

/** E.164 for API, e.g. +79991234567. Empty string when no digits. */
export function normalizePhoneE164(raw: string): string {
  const digits = extractPhoneDigits(raw);
  return digits ? `+${digits}` : "";
}
