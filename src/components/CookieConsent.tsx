import { useEffect, useState } from "react";

const GA_ID = "G-BZ4W553NLL";
const STORAGE_KEY = "consent-analytics";

type Choice = "granted" | "denied" | null;

declare global {
  interface Window {
    dataLayer?: unknown[];
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
  function gtag(...args: unknown[]) {
    window.dataLayer!.push(args);
  }
  gtag("js", new Date());
  gtag("config", GA_ID);
}

export function useGaConsent() {
  const [choice, setChoice] = useState<Choice>(
    () => localStorage.getItem(STORAGE_KEY) as Choice,
  );

  useEffect(() => {
    if (choice === "granted") loadGa();
  }, [choice]);

  return {
    choice,
    decide(v: Exclude<Choice, null>) {
      localStorage.setItem(STORAGE_KEY, v);
      setChoice(v);
    },
    reset() {
      localStorage.removeItem(STORAGE_KEY);
      // Si GA était chargé, seule une rechargement stoppe la mesure.
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
    <div className="anim-up fixed inset-x-0 bottom-0 z-40 p-3 md:p-4">
      <div className="mx-auto max-w-3xl border-[3px] border-ink bg-card p-4 shadow-brutal-lg">
        <div className="text-xs font-extrabold uppercase tracking-[0.12em]">
          🍪 Cookies de mesure d'audience
        </div>
        <p className="mt-1 text-xs font-bold opacity-80">
          Avec votre accord, nous utilisons Google Analytics pour mesurer la
          fréquentation du site (cookies <span className="font-extrabold">_ga</span>).
          Vos saisies dans le simulateur ne sont jamais concernées : elles ne
          quittent pas votre navigateur. Vous pouvez changer d'avis à tout
          moment via « Gérer les cookies » en bas de page.{" "}
          <button
            type="button"
            onClick={onShowLegal}
            className="underline decoration-2"
          >
            En savoir plus
          </button>
        </p>
        <div className="mt-3 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onAccept}
            className="brutal-press border-2 border-ink bg-accent px-4 py-1.5 text-xs font-extrabold uppercase tracking-[0.06em] text-ink shadow-brutal-sm"
          >
            Accepter
          </button>
          <button
            type="button"
            onClick={onRefuse}
            className="brutal-press border-2 border-ink bg-white px-4 py-1.5 text-xs font-extrabold uppercase tracking-[0.06em] shadow-brutal-sm"
          >
            Refuser
          </button>
        </div>
      </div>
    </div>
  );
}
