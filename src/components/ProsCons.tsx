import { STATUTS_INFO } from "../data/prosCons";
import type { StatutId } from "../lib/engine";
import { Card } from "./ui";
import { STATUT_COLORS } from "./Results";

// `statuts` restreint les fiches aux statuts dont la page parle réellement.
// Sans ce filtre, les six fiches (~700 mots strictement identiques) étaient
// recopiées sur 60 URL : c'était le premier bloc de contenu dupliqué du site,
// et il diluait le sujet de chaque page. Le CDI reste affiché dès qu'un statut
// indépendant est mis en avant : c'est le terme de comparaison de tout le site.
export function ProsCons({ statuts }: { statuts?: StatutId[] } = {}) {
  const focus = statuts?.length
    ? new Set<StatutId>([...statuts, "cdi"])
    : null;
  const fiches = focus
    ? STATUTS_INFO.filter((s) => focus.has(s.id))
    : STATUTS_INFO;
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {fiches.map((s, i) => (
        <Card key={s.id} className="anim-up" lift>
          <div
            className="border-b-[3px] border-ink px-4 py-2"
            style={{
              backgroundColor: STATUT_COLORS[s.id],
              color: s.id === "micro" ? "#0d0d0d" : "#fff",
              animationDelay: `${(i * 50) / 1000}s`,
            }}
            suppressHydrationWarning
          >
            <span className="text-sm font-extrabold uppercase tracking-[0.06em]">
              {s.titre}
            </span>
          </div>
          <div className="space-y-3 px-4 py-3 text-sm">
            <p className="text-xs font-bold opacity-70">{s.resume}</p>
            <div>
              <div className="mb-1 inline-block border-2 border-ink bg-tag-green px-2 text-xs font-extrabold uppercase text-white">
                + Avantages
              </div>
              <ul className="space-y-1">
                {s.avantages.map((a) => (
                  <li key={a} className="flex gap-2 text-xs">
                    <span className="font-extrabold text-tag-green">▸</span>
                    {a}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="mb-1 inline-block border-2 border-ink bg-tag-red px-2 text-xs font-extrabold uppercase text-white">
                − Inconvénients
              </div>
              <ul className="space-y-1">
                {s.inconvenients.map((a) => (
                  <li key={a} className="flex gap-2 text-xs">
                    <span className="font-extrabold text-tag-red">▸</span>
                    {a}
                  </li>
                ))}
              </ul>
            </div>
            <div className="border-2 border-ink bg-tag-offwhite px-3 py-2 text-xs font-bold">
              {`→ ${s.pourQui}`}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
