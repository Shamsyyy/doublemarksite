import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { COMPANY } from "../content/site";
import { CookieBanner } from "./CookieBanner";
import { NavHashLink } from "./NavHashLink";
import { ScrollToHash } from "./ScrollToHash";

export function SiteLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="site">
      <ScrollToHash />
      <header className="header">
        <Link to="/" className="logo">
          {COMPANY.name}
        </Link>
        <nav className="nav" aria-label="Основная навигация">
          <NavHashLink to="/#benefits">Преимущества</NavHashLink>
          <NavHashLink to="/#how">Как работает</NavHashLink>
          <Link to="/pricing">Тарифы</Link>
          <Link to="/contacts">Контакты</Link>
          {user ? (
            <>
              <Link to="/account">Кабинет</Link>
              <Link to="/download">Скачать</Link>
              <button type="button" className="btn-link" onClick={logout}>
                Выйти
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Вход</Link>
              <Link to="/register" className="btn btn-primary btn-small">
                Регистрация
              </Link>
            </>
          )}
        </nav>
      </header>

      <main className="main">
        <Outlet />
      </main>

      <footer className="footer">
        <div>
          <strong>{COMPANY.name}</strong>
          <p>ИНН {COMPANY.inn} · {COMPANY.email}</p>
          <p className="muted">
            MVP-демо: вход, оплата и лицензии работают только в браузере (localStorage).
            Это не продакшен-уровень безопасности и не замена серверной авторизации.
          </p>
        </div>
        <nav className="footer-nav" aria-label="Юридические ссылки">
          <Link to="/legal/privacy">Конфиденциальность</Link>
          <Link to="/legal/terms">Оферта</Link>
          <Link to="/legal/cookies">Cookie</Link>
          <Link to="/legal/requisites">Реквизиты</Link>
        </nav>
      </footer>

      <CookieBanner />
    </div>
  );
}
