import { useEffect, useState } from "react";
import { IS_PRERENDER } from "../lib/prerender";

const GA_ID = "G-BZ4W553NLL";
const STORAGE_KEY = "consent-analytics";

type Choice = "granted" | "denied" | null;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function loadGa() {
  if (document.getElementById("ga-script")) return;
  const s = document.createElement("script");
  s.id = "ga-script";
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(s);

  window.dataLayer = window.dataLayer || [];
  // Forme canonique : gtag pousse l'objet `arguments`, PAS un array via rest.
  // Avec un array, gtag.js ne traite pas la commande `config` → le pageview
  // (/g/collect) n'est jamais envoyé et GA reste vide malgré le consentement.
  window.gtag = function gtag() {
    window.dataLayer!.push(arguments);
  };
  window.gtag("js", new Date());
  window.gtag("config", GA_ID);
}

export function useGaConsent() {
  // État initial « aucun choix » — identique au prerender ET au premier rendu
  // client, donc le bandeau est présent dès le HTML statique (affichage
  // immédiat, sans attendre l'hydration) sans casser l'hydration. L'effet ne
  // fait que MASQUER le bandeau a posteriori pour les visiteurs ayant déjà
  // choisi (bref flash acceptable), et charger GA s'ils avaient accepté.
  const [choice, setChoice] = useState<Choice>(null);

  useEffect(() => {
    if (IS_PRERENDER) return;
    const stored = localStorage.getItem(STORAGE_KEY) as Choice;
    if (stored) setChoice(stored);
  }, []);

  useEffect(() => {
    if (choice === "granted") loadGa();
  }, [choice]);

  return {
    visible: choice === null,
    choice,
    decide(v: Exclude<Choice, null>) {
      localStorage.setItem(STORAGE_KEY, v);
      setChoice(v);
    },
    reset() {
      localStorage.removeItem(STORAGE_KEY);
      setChoice(null);
    },
  };
}

export function CookieBanner({
  onAccept,
  onRefuse,
  onShowLegal,
}: {
  onAccept: () => void;
  onRefuse: () => void;
  onShowLegal: () => void;
}) {
  return (
    <div
      id="consent-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overscroll-contain p-4 bg-ink/40 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="consent-title"
      aria-describedby="consent-desc"
    >
      <div className="anim-pop w-full max-w-md border-[3px] border-ink bg-card p-5 shadow-brutal-lg">
        <div
          id="consent-title"
          className="text-sm font-extrabold uppercase tracking-[0.12em]"
        >
          🍪 Cookies de mesure d'audience
        </div>
        {/* Texte en un seul nœud (pas de <span>/<button> inline ni {" "}) :
            le mur est dans le HTML prérendu, donc il DOIT s'hydrater sans
            mismatch #418 — voir le même piège corrigé sur BreakEvenTable. */}
        <p
          id="consent-desc"
          className="mt-2 text-xs font-bold leading-relaxed opacity-80"
        >
          Avec votre accord, nous utilisons Google Analytics pour mesurer la
          fréquentation du site (cookies _ga). Vos saisies dans le simulateur
          ne sont jamais concernées : elles ne quittent pas votre navigateur.
          Vous pouvez changer d'avis à tout moment via « Gérer les cookies » en
          bas de page.
        </p>
        <button
          type="button"
          onClick={onShowLegal}
          className="mt-2 text-xs font-bold underline decoration-2"
        >
          En savoir plus
        </button>
        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={onAccept}
            className="brutal-press flex-1 border-2 border-ink bg-accent px-4 py-2 text-xs font-extrabold uppercase tracking-[0.06em] text-ink shadow-brutal-sm"
          >
            Accepter
          </button>
          <button
            type="button"
            onClick={onRefuse}
            className="brutal-press flex-1 border-2 border-ink bg-white px-4 py-2 text-xs font-extrabold uppercase tracking-[0.06em] shadow-brutal-sm"
          >
            Refuser
          </button>
        </div>
      </div>
    </div>
  );
}
