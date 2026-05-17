import { Link, Outlet, useLocation } from "react-router-dom";
import { useRef, useEffect, useState } from "react";
import { useAuth } from "../context/useAuth";
import { COMPANY } from "../content/site";
import { CookieBanner } from "./CookieBanner";
import { NavHashLink } from "./NavHashLink";
import { ScrollToHash } from "./ScrollToHash";
import { BrandLogo } from "./BrandLogo";

export function SiteLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const headerRef = useRef<HTMLElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  // Sticky header scroll shadow
  useEffect(() => {
    const handler = () => {
      headerRef.current?.classList.toggle('header-scrolled', window.scrollY > 10);
    };
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // Scroll animation — re-runs on every route change so new page elements are observed
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: '0px 0px -30px 0px' }
    );
    const timer = setTimeout(() => {
      document.querySelectorAll('.fade-in-up:not(.is-visible)').forEach((el) => observer.observe(el));
    }, 50);
    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [location.pathname]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="site">
      <ScrollToHash />
      <header ref={headerRef} className="header">
        <Link to="/" className="logo" onClick={closeMenu}>
          <BrandLogo size={28} withText />
        </Link>

        <button
          type="button"
          className="nav-hamburger"
          aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(v => !v)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav className={`nav${menuOpen ? ' nav-open' : ''}`} aria-label="Основная навигация">
          <NavHashLink to="/#benefits" onClick={closeMenu}>Преимущества</NavHashLink>
          <NavHashLink to="/#how" onClick={closeMenu}>Как работает</NavHashLink>
          <Link to="/pricing" onClick={closeMenu}>Тарифы</Link>
          <Link to="/contacts" onClick={closeMenu}>Контакты</Link>
          {user ? (
            <>
              <Link to="/account" onClick={closeMenu}>Кабинет</Link>
              <Link to="/download" onClick={closeMenu}>Скачать</Link>
              {user.role === "admin" && (
                <Link to="/admin" onClick={closeMenu}>Админ</Link>
              )}
              <button type="button" className="btn-link" onClick={() => { logout(); closeMenu(); }}>
                Выйти
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={closeMenu}>Вход</Link>
              <Link to="/register" className="btn btn-primary btn-small" onClick={closeMenu}>
                Регистрация
              </Link>
            </>
          )}
        </nav>
      </header>

      <div
        className={`nav-overlay${menuOpen ? ' nav-open' : ''}`}
        onClick={closeMenu}
        aria-hidden="true"
      />

      <main className="main">
        <Outlet />
      </main>

      <footer className="footer">
        <div className="footer-cols">
          <div className="footer-brand">
            <Link to="/" className="logo">
              <BrandLogo size={28} withText />
            </Link>
            <p>
              Windows-приложение для дублирования кодов<br />
              маркировки Честного Знака для малого бизнеса.
            </p>
            <p style={{ fontSize: '0.8rem', marginTop: '0.75rem' }}>
              <span className="muted">ИНН {COMPANY.inn}</span>
            </p>
          </div>

          <div className="footer-col">
            <h4>Навигация</h4>
            <nav className="footer-nav" aria-label="Навигация футера">
              <NavHashLink to="/">Главная</NavHashLink>
              <NavHashLink to="/#benefits">Преимущества</NavHashLink>
              <NavHashLink to="/#how">Как работает</NavHashLink>
              <Link to="/pricing">Тарифы</Link>
              <Link to="/contacts">Контакты</Link>
            </nav>
          </div>

          <div className="footer-col">
            <h4>Документы</h4>
            <nav className="footer-nav" aria-label="Юридические ссылки">
              <Link to="/legal/privacy">Конфиденциальность</Link>
              <Link to="/legal/terms">Оферта</Link>
              <Link to="/legal/cookies">Cookie</Link>
              <Link to="/legal/requisites">Реквизиты</Link>
            </nav>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} {COMPANY.legalName}</span>
          <span className="muted" style={{ fontSize: '0.75rem' }}>
            Личный кабинет работает через Supabase
          </span>
          <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>
        </div>
      </footer>

      <CookieBanner />
    </div>
  );
}
