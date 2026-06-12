import { useMemo, useState } from "react";
import { DEFAULT_INPUT, DEFAULT_PARAMS } from "./lib/params";
import type { FiscalParams, SimulationInput } from "./lib/params";
import { calcAll } from "./lib/engine";
import { AdvancedParams, MainForm } from "./components/Form";
import { Podium } from "./components/Results";
import { BreakEvenChart, CompareBars } from "./components/Charts";
import { ProsCons } from "./components/ProsCons";
import { MentionsLegales } from "./components/MentionsLegales";
import { CookieBanner, useGaConsent } from "./components/CookieConsent";
import { SectionTitle, euro } from "./components/ui";

const SOURCES: Array<{ label: string; url: string }> = [
  {
    label: "economie.gouv.fr — cotisations micro-entreprise",
    url: "https://www.economie.gouv.fr/entreprises/gerer-sa-micro-entreprise/micro-entreprises-quel-est-le-montant-de-vos-cotisations-sociales",
  },
  {
    label: "economie.gouv.fr — barème de l'impôt sur le revenu",
    url: "https://www.economie.gouv.fr/particuliers/impots-et-fiscalite/gerer-mon-impot-sur-le-revenu/comment-calculer-votre-impot-dapres-le-bareme-de-limpot-sur-le-revenu",
  },
  {
    label: "service-public.fr — évolution du PFU (flat tax 31,4 %)",
    url: "https://entreprendre.service-public.gouv.fr/actualites/A18796",
  },
  {
    label: "urssaf.fr — réforme de l'assiette des indépendants",
    url: "https://www.urssaf.fr/accueil/independant/comprendre-payer-cotisations/reforme-cotisations-independants.html",
  },
  {
    label: "service-public.fr — impôt sur les sociétés",
    url: "https://entreprendre.service-public.gouv.fr/vosdroits/F23575",
  },
  {
    label: "service-public.fr — régime fiscal micro",
    url: "https://entreprendre.service-public.gouv.fr/vosdroits/F23267",
  },
  {
    label: "CCI Paris IdF — charges sociales au 1ᵉʳ janvier 2026",
    url: "https://www.entreprises.cci-paris-idf.fr/fiches-pratiques/les-charges-sociales-au-1er-janvier-2026",
  },
];

export default function App() {
  const [input, setInput] = useState<SimulationInput>(DEFAULT_INPUT);
  const [params, setParams] = useState<FiscalParams>(DEFAULT_PARAMS);
  const [showLegal, setShowLegal] = useState(false);
  const consent = useGaConsent();

  const results = useMemo(() => calcAll(input, params), [input, params]);
  const best = useMemo(
    () =>
      [...results]
        .filter((r) => r.eligible)
        .sort((a, b) => b.netAnnuel - a.netAnnuel)[0],
    [results],
  );
  const cdi = results.find((r) => r.id === "cdi")!;
  const deltaCdi = best.id === "cdi" ? 0 : best.netAnnuel - cdi.netAnnuel;

  return (
    <div className="min-h-screen">
      {/* HERO */}
      <header className="tech-grid border-b-[3px] border-ink">
        <div className="mx-auto max-w-7xl px-4 py-12 md:py-16">
          <div className="anim-left mb-4 flex flex-wrap gap-2">
            <span className="border-2 border-ink bg-tag-yellow px-2 py-0.5 text-xs font-extrabold uppercase tracking-[0.12em]">
              100 % gratuit
            </span>
            <span className="border-2 border-ink bg-tag-green px-2 py-0.5 text-xs font-extrabold uppercase tracking-[0.12em] text-white">
              Taux 2026
            </span>
          </div>
          <h1 className="anim-up max-w-4xl text-4xl font-extrabold uppercase leading-tight tracking-tight md:text-6xl">
            Freelance ou CDI&nbsp;:
            <br />
            <span className="highlight">combien il vous reste vraiment</span>
          </h1>
          <p className="anim-up mt-4 max-w-2xl text-sm font-bold opacity-70 md:text-base">
            Micro-entreprise, EI au réel, EURL, SASU, portage salarial — net
            après cotisations ET impôt sur le revenu, comparé à votre CDI.
            Barème IR 2026, flat tax 31,4 %, réforme TNS incluse.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-12 px-4 py-10">
        {/* VERDICT */}
        <section className="anim-pop">
          <div className="border-[3px] border-ink bg-ink p-5 text-white shadow-brutal-lg md:p-6">
            <div className="text-xs font-extrabold uppercase tracking-[0.12em] opacity-70">
              Estimation avec vos paramètres — indicatif, pas un conseil
            </div>
            <div className="mt-1 text-xl font-extrabold uppercase tracking-tight md:text-3xl">
              {best.id === "cdi" ? (
                <>À ce niveau, le CDI reste plus rentable.</>
              ) : (
                <>
                  {best.label} : {euro(best.netMensuel)}/mois net, soit{" "}
                  <span className="bg-tag-green px-2 text-white">
                    +{euro(deltaCdi / 12)}/mois
                  </span>{" "}
                  vs votre CDI
                </>
              )}
            </div>
            <div className="mt-2 text-xs font-bold opacity-70">
              CDI de référence : {euro(cdi.netMensuel)}/mois net après impôt —
              sans compter chômage, congés payés et retraite, à pondérer selon
              votre aversion au risque.
            </div>
          </div>
        </section>

        {/* SIMULATEUR */}
        <section className="grid gap-6 lg:grid-cols-[380px_1fr]">
          <div className="space-y-6">
            <MainForm input={input} setInput={setInput} />
            <AdvancedParams
              params={params}
              setParams={setParams}
              defaults={DEFAULT_PARAMS}
            />
          </div>
          <div className="space-y-6">
            <Podium results={results} />
          </div>
        </section>

        {/* GRAPHIQUES */}
        <section className="space-y-6">
          <SectionTitle>
            <span className="highlight">Comparaison</span> visuelle
          </SectionTitle>
          <CompareBars results={results} />
          <BreakEvenChart input={input} params={params} />
        </section>

        {/* AVANTAGES / INCONVÉNIENTS */}
        <section>
          <SectionTitle>
            Statuts : <span className="highlight">forces & faiblesses</span>
          </SectionTitle>
          <ProsCons />
        </section>

        {/* SOURCES + DISCLAIMER */}
        <section className="border-[3px] border-ink bg-white p-5 shadow-brutal">
          <h3 className="text-sm font-extrabold uppercase tracking-[0.12em]">
            Sources officielles (taux 2026)
          </h3>
          <ul className="mt-2 grid gap-1 text-xs md:grid-cols-2">
            {SOURCES.map((s) => (
              <li key={s.url}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold underline decoration-2 underline-offset-2 hover:bg-tag-yellow"
                >
                  ▸ {s.label}
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-4 border-2 border-ink bg-tag-offwhite px-3 py-2 text-[11px] font-bold opacity-80">
            ⚠ Simulation indicative, à jour des principaux taux 2026 (barème IR
            sur revenus 2025, PFU 31,4 %, réforme de l'assiette TNS). Elle ne
            remplace pas un expert-comptable : CFE, plafonnement du quotient
            familial, réduction générale de cotisations, mutuelle obligatoire,
            prévoyance et cas particuliers ne sont pas tous modélisés. Aucune
            donnée n'est envoyée : tout est calculé dans votre navigateur.
          </p>
          <p className="mt-2 border-2 border-ink bg-tag-offwhite px-3 py-2 text-[11px] font-bold opacity-80">
            ✓ Contrôle qualité : nos résultats sont comparés automatiquement au
            moteur de calcul open source « modele-social » qui équipe
            mon-entreprise.urssaf.fr (écarts inférieurs à 2 % sur les cas
            testés). Cette démarche est purement technique : ce site est
            indépendant et n'est ni édité, ni approuvé, ni soutenu par
            l'URSSAF ou toute autre administration.
          </p>
        </section>

      </main>

      <footer className="border-t-[3px] border-ink bg-ink px-4 py-6 text-center text-xs font-extrabold uppercase tracking-[0.12em] text-white">
        {/* Call to action GitHub Star */}
        <div className="mx-auto mb-6 max-w-xl border-2 border-white bg-ink p-4 normal-case tracking-normal">
          <div className="text-sm font-extrabold uppercase tracking-[0.06em]">
            ★ Vous aimez ce simulateur ?
          </div>
          <p className="mt-1 text-xs font-bold opacity-80">
            Le code est entièrement public et gratuit. Si l'outil vous a été
            utile, une étoile sur GitHub me fait grave plaisir et m'aide à le
            faire connaître.
          </p>
          <a
            href="https://github.com/aelmufti/is-freelance-worth-it-for-you"
            target="_blank"
            rel="noreferrer"
            className="brutal-press mt-3 inline-flex items-center gap-2 border-2 border-white bg-tag-yellow px-3 py-1.5 text-xs font-extrabold uppercase tracking-[0.06em] text-ink shadow-brutal-sm"
            style={{ boxShadow: "3px 3px 0 0 #E5E5E5" }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58 0-.29-.01-1.06-.02-2.08-3.34.72-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.08-.74.08-.73.08-.73 1.2.08 1.83 1.23 1.83 1.23 1.07 1.84 2.81 1.31 3.5 1 .1-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 016 0c2.29-1.55 3.3-1.23 3.3-1.23.65 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.62-5.49 5.92.43.37.81 1.1.81 2.22 0 1.61-.01 2.91-.01 3.3 0 .32.22.7.83.58A12.01 12.01 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            Mettre une étoile sur GitHub
          </a>
        </div>

        <div>FREELANCE-OU-CDI.FR — gratuit, open, sans compte</div>
        <div className="mt-3">
          Fait par{" "}
          <a
            href="https://aelm.dev?utm_source=freelance-simulateur&utm_medium=referral&utm_campaign=footer"
            target="_blank"
            rel="noreferrer"
            className="brutal-press inline-block border-2 border-white bg-primary px-2 py-0.5 text-white"
          >
            ALI EL MUFTI
          </a>
        </div>
        <div className="mt-3 flex justify-center gap-4">
          <button
            type="button"
            onClick={() => setShowLegal(true)}
            className="text-[10px] font-bold uppercase tracking-[0.12em] underline decoration-1 underline-offset-2 opacity-60 hover:opacity-100"
          >
            Mentions légales
          </button>
          <button
            type="button"
            onClick={() => consent.reset()}
            className="text-[10px] font-bold uppercase tracking-[0.12em] underline decoration-1 underline-offset-2 opacity-60 hover:opacity-100"
          >
            Gérer les cookies
          </button>
        </div>
      </footer>

      {showLegal && <MentionsLegales onClose={() => setShowLegal(false)} />}
      {consent.choice === null && (
        <CookieBanner
          onAccept={() => consent.decide("granted")}
          onRefuse={() => consent.decide("denied")}
          onShowLegal={() => setShowLegal(true)}
        />
      )}
    </div>
  );
}
