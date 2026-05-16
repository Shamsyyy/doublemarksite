import type { MouseEvent, ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";

type NavHashLinkProps = {
  to: string;
  children: ReactNode;
};

export function NavHashLink({ to, children }: NavHashLinkProps) {
  const location = useLocation();
  const hashIndex = to.indexOf("#");
  const hash = hashIndex >= 0 ? to.slice(hashIndex + 1) : "";

  function onClick(event: MouseEvent<HTMLAnchorElement>) {
    if (location.pathname !== "/" || !hash) {
      return;
    }
    event.preventDefault();
    const target = document.getElementById(hash);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      window.history.pushState(null, "", `/#${hash}`);
    }
  }

  return (
    <Link to={to} onClick={onClick}>
      {children}
    </Link>
  );
}
