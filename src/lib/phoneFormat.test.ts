import { describe, expect, it } from "vitest";
import {
  extractPhoneDigits,
  formatPhoneInput,
  normalizePhoneE164,
} from "./phoneFormat";

describe("phoneFormat", () => {
  it("replaces leading 8 with 7", () => {
    expect(extractPhoneDigits("89991234567")).toBe("79991234567");
    expect(formatPhoneInput("8")).toBe("+7");
    expect(formatPhoneInput("89991234567")).toBe("+7(999)123-45-67");
  });

  it("formats while typing", () => {
    expect(formatPhoneInput("7")).toBe("+7");
    expect(formatPhoneInput("79")).toBe("+7(9");
    expect(formatPhoneInput("7999")).toBe("+7(999)");
    expect(formatPhoneInput("7999123")).toBe("+7(999)123");
    expect(formatPhoneInput("799912345")).toBe("+7(999)123-45");
    expect(formatPhoneInput("79991234567")).toBe("+7(999)123-45-67");
  });

  it("prepends 7 for local numbers starting with 9", () => {
    expect(formatPhoneInput("9991234567")).toBe("+7(999)123-45-67");
  });

  it("normalizes to E.164", () => {
    expect(normalizePhoneE164("+7(999)123-45-67")).toBe("+79991234567");
    expect(normalizePhoneE164("")).toBe("");
  });
});
