import { Link, useNavigate } from "react-router-dom";
import { BrandLogo } from "../components/BrandLogo";

export function AuthCallbackPage() {
  const navigate = useNavigate();

  return (
    <section className="section narrow">
      <BrandLogo size={44} withText={false} />
      <h1>Подтверждение входа</h1>
      <article className="card">
        <p>
          Сайт больше не использует сторонний сервис подтверждения email по ссылке.
          Регистрация создаёт аккаунт сразу. Войдите с email и паролем.
        </p>
        <button type="button" className="btn btn-primary" onClick={() => navigate("/login")}>
          Перейти ко входу
        </button>
        <p>
          <Link to="/login">Страница входа</Link>
        </p>
      </article>
    </section>
  );
}
