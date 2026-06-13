import {
  BREAKEVEN_ROWS,
  BREAKEVEN_REF,
  BREAKEVEN_SCENARIO,
} from "../data/breakeven";
import { euro } from "./ui";

const COLS = [
  { key: "micro", label: "Micro (BNC)" },
  { key: "eiEurl", label: "EI / EURL" },
  { key: "sasu", label: "SASU" },
  { key: "portage", label: "Portage" },
] as const;

const tjm = (v: number | null) => (v === null ? "—" : `${String(v)} €`);

export function BreakEvenTable() {
  const ref = BREAKEVEN_REF;
  const { joursParMois, moisFactures, fraisPro } = BREAKEVEN_SCENARIO;

  // Chaque bloc de texte est construit en UNE seule chaîne (donc un seul nœud
  // texte). Mélanger {expr} et texte littéral crée des nœuds adjacents qui se
  // sérialisent avec des &nbsp; aux frontières et cassent l'hydration (#418).
  const lede =
    `Le TJM à partir duquel un freelance égale le revenu net d'un CDI dépend du salaire de référence et du statut. ` +
    `Face à un CDI cadre de 55 000 € brut (${euro(ref.netCdiMensuel)}/mois net après impôt), il faut facturer environ ` +
    `${tjm(ref.micro)}/jour en micro-entreprise, ${tjm(ref.eiEurl)} en EI ou EURL, ${tjm(ref.sasu)} en SASU et ` +
    `${tjm(ref.portage)} en portage salarial — à ${String(joursParMois)} jours facturés par mois sur ${String(moisFactures)} mois, ` +
    `${euro(fraisPro)} de frais professionnels, célibataire sans enfant. ` +
    `Seuils calculés au taux 2026 par ce simulateur (moteur validé contre le calculateur officiel URSSAF).`;

  const notes =
    `Hypothèses : ${String(joursParMois)} jours facturés/mois × ${String(moisFactures)} mois, ${euro(fraisPro)} de frais pro/an, ` +
    `micro en BNC (abattement 34 %), hors ACRE et versement libératoire. ` +
    `« — » = plafond de la micro-entreprise dépassé (CA > 83 600 €). ` +
    `EI au réel et EURL donnent le même seuil tant que toute l'enveloppe est versée en rémunération ; ` +
    `l'EURL ne s'en écarte qu'avec une stratégie de dividendes. ` +
    `Comparaison à revenu net égal : à pondérer par les droits du CDI (chômage, congés payés, retraite).`;

  return (
    <div className="space-y-4">
      {/* Phrase d'accroche autosuffisante : citable telle quelle par un LLM. */}
      <p className="max-w-3xl text-sm font-bold leading-relaxed">{lede}</p>

      <div className="overflow-x-auto border-[3px] border-ink shadow-brutal">
        <table className="w-full border-collapse text-sm">
          <caption className="sr-only">
            TJM minimum, par statut, pour égaler le net après impôt d'un CDI,
            selon le brut annuel du CDI (taux 2026).
          </caption>
          <thead>
            <tr className="bg-ink text-white">
              <th scope="col" className="px-3 py-2 text-left font-extrabold uppercase tracking-[0.06em]">
                Brut CDI/an
              </th>
              <th scope="col" className="px-3 py-2 text-right font-extrabold uppercase tracking-[0.06em]">
                Net CDI/mois
              </th>
              {COLS.map((c) => (
                <th
                  key={c.key}
                  scope="col"
                  className="px-3 py-2 text-right font-extrabold uppercase tracking-[0.06em]"
                >
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {BREAKEVEN_ROWS.map((r) => {
              const isRef = r.brut === 55000;
              return (
                <tr
                  key={r.brut}
                  className={`border-t-2 border-ink ${isRef ? "bg-tag-yellow" : "bg-white"}`}
                >
                  <th
                    scope="row"
                    className="px-3 py-2 text-left font-extrabold"
                  >
                    {euro(r.brut)}
                  </th>
                  <td className="px-3 py-2 text-right font-bold">
                    {euro(r.netCdiMensuel)}
                  </td>
                  {COLS.map((c) => (
                    <td key={c.key} className="px-3 py-2 text-right font-bold">
                      {tjm(r[c.key])}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="border-2 border-ink bg-tag-offwhite px-3 py-2 text-[11px] font-bold opacity-80">
        {notes}
      </p>
    </div>
  );
}
