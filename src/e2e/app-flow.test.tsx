import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { App } from "../App";

describe("app end-to-end flow", () => {
  it("supports register -> checkout -> account -> download", async () => {
    const user = userEvent.setup();

    render(<App />);

    await user.click(screen.getByRole("link", { name: "Регистрация" }));
    await user.type(screen.getByLabelText("Email"), "flow@example.com");
    await user.type(screen.getByLabelText("Пароль (мин. 8 символов)"), "secure-pass-123");
    await user.type(screen.getByLabelText("Организация"), "ООО Флоу");
    await user.type(screen.getByLabelText("ИНН (10 или 12 цифр, необязательно)"), "7707083893");
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: "Создать аккаунт" }));

    expect(await screen.findByRole("heading", { name: "Личный кабинет" })).toBeInTheDocument();

    await user.click(screen.getAllByRole("link", { name: "Тарифы" })[0]);
    expect(await screen.findByRole("heading", { name: "Тарифы" })).toBeInTheDocument();

    const checkoutLinks = screen.getAllByRole("link", { name: "Оформить" });
    await user.click(checkoutLinks[0]);
    expect(await screen.findByRole("heading", { name: "Оплата (sandbox)" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Оплатить успешно" }));

    expect(
      await screen.findByRole("heading", { name: "Личный кабинет" }, { timeout: 3000 }),
    ).toBeInTheDocument();

    await user.click(await screen.findByRole("link", { name: "Скачать приложение" }));
    expect(
      await screen.findByRole("heading", { name: "Скачать DoubleMark для Windows" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Скачать установщик" }),
    ).toBeInTheDocument();
  }, 15000);
});
