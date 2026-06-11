import { STATUTS_INFO } from "../data/prosCons";
import { Card } from "./ui";
import { STATUT_COLORS } from "./Results";

export function ProsCons() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {STATUTS_INFO.map((s, i) => (
        <Card key={s.id} className="anim-up" lift>
          <div
            className="border-b-[3px] border-ink px-4 py-2"
            style={{
              background: STATUT_COLORS[s.id],
              color: s.id === "micro" ? "#0d0d0d" : "#fff",
              animationDelay: `${i * 0.05}s`,
            }}
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
              → {s.pourQui}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
