import type { MouseEvent, ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";

type NavHashLinkProps = {
  to: string;
  children: ReactNode;
  onClick?: () => void;
  className?: string;
};

function isHashLinkActive(pathname: string, hash: string, locationHash: string): boolean {
  if (hash) {
    return pathname === "/" && locationHash === `#${hash}`;
  }
  return pathname === "/" && !locationHash;
}

export function NavHashLink({ to, children, onClick: onNavigate, className }: NavHashLinkProps) {
  const location = useLocation();
  const hashIndex = to.indexOf("#");
  const hash = hashIndex >= 0 ? to.slice(hashIndex + 1) : "";
  const pathPart = hashIndex >= 0 ? to.slice(0, hashIndex) || "/" : to;
  const isActive = isHashLinkActive(location.pathname, hash, location.hash);

  function onClick(event: MouseEvent<HTMLAnchorElement>) {
    if (location.pathname !== "/" || !hash) {
      onNavigate?.();
      return;
    }
    event.preventDefault();
    const target = document.getElementById(hash);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      window.history.pushState(null, "", `/#${hash}`);
      onNavigate?.();
    }
  }

  const classes = [className, isActive ? "is-active" : ""].filter(Boolean).join(" ");

  return (
    <Link
      to={to}
      onClick={onClick}
      className={classes || undefined}
      aria-current={isActive && pathPart === location.pathname ? "page" : undefined}
    >
      {children}
    </Link>
  );
}
