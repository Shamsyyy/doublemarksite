import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import type { ReactNode } from "react";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  if (isLoading) {
    return <p className="muted" style={{ padding: "2rem", textAlign: "center" }}>Загрузка...</p>;
  }
  if (!user) {
    const from = `${location.pathname}${location.search}${location.hash}`;
    return <Navigate to="/login" replace state={{ from }} />;
  }
  return children;
}
