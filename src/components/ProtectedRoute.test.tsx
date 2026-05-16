import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { AuthProvider } from "../context/AuthContext";
import { ProtectedRoute } from "./ProtectedRoute";

function LoginStateProbe() {
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from;
  return <div data-testid="login-from">{from ?? ""}</div>;
}

describe("ProtectedRoute", () => {
  it("redirects unauthenticated users to /login with state.from preserved", () => {
    render(
      <MemoryRouter initialEntries={["/account"]}>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginStateProbe />} />
            <Route
              path="/account"
              element={
                <ProtectedRoute>
                  <div>Protected content</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </MemoryRouter>,
    );

    expect(screen.queryByText("Protected content")).not.toBeInTheDocument();
    expect(screen.getByTestId("login-from")).toHaveTextContent("/account");
  });

  it("preserves path, search and hash in redirect state", () => {
    render(
      <MemoryRouter initialEntries={["/account?tab=billing#section2"]}>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginStateProbe />} />
            <Route
              path="/account"
              element={
                <ProtectedRoute>
                  <div>Protected content</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </MemoryRouter>,
    );

    const loginFromNodes = screen.getAllByTestId("login-from");
    const latestLoginFrom = loginFromNodes[loginFromNodes.length - 1];
    expect(latestLoginFrom).toHaveTextContent("/account?tab=billing#section2");
  });
});
