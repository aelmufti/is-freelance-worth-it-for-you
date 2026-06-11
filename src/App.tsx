import { useMemo, useState } from "react";
import { DEFAULT_INPUT, DEFAULT_PARAMS } from "./lib/params";
import type { FiscalParams, SimulationInput } from "./lib/params";
import { calcAll } from "./lib/engine";
import { AdvancedParams, MainForm } from "./components/Form";
import { Podium } from "./components/Results";
import { BreakEvenChart, CompareBars } from "./components/Charts";
import { ProsCons } from "./components/ProsCons";
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
            <span className="border-2 border-ink bg-white px-2 py-0.5 text-xs font-extrabold uppercase tracking-[0.12em]">
              Aucune donnée collectée
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

        {/* MENTIONS LÉGALES */}
        <section className="border-[3px] border-ink bg-white p-5 shadow-brutal">
          <h3 className="text-sm font-extrabold uppercase tracking-[0.12em]">
            Mentions légales & conditions d'utilisation
          </h3>
          <p className="mt-2 text-[11px] font-bold opacity-70">
            L'accès à ce site et son utilisation valent acceptation pleine et
            entière des présentes conditions. Si vous ne les acceptez pas,
            veuillez ne pas utiliser ce site.
          </p>
          <div className="mt-3 grid gap-4 text-[11px] font-bold md:grid-cols-2">
            <div className="space-y-2">
              <p>
                <span className="border-2 border-ink bg-tag-yellow px-1 uppercase">Éditeur</span>{" "}
                Site édité à titre personnel et non professionnel par Ali El
                Mufti, directeur de la publication —{" "}
                <a href="https://aelm.dev" target="_blank" rel="noreferrer" className="underline decoration-2">
                  aelm.dev
                </a>{" "}
                (contact via le site). Service entièrement gratuit, sans
                publicité, sans contrepartie et sans création de compte :
                aucune relation contractuelle, commerciale ou de conseil n'est
                établie entre l'éditeur et l'utilisateur.
              </p>
              <p>
                <span className="border-2 border-ink bg-tag-yellow px-1 uppercase">Hébergeur</span>{" "}
                Voir les informations d'hébergement sur aelm.dev.
              </p>
              <p>
                <span className="border-2 border-ink bg-tag-yellow px-1 uppercase">Données & cookies</span>{" "}
                Ce site ne collecte, ne stocke et ne transmet aucune donnée
                personnelle, ne dépose aucun cookie et n'utilise aucun traceur
                ni outil de mesure d'audience. Les valeurs saisies sont
                traitées exclusivement dans votre navigateur et ne quittent
                jamais votre appareil.
              </p>
              <p>
                <span className="border-2 border-ink bg-tag-yellow px-1 uppercase">Indépendance</span>{" "}
                Ce site est strictement indépendant. Il n'est ni édité, ni
                approuvé, ni soutenu, ni contrôlé par l'URSSAF, la DGFiP,
                France Travail ou toute autre administration ou organisme
                public ou privé. URSSAF, CIPAV et les autres marques ou noms
                cités appartiennent à leurs titulaires respectifs et ne sont
                mentionnés qu'à titre strictement informatif, sans affiliation,
                partenariat ni parrainage d'aucune sorte.
              </p>
              <p>
                <span className="border-2 border-ink bg-tag-yellow px-1 uppercase">Propriété & liens</span>{" "}
                Les contenus de ce site sont fournis « en l'état ». Les liens
                vers des sites tiers sont proposés à titre de commodité ;
                l'éditeur n'exerce aucun contrôle sur ces sites et décline
                toute responsabilité quant à leur contenu, leur exactitude ou
                leur disponibilité.
              </p>
            </div>
            <div className="space-y-2">
              <p>
                <span className="border-2 border-ink bg-tag-red px-1 uppercase text-white">Information, pas conseil</span>{" "}
                Ce site est un outil de simulation générique à vocation
                exclusivement informative et pédagogique. Les informations et
                résultats affichés sont des estimations théoriques fondées sur
                des hypothèses simplifiées et des paramètres saisis par
                l'utilisateur. Ils ne constituent en aucun cas un conseil ou
                une consultation de nature fiscale, comptable, juridique,
                sociale, patrimoniale ou en investissement, ni une
                recommandation personnalisée, ni une incitation à choisir un
                statut ou à réaliser une opération quelconque. L'éditeur
                n'exerce aucune profession réglementée du chiffre, du droit ou
                du conseil et ne fournit aucune prestation individualisée.
              </p>
              <p>
                <span className="border-2 border-ink bg-tag-red px-1 uppercase text-white">Aucune garantie</span>{" "}
                Malgré le soin apporté et la confrontation régulière des
                résultats à des références publiques, l'éditeur ne garantit
                ni l'exactitude, ni l'exhaustivité, ni l'actualité des
                informations et résultats, qui peuvent comporter des erreurs,
                des omissions ou des approximations. La législation et les
                taux évoluent constamment et chaque situation individuelle
                comporte des spécificités qu'un outil générique ne peut pas
                prendre en compte.
              </p>
              <p>
                <span className="border-2 border-ink bg-tag-red px-1 uppercase text-white">Vos obligations</span>{" "}
                Avant toute décision (choix ou changement de statut, création
                ou fermeture de société, option fiscale ou sociale, démission,
                investissement…), l'utilisateur s'engage à vérifier les
                informations auprès des sources officielles
                (service-public.fr, urssaf.fr, impots.gouv.fr) et à consulter
                un professionnel habilité (expert-comptable, avocat). Les
                résultats de ce simulateur ne sauraient fonder, à eux seuls,
                une quelconque décision.
              </p>
              <p>
                <span className="border-2 border-ink bg-tag-red px-1 uppercase text-white">Responsabilité</span>{" "}
                L'utilisation du site s'effectue sous la seule responsabilité
                de l'utilisateur. Dans toute la mesure permise par la loi, la
                responsabilité de l'éditeur ne saurait être engagée à raison
                de l'utilisation ou de l'impossibilité d'utiliser le site, des
                décisions prises ou non prises sur la base des résultats
                affichés, ni d'aucun dommage direct ou indirect (notamment
                perte de revenus, redressement, pénalités, perte de droits ou
                d'opportunité) susceptible d'en résulter. La présente clause
                ne s'applique pas aux cas où la loi interdit de limiter la
                responsabilité (faute lourde, dol, dommages corporels).
              </p>
              <p>
                <span className="border-2 border-ink bg-tag-red px-1 uppercase text-white">Droit applicable</span>{" "}
                Les présentes mentions sont régies par le droit français.
                Elles peuvent être modifiées à tout moment ; la version
                publiée sur cette page prévaut. Si l'une de ces clauses était
                jugée nulle, les autres conserveraient leur plein effet.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t-[3px] border-ink bg-ink px-4 py-6 text-center text-xs font-extrabold uppercase tracking-[0.12em] text-white">
        <div>FREELANCE.SIMULATEUR — gratuit, open, sans tracking</div>
        <div className="mt-3">
          Fait par{" "}
          <a
            href="https://aelm.dev"
            target="_blank"
            rel="noreferrer"
            className="brutal-press inline-block border-2 border-white bg-primary px-2 py-0.5 text-white"
          >
            ALI EL MUFTI
          </a>
        </div>
      </footer>
    </div>
  );
}
