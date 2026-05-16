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
    expect(screen.getByRole("heading", { name: /преимущества/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /как это работает/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /контакты/i })).toBeInTheDocument();
  });
});
