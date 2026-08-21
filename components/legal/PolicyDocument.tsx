import Link from "next/link";
import { BackArrowIcon } from "@/components/ui/Icons";
import type { LegalPolicy } from "@/lib/content/legal";
import { routes } from "@/lib/site";

type PolicyDocumentProps = {
  policy: LegalPolicy;
};

export function PolicyDocument({ policy }: PolicyDocumentProps) {
  return (
    <main className="policy-page">
      <div className="legal-container">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link href={routes.home}>Home</Link>
          <span aria-hidden="true">/</span>
          <Link href={routes.legal}>Legal Center</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{policy.title}</span>
        </nav>
        <header className="policy-heading">
          <p className="eyebrow">
            <span className="eyebrow-line" />
            Nibrexo / Legal
          </p>
          <h1>{policy.title}</h1>
          <p>{policy.version}</p>
        </header>
        <article className="policy-body">
          <p className="policy-lead">{policy.lead}</p>
          {policy.sections.map((section) => (
            <section className="policy-section" key={section.heading}>
              <h2>{section.heading}</h2>
              {section.paragraphs?.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {section.lists?.map((list) => (
                <div key={`${section.heading}-${list.intro ?? list.items[0]}`}>
                  {list.intro ? <p className={list.introClass}>{list.intro}</p> : null}
                  <ul>
                    {list.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </section>
          ))}
          <Link className="policy-back" href={routes.legal}>
            <BackArrowIcon />
            Back to Legal Center
          </Link>
        </article>
      </div>
    </main>
  );
}
