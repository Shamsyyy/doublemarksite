import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { AuthProvider } from "../context/AuthContext";
import { HomePage } from "./HomePage";

describe("HomePage", () => {
  it("renders hero and required sections", () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <HomePage />
        </AuthProvider>
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("heading", {
        name: /дублирование кодов маркировки/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /почему выбирают doublemark/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /три шага до печати дубля/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /готовы ускорить маркировку/i })).toBeInTheDocument();
  });
});
