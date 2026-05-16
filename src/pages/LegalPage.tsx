import { LEGAL_PAGES } from "../content/legal";
import { RequisitesView } from "../components/RequisitesView";

type LegalSlug = keyof typeof LEGAL_PAGES;

export function LegalPage({ slug }: { slug: LegalSlug }) {
  if (slug === "requisites") {
    return <RequisitesView />;
  }

  const page = LEGAL_PAGES[slug];

  return (
    <article className="section legal">
      <h1>{page.title}</h1>
      {page.sections.map((section) => (
        <section key={section.heading}>
          <h2>{section.heading}</h2>
          <p style={{ whiteSpace: "pre-line" }}>{section.body}</p>
        </section>
      ))}
    </article>
  );
}
