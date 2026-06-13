import { useState } from "react";
import { FAQ, type FaqItem } from "../data/faq";

// JSON-LD généré depuis les mêmes données que l'affichage : toujours synchrone.
// items + canonicalUrl varient selon la page (home ou page statut).
export function Faq({
  items = FAQ,
  canonicalUrl = "https://freelance-ou-cdi.fr/",
}: {
  items?: FaqItem[];
  canonicalUrl?: string;
} = {}) {
  const [open, setOpen] = useState<number | null>(0);
  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${canonicalUrl}#faq`,
    inLanguage: "fr-FR",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  });
  return (
    <div className="space-y-3">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />
      {items.map((item, i) => {
        const expanded = open === i;
        const id = `faq-${i}`;
        return (
          <article
            key={item.question}
            className="border-[3px] border-ink bg-white shadow-brutal-sm"
          >
            <h3>
              <button
                type="button"
                aria-expanded={expanded}
                aria-controls={id}
                onClick={() => setOpen(expanded ? null : i)}
                className="brutal-press flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-extrabold uppercase tracking-tight"
              >
                <span>{item.question}</span>
                <span
                  aria-hidden="true"
                  className="shrink-0 border-2 border-ink bg-tag-yellow px-2 text-xs"
                >
                  {expanded ? "−" : "+"}
                </span>
              </button>
            </h3>
            <div
              id={id}
              hidden={!expanded}
              className="border-t-2 border-ink px-4 py-3 text-sm font-bold leading-relaxed"
            >
              {item.answer}
            </div>
          </article>
        );
      })}
    </div>
  );
}
