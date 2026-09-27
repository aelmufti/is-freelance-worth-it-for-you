// Contenu des pages légales (layout « legal », cf. src/data/legal.ts).
//
// Chaque affirmation doit rester VRAIE au regard du code : si le site se met à
// déposer un cookie, à collecter un formulaire ou à changer d'outil d'audience,
// ces textes doivent changer dans le même commit.
import { useEffect, useState, type ReactNode } from "react";
import { CONTENT_UPDATED } from "../lib/pages";
import { audienceRefusee, definirRefusAudience, gpcActif } from "../lib/consent";
import { IS_PRERENDER } from "../lib/prerender";

const CONTACT = "alielmufti25@gmail.com";
const REPO = "https://github.com/aelmufti/is-freelance-worth-it-for-you";

const MOIS = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];
const [ty, tm, td] = CONTENT_UPDATED.split("-").map(Number);
const TAUX_VERIFIES = `${td} ${MOIS[tm - 1]} ${ty}`;

function H({ children }: { children: string }) {
  return (
    <h2 className="mt-8 border-2 border-ink bg-ink px-3 py-1.5 text-sm font-extrabold uppercase tracking-[0.06em] text-white first:mt-0">
      {children}
    </h2>
  );
}

function A({ href, children }: { href: string; children: ReactNode }) {
  const externe = href.startsWith("http");
  return (
    <a
      href={href}
      {...(externe ? { target: "_blank", rel: "noreferrer" } : {})}
      className="underline decoration-2 underline-offset-2 hover:bg-tag-yellow"
    >
      {children}
    </a>
  );
}

function Corps({ children }: { children: ReactNode }) {
  return (
    <div className="max-w-3xl space-y-3 text-sm font-bold leading-relaxed md:text-base">
      {children}
    </div>
  );
}

// ------------------------------------------------------- MENTIONS LÉGALES
export function MentionsLegalesContenu() {
  return (
    <Corps>
      <H>1. Éditeur</H>
      <p>
        Ce site est édité à titre non professionnel par une personne physique,
        sans activité commerciale qui lui soit liée.
      </p>
      <ul className="list-none space-y-1">
        <li>— Nom : Ali El Mufti</li>
        <li>— Localisation : Paris (75003), France</li>
        <li>
          <span>{"— Contact : "}</span>
          <A href={`mailto:${CONTACT}`}>{CONTACT}</A>
        </li>
        <li>— Directeur de la publication : Ali El Mufti</li>
      </ul>

      <H>2. Hébergeur</H>
      <ul className="list-none space-y-1">
        <li>— Vercel Inc.</li>
        <li>— 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis</li>
        <li>— Téléphone : +1 559 288 7060</li>
        <li>
          <span>{"— Contact : "}</span>
          <A href="mailto:privacy@vercel.com">privacy@vercel.com</A>
        </li>
      </ul>

      <H>3. Réutilisation du contenu</H>
      <p>
        Vous pouvez réutiliser ce site librement, y compris à des fins
        commerciales, à une seule condition : citer la source.
      </p>
      <ul className="list-none space-y-2">
        <li>
          <span>{"— Code source : licence "}</span>
          <A href={`${REPO}/blob/main/LICENSE`}>MIT</A>
          <span>
            {". La notice « Copyright (c) 2026 Ali El Mufti » doit être conservée dans toute copie ou version modifiée."}
          </span>
        </li>
        <li>
          <span>{"— Textes, tableaux et chiffres calculés : licence "}</span>
          <A href="https://creativecommons.org/licenses/by/4.0/deed.fr">
            Creative Commons Attribution 4.0 International (CC BY 4.0)
          </A>
          <span>
            {". Mention attendue : « Source : freelance-ou-cdi.fr (Ali El Mufti) », avec un lien vers la page utilisée et l'indication des modifications éventuelles."}
          </span>
        </li>
        <li>
          — Ne sont pas couverts par ces licences : les TJM de marché cités dans
          l'observatoire et les pages métier, issus de baromètres tiers (Malt,
          Blog du Modérateur, tjmetre.fr), qui restent la propriété de leurs
          auteurs ; les noms et marques cités, qui appartiennent à leurs
          titulaires ; la police JetBrains Mono, distribuée sous SIL Open Font
          License 1.1.
        </li>
      </ul>

      <H>4. Indépendance</H>
      <p>
        Ce site est indépendant. Il n'est ni édité, ni approuvé, ni soutenu par
        l'URSSAF, la DGFiP, France Travail ou toute autre administration. Ses
        résultats sont comparés automatiquement au moteur open source
        « modele-social », qui équipe mon-entreprise.urssaf.fr : cette
        comparaison est un contrôle technique mené par l'éditeur, pas un
        partenariat ni une certification.
      </p>
      <p>
        Les plateformes citées le sont comme sources. Aucun lien n'est affilié
        ou rémunéré : le site ne perçoit aucune commission et ne diffuse aucune
        publicité.
      </p>

      <H>5. Nature des informations</H>
      <p>
        {`Les simulations sont des estimations indicatives, fondées sur les hypothèses simplifiées exposées sur chaque page et dans la méthodologie, et sur les taux et barèmes vérifiés le ${TAUX_VERIFIES}. Elles ne constituent ni un conseil juridique, fiscal ou comptable, ni une consultation personnalisée : l'éditeur n'exerce aucune profession réglementée du droit ou du chiffre.`}
      </p>
      <p>
        Avant toute décision, vérifiez votre situation auprès des sources
        officielles (service-public.fr, urssaf.fr, impots.gouv.fr) ou d'un
        professionnel habilité (expert-comptable, avocat).
      </p>

      <H>6. Responsabilité</H>
      <p>
        L'éditeur apporte le plus grand soin à l'exactitude des calculs et à la
        mise à jour des taux, sans pouvoir garantir l'absence d'erreur ni
        l'adéquation des résultats à votre situation. Dans les limites prévues
        par la loi, sa responsabilité ne saurait être engagée du fait de
        décisions prises sur la seule base de ces simulations. Les liens vers
        des sites tiers sont fournis pour information ; leur contenu relève de
        leurs éditeurs.
      </p>

      <H>7. Signaler une erreur</H>
      <p>
        <span>
          {"Un taux périmé, un calcul faux, un contenu contestable ? Écrivez à "}
        </span>
        <A href={`mailto:${CONTACT}`}>{CONTACT}</A>
        <span>{" ou "}</span>
        <A href={`${REPO}/issues`}>ouvrez une issue sur GitHub</A>
        <span>{"."}</span>
      </p>

      <H>8. Données personnelles</H>
      <p>
        <span>{"Voir la "}</span>
        <A href="/confidentialite/">politique de confidentialité</A>
        <span>{"."}</span>
      </p>

      <H>9. Droit applicable</H>
      <p>Les présentes mentions sont régies par le droit français.</p>
    </Corps>
  );
}

// ------------------------------------------ OPPOSITION MESURE D'AUDIENCE
// Rendu neutre au prerender et au premier rendu (l'état réel dépend du
// navigateur) : l'état est lu après hydration, sinon mismatch.
function OppositionAudience() {
  const [etat, setEtat] = useState<"lecture" | "gpc" | "active" | "refusee">(
    "lecture",
  );
  useEffect(() => {
    // Au prerender, l'état doit rester neutre : c'est ce que le navigateur
    // rend au premier passage, sinon l'hydration échoue (#418).
    if (IS_PRERENDER) return;
    setEtat(gpcActif() ? "gpc" : audienceRefusee() ? "refusee" : "active");
  }, []);

  const basculer = () => {
    const refus = etat === "active";
    definirRefusAudience(refus);
    setEtat(refus ? "refusee" : "active");
  };

  const texte = {
    lecture: "Lecture de votre préférence… (sans JavaScript, aucune mesure n'a lieu).",
    gpc: "Votre navigateur envoie le signal Global Privacy Control : la mesure d'audience est désactivée pour vous, sans autre démarche.",
    active: "La mesure d'audience est active pour ce navigateur.",
    refusee: "Vous avez refusé la mesure d'audience : aucune statistique n'est envoyée depuis ce navigateur.",
  }[etat];

  return (
    <div className="border-[3px] border-ink bg-white p-4 shadow-brutal">
      <p role="status" aria-live="polite">
        {texte}
      </p>
      {(etat === "active" || etat === "refusee") && (
        <button
          type="button"
          onClick={basculer}
          className="brutal-press mt-3 border-2 border-ink bg-tag-yellow px-3 py-1.5 text-xs font-extrabold uppercase tracking-[0.06em] shadow-brutal-sm"
        >
          {etat === "active"
            ? "Refuser la mesure d'audience"
            : "Réautoriser la mesure d'audience"}
        </button>
      )}
    </div>
  );
}

// -------------------------------------------------------- CONFIDENTIALITÉ
export function ConfidentialiteContenu() {
  return (
    <Corps>
      <p className="border-[3px] border-ink bg-tag-yellow p-4">
        En bref : rien de ce que vous saisissez dans le simulateur ne quitte
        votre navigateur, et le site ne dépose aucun cookie. Seules des
        statistiques de fréquentation agrégées sont mesurées, sans cookie, et
        vous pouvez vous y opposer ci-dessous.
      </p>

      <H>1. Responsable du traitement</H>
      <p>
        <span>
          {"Ali El Mufti, éditeur du site à titre non professionnel. Contact : "}
        </span>
        <A href={`mailto:${CONTACT}`}>{CONTACT}</A>
        <span>{"."}</span>
      </p>

      <H>2. Ce que vous saisissez dans le simulateur</H>
      <p>
        TJM, jours facturés, situation familiale, salaire : tout est calculé
        localement, par votre navigateur. Rien n'est transmis, enregistré ni
        exploité, ni par l'éditeur, ni par l'hébergeur. Fermer la page efface
        tout.
      </p>

      <H>3. Mesure d'audience</H>
      <ul className="list-none space-y-2">
        <li>
          — Outil : Vercel Web Analytics, fourni par l'hébergeur du site.
        </li>
        <li>
          — Finalité : compter les visites et les pages consultées, pour le
          seul compte de l'éditeur, afin d'améliorer le site.
        </li>
        <li>
          — Données : page consultée, site de provenance, pays, type
          d'appareil, navigateur et système d'exploitation.
        </li>
        <li>
          — Fonctionnement : aucun cookie ni identifiant n'est stocké sur votre
          appareil. Les visites sont regroupées grâce à une empreinte calculée
          à partir de la requête et renouvelée toutes les 24 heures, qui ne
          permet ni de vous suivre d'un site à l'autre ou d'un jour à l'autre,
          ni de vous identifier.
        </li>
        <li>
          — Accès : l'éditeur ne consulte que des statistiques agrégées, sur
          les 30 derniers jours. Il n'exporte ni ne recoupe aucune donnée.
        </li>
        <li>
          — Base légale : intérêt légitime de l'éditeur à mesurer la
          fréquentation de son site (RGPD, art. 6.1.f). Cette mesure est mise
          en œuvre sans bandeau de consentement, dans les conditions fixées
          par la CNIL pour la mesure d'audience : finalité strictement
          statistique, pour le seul compte de l'éditeur, information préalable
          (cette page) et droit d'opposition (ci-dessous).
        </li>
      </ul>
      <OppositionAudience />
      <p>
        Le signal Global Privacy Control de votre navigateur, s'il est activé,
        vaut refus. Sans JavaScript, aucune mesure n'a lieu.
      </p>

      <H>4. Hébergement</H>
      <p>
        Pour afficher le site, l'hébergeur Vercel Inc. traite techniquement
        votre adresse IP et les informations de votre requête (journaux de
        connexion), afin de délivrer les pages et d'assurer la sécurité du
        service. Base légale : intérêt légitime au fonctionnement et à la
        sécurité du site (RGPD, art. 6.1.f). Ces journaux sont conservés selon
        la durée fixée par l'hébergeur ; l'éditeur ne les exploite pas.
      </p>
      <p>
        <span>{"Détails : "}</span>
        <A href="https://vercel.com/legal/privacy-notice">
          politique de confidentialité de Vercel
        </A>
        <span>{"."}</span>
      </p>

      <H>5. Transfert hors de l'Union européenne</H>
      <p>
        <span>
          {"Vercel Inc. est établie aux États-Unis. Les transferts reposent sur sa certification au "}
        </span>
        <A href="https://www.dataprivacyframework.gov/">
          Data Privacy Framework UE–États-Unis
        </A>
        <span>
          {", reconnu comme offrant une protection adéquate par la décision d'adéquation de la Commission européenne du 10 juillet 2023."}
        </span>
      </p>

      <H>6. Contact par e-mail</H>
      <p>
        Si vous écrivez à l'éditeur, votre adresse et votre message servent
        uniquement à vous répondre et ne sont conservés que le temps de
        l'échange.
      </p>

      <H>7. Stockage sur votre appareil</H>
      <p>
        Le site n'écrit rien sur votre appareil (ni cookie, ni stockage local),
        à une exception près : si vous refusez la mesure d'audience, ce refus
        est mémorisé dans le stockage local de votre navigateur (clé
        « fcdi:mesure-audience ») pour être respecté lors de vos prochaines
        visites. Ce stockage ne sert qu'à conserver votre choix et n'est donc
        pas soumis à consentement.
      </p>
      <p>
        Les polices de caractères sont hébergées sur le site même : aucune
        requête n'est envoyée à Google ni à un autre tiers pour les afficher.
      </p>

      <H>8. Vos droits</H>
      <p>
        <span>
          {"Vous disposez d'un droit d'accès, de rectification, d'effacement, de limitation et d'opposition (RGPD, art. 15 à 21) : écrivez à "}
        </span>
        <A href={`mailto:${CONTACT}`}>{CONTACT}</A>
        <span>
          {". Les statistiques d'audience étant agrégées et sans identifiant, l'éditeur n'est généralement pas en mesure de retrouver les données d'une personne (RGPD, art. 11) : l'interrupteur ci-dessus reste le moyen le plus direct de vous opposer."}
        </span>
      </p>
      <p>
        <span>{"Vous pouvez aussi introduire une réclamation auprès de la "}</span>
        <A href="https://www.cnil.fr/fr/plaintes">CNIL</A>
        <span>
          {" (3 place de Fontenoy, TSA 80715, 75334 Paris Cedex 07)."}
        </span>
      </p>

      <H>9. Ce que le site ne fait pas</H>
      <p>
        Pas de compte, pas de formulaire de collecte, pas de publicité, pas de
        revente de données, pas de profilage ni de décision automatisée.
      </p>
    </Corps>
  );
}
