import { describe, expect, it } from "vitest";
import { isValidEmail, isValidInn, validateRegistration } from "./validation";

describe("validation", () => {
  it("accepts valid email", () => {
    expect(isValidEmail("owner@example.com")).toBe(true);
  });

  it("rejects invalid email", () => {
    expect(isValidEmail("not-an-email")).toBe(false);
  });

  it("accepts 10 or 12 digit INN", () => {
    expect(isValidInn("7707083893")).toBe(true);
    expect(isValidInn("770708389301")).toBe(true);
  });

  it("rejects invalid INN", () => {
    expect(isValidInn("123")).toBe(false);
  });

  it("requires password length and consent on registration", () => {
    const result = validateRegistration({
      email: "owner@example.com",
      password: "short",
      companyName: "ООО Пример",
      inn: "7707083893",
      phone: "",
      consent: false,
      acceptOffer: false,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors).toContain("password");
      expect(result.errors).toContain("consent");
      expect(result.errors).toContain("acceptOffer");
    }
  });

  it("rejects mismatched password confirmation", () => {
    const result = validateRegistration({
      email: "owner@example.com",
      password: "longenough",
      passwordConfirm: "different",
      companyName: "ООО Пример",
      inn: "",
      phone: "",
      consent: true,
      acceptOffer: true,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors).toContain("passwordConfirm");
    }
  });
});
