import { useEffect } from "react";

const VILLE_EDITEUR = "Paris (75003), France";

function Titre({ children }: { children: string }) {
  return (
    <h3 className="mt-5 border-2 border-ink bg-ink px-2 py-1 text-xs font-extrabold uppercase tracking-[0.06em] text-white first:mt-0">
      {children}
    </h3>
  );
}

export function MentionsLegales({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/60 p-4 md:p-10"
      onClick={onClose}
    >
      <div
        className="anim-pop w-full max-w-3xl border-[3px] border-ink bg-card shadow-brutal-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b-[3px] border-ink bg-tag-yellow px-4 py-2">
          <span className="text-sm font-extrabold uppercase tracking-[0.12em]">
            Mentions légales
          </span>
          <button
            type="button"
            onClick={onClose}
            className="brutal-press border-2 border-ink bg-white px-2 py-0.5 text-xs font-extrabold uppercase shadow-brutal-sm"
          >
            ✕ Fermer
          </button>
        </div>

        <div className="space-y-3 p-5 text-xs font-bold leading-relaxed">
          <Titre>1. Éditeur du site</Titre>
          <p>Ce site est édité à titre personnel par :</p>
          <ul className="list-none space-y-1">
            <li>— Nom et prénom : Ali El Mufti</li>
            <li>— Adresse de résidence : {VILLE_EDITEUR}</li>
            <li>
              — Contact d'administration :{" "}
              <a href="mailto:alielmufti25@gmail.com" className="underline decoration-2">
                alielmufti25@gmail.com
              </a>
            </li>
            <li>
              — Site personnel :{" "}
              <a href="https://aelm.dev" target="_blank" rel="noreferrer" className="underline decoration-2">
                aelm.dev
              </a>
            </li>
          </ul>

          <Titre>2. Hébergement</Titre>
          <p>Ce site est hébergé par la société Vercel :</p>
          <ul className="list-none space-y-1">
            <li>— Raison sociale : Vercel Inc.</li>
            <li>— Adresse : 340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis</li>
            <li>— Contact : privacy@vercel.com / +1 (559) 288-7060</li>
          </ul>

          <Titre>3. Propriété intellectuelle</Titre>
          <p>
            L'ensemble de ce site relève de la législation française et
            internationale sur le droit d'auteur et la propriété
            intellectuelle. Tous les droits de reproduction sont réservés, y
            compris pour les documents téléchargeables et les représentations
            iconographiques et photographiques. La reproduction de tout ou
            partie de ce site sur un support électronique quel qu'il soit est
            formellement interdite sauf autorisation expresse de l'éditeur.
          </p>

          <Titre>4. Traitement des données personnelles (RGPD)</Titre>
          <p>
            Le site est un outil de simulation fonctionnant directement dans
            le navigateur de l'utilisateur.
          </p>
          <p>
            <span className="uppercase">Collecte de données :</span> aucune
            donnée financière, personnelle ou d'état civil saisie dans le
            simulateur n'est transmise, sauvegardée ou exploitée sur nos
            serveurs.
          </p>
          <p>
            <span className="uppercase">Cookies :</span> ce site n'utilise
            aucun cookie de ciblage publicitaire ni outil de mesure
            d'audience.
          </p>

          <Titre>5. Limitation de responsabilité</Titre>
          <p>
            Le simulateur mis à disposition sur ce site a pour unique but de
            fournir des estimations à titre purement indicatif. Les résultats
            générés n'ont aucune valeur légale, comptable ou fiscale et ne
            sauraient se substituer aux conseils d'un professionnel qualifié
            (expert-comptable, avocat, URSSAF). L'éditeur décline toute
            responsabilité quant aux conséquences directes ou indirectes
            (décisions financières, professionnelles, etc.) qui découleraient
            de l'utilisation de cet outil.
          </p>

          <Titre>6. Conditions d'utilisation</Titre>
          <p>
            L'accès au site et son utilisation valent acceptation des
            présentes mentions. Le service est entièrement gratuit, sans
            publicité ni création de compte : aucune relation contractuelle,
            commerciale ou de conseil n'est établie entre l'éditeur et
            l'utilisateur. L'éditeur n'exerce aucune profession réglementée
            du chiffre, du droit ou du conseil ; les résultats, fondés sur
            des hypothèses simplifiées, sont fournis « en l'état », sans
            garantie d'exactitude, d'exhaustivité ou d'actualité. Avant toute
            décision, l'utilisateur s'engage à vérifier les informations
            auprès des sources officielles (service-public.fr, urssaf.fr,
            impots.gouv.fr) et à consulter un professionnel habilité. Ce site
            est strictement indépendant : il n'est ni édité, ni approuvé, ni
            soutenu par l'URSSAF ou toute autre administration ; les marques
            citées appartiennent à leurs titulaires respectifs. Les présentes
            mentions sont régies par le droit français et peuvent être
            modifiées à tout moment.
          </p>
        </div>
      </div>
    </div>
  );
}
