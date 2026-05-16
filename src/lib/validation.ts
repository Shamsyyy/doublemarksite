export type RegistrationInput = {
  email: string;
  password: string;
  companyName: string;
  inn: string;
  phone: string;
  consent: boolean;
};

export type ValidationResult =
  | { ok: true }
  | { ok: false; errors: string[] };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email.trim());
}

export function isValidInn(inn: string): boolean {
  const digits = inn.replace(/\s/g, "");
  if (!digits) {
    return true;
  }
  return /^\d{10}$/.test(digits) || /^\d{12}$/.test(digits);
}

export function isValidPassword(password: string): boolean {
  return password.length >= 8;
}

export function validateRegistration(input: RegistrationInput): ValidationResult {
  const errors: string[] = [];
  if (!isValidEmail(input.email)) {
    errors.push("email");
  }
  if (!isValidPassword(input.password)) {
    errors.push("password");
  }
  if (!input.companyName.trim()) {
    errors.push("companyName");
  }
  if (!isValidInn(input.inn)) {
    errors.push("inn");
  }
  if (!input.consent) {
    errors.push("consent");
  }
  return errors.length ? { ok: false, errors } : { ok: true };
}

export function validateLogin(input: {
  email: string;
  password: string;
}): ValidationResult {
  const errors: string[] = [];
  if (!isValidEmail(input.email)) {
    errors.push("email");
  }
  if (!input.password) {
    errors.push("password");
  }
  return errors.length ? { ok: false, errors } : { ok: true };
}
