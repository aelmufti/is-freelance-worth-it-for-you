import { useState } from "react";
import { FAQ } from "../data/faq";

// JSON-LD généré depuis les mêmes données que l'affichage : toujours synchrone.
const FAQ_JSON_LD = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "@id": "https://freelance-ou-cdi.fr/#faq",
  inLanguage: "fr-FR",
  mainEntity: FAQ.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: { "@type": "Answer", text: item.answer },
  })),
});

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="space-y-3">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: FAQ_JSON_LD }}
      />
      {FAQ.map((item, i) => {
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
