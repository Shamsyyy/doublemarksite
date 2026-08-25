import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useRef, useEffect, useState } from "react";
import { useAuth } from "../context/useAuth";
import { COMPANY } from "../content/site";
import { CookieBanner, openCookieSettings } from "./CookieBanner";
import { LEGAL_PATHS } from "../config/legal";
import { NavHashLink } from "./NavHashLink";
import { ScrollToHash } from "./ScrollToHash";
import { BrandLogo } from "./BrandLogo";

function navLinkClass({ isActive }: { isActive: boolean }) {
  return isActive ? "is-active" : undefined;
}

function isHomePath(pathname: string): boolean {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  return normalized === "/";
}

export function SiteLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const headerRef = useRef<HTMLElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [heroHeaderVisible, setHeroHeaderVisible] = useState(true);
  const isHome = isHomePath(location.pathname);
  const normalizedPath = location.pathname.replace(/\/+$/, "") || "/";
  const isAdmin = normalizedPath === "/admin" || normalizedPath.endsWith("/admin");

  useEffect(() => {
    const handler = () => {
      headerRef.current?.classList.toggle("header-scrolled", window.scrollY > 10);
    };
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    if (!isHome) {
      setHeroHeaderVisible(true);
      return;
    }

    let raf = 0;

    const updateHeroHeader = () => {
      const hero = document.querySelector(".cos-hero-stage");
      if (!hero) {
        setHeroHeaderVisible(true);
        return;
      }

      const heroBottom = hero.getBoundingClientRect().bottom;
      setHeroHeaderVisible(heroBottom > 120);
    };

    const onScrollOrResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(updateHeroHeader);
    };

    const timer = window.setTimeout(updateHeroHeader, 0);

    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize, { passive: true });

    return () => {
      window.clearTimeout(timer);
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [isHome, location.pathname]);

  useEffect(() => {
    if (!heroHeaderVisible && menuOpen) {
      setMenuOpen(false);
    }
  }, [heroHeaderVisible, menuOpen]);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      document.querySelectorAll(".fade-in-up").forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: "0px 0px -30px 0px" },
    );
    const timer = setTimeout(() => {
      document.querySelectorAll(".fade-in-up:not(.is-visible)").forEach((el) => observer.observe(el));
    }, 50);
    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [location.pathname]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className={`site${isHome ? " site-home" : ""}${isHome && !heroHeaderVisible ? " site-past-hero" : ""}${isAdmin ? " site-admin" : ""}`}>
      <a href="#main-content" className="skip-link">
        Перейти к содержимому
      </a>
      <ScrollToHash />

      <header
        ref={headerRef}
        className={`header header-floating${isHome && !heroHeaderVisible ? " header-hidden" : ""}`}
      >
        <Link to="/" className="logo" onClick={closeMenu}>
          <BrandLogo size={28} withText />
        </Link>

        <button
          type="button"
          className="nav-hamburger"
          aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav className={`nav${menuOpen ? " nav-open" : ""}`} aria-label="Основная навигация">
          <div className="nav-links">
            <NavHashLink to="/#how" onClick={closeMenu}>Как работает</NavHashLink>
            <NavHashLink to="/#benefits" onClick={closeMenu}>Возможности</NavHashLink>
            <NavLink to="/pricing" onClick={closeMenu}>Тарифы</NavLink>
            <NavLink to="/contacts" onClick={closeMenu}>Контакты</NavLink>
          </div>
          <span className="nav-divider" aria-hidden="true" />
          <div className="nav-actions">
            {user ? (
              <>
                <NavLink to="/account" onClick={closeMenu}>Кабинет</NavLink>
                {user.role === "admin" && (
                  <NavLink to="/admin" onClick={closeMenu}>Админ</NavLink>
                )}
                <button type="button" className="nav-text-btn" onClick={() => { logout(); closeMenu(); }}>
                  Выйти
                </button>
                <Link to="/download" className="nav-cta" onClick={closeMenu}>
                  Скачать
                </Link>
              </>
            ) : (
              <>
                <NavLink to="/login" onClick={closeMenu}>Вход</NavLink>
                <Link to="/register" className="nav-cta" onClick={closeMenu}>
                  Регистрация
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      <div
        className={`nav-overlay${menuOpen ? " nav-open" : ""}`}
        onClick={closeMenu}
        aria-hidden="true"
      />

      <main id="main-content" className={`main${isHome || isAdmin ? " main-wide" : " main-contained"}`}>
        <Outlet />
      </main>

      {!isAdmin ? (
      <footer className="footer footer-modern">
        <div className="footer-cols">
          <div className="footer-brand">
            <Link to="/" className="logo">
              <BrandLogo size={28} withText />
            </Link>
            <p>
              Windows-утилита для дублирования кодов маркировки Честного Знака
              для склада, линии и малого производства.
            </p>
          </div>

          <div className="footer-col">
            <h4>Продукт</h4>
            <nav className="footer-nav" aria-label="Навигация продукта">
              <NavHashLink to="/#how">Как работает</NavHashLink>
              <NavHashLink to="/#benefits">Возможности</NavHashLink>
              <NavLink to="/pricing" className={navLinkClass}>Тарифы</NavLink>
              <NavLink to="/download" className={navLinkClass}>Скачать</NavLink>
              <NavLink to="/contacts" className={navLinkClass}>Контакты</NavLink>
            </nav>
          </div>

          <div className="footer-col">
            <h4>Документы</h4>
            <nav className="footer-nav" aria-label="Юридические документы">
              <NavLink to={LEGAL_PATHS.privacy} className={navLinkClass}>
                Политика обработки персональных данных
              </NavLink>
              <NavLink to={LEGAL_PATHS.cookies} className={navLinkClass}>
                Политика использования cookie
              </NavLink>
              <button type="button" className="footer-text-btn" onClick={() => openCookieSettings()}>
                Настройки cookie
              </button>
              <NavLink to={LEGAL_PATHS.personalDataConsent} className={navLinkClass}>
                Согласие на обработку персональных данных
              </NavLink>
              <NavLink to={LEGAL_PATHS.terms} className={navLinkClass}>Оферта</NavLink>
              <NavLink to={LEGAL_PATHS.requisites} className={navLinkClass}>Реквизиты</NavLink>
            </nav>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} {COMPANY.name}</span>
          {COMPANY.email ? (
            <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>
          ) : null}
        </div>
      </footer>
      ) : null}

      <CookieBanner />
    </div>
  );
}
