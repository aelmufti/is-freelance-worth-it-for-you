import { useState } from "react";
import { FAQ } from "../data/faq";

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="space-y-3">
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
