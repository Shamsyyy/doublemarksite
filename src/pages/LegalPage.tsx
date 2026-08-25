import { LEGAL_PAGES } from "../content/legal";
import { RequisitesView } from "../components/RequisitesView";
import { BrandLogo } from "../components/BrandLogo";
import { PrivacyPage } from "./PrivacyPage";
import { CookiePolicyPage } from "./CookiePolicyPage";

type LegalSlug = "privacy" | "terms" | "cookies" | "requisites";

export function LegalPage({ slug }: { slug: LegalSlug }) {
  if (slug === "requisites") {
    return <RequisitesView />;
  }
  if (slug === "privacy") {
    return <PrivacyPage />;
  }
  if (slug === "cookies") {
    return <CookiePolicyPage />;
  }

  const page = LEGAL_PAGES.terms;

  return (
    <article className="section legal">
      <div className="section-header">
        <BrandLogo size={44} withText={false} />
        <h1>{page.title}</h1>
      </div>
      {page.sections.map((section) => (
        <section key={section.heading}>
          <h2>{section.heading}</h2>
          <p style={{ whiteSpace: "pre-line" }}>{section.body}</p>
        </section>
      ))}
    </article>
  );
}
