// Notifie IndexNow (Bing, Yandex, Seznam, Naver…) des URL du site. Bing
// alimente la recherche de ChatGPT et Copilot : une page recrawlée par Bing en
// quelques minutes au lieu de quelques semaines, c'est une page citable plus
// vite par les moteurs génératifs.
//
// À lancer APRÈS un déploiement de production (pas dans le build : un build
// de preview notifierait des URL dont le contenu n'est pas encore en ligne) :
//
//   npm run indexnow                     # toutes les pages
//   npm run indexnow -- --since=2026-09-01   # pages révisées depuis cette date
//   npm run indexnow -- --dry-run        # affiche la requête sans l'envoyer
//
// La clé est publique par conception : IndexNow vérifie que le fichier
// public/<clé>.txt est servi par le domaine notifié.
import { INDEXABLE_PAGES as PAGES, SITE, pageUpdated, pageUrl } from "../src/lib/pages";

const KEY = "90caac6dd72f898889e93797df5aa379";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const since = args.find((a) => a.startsWith("--since="))?.slice(8);

const urlList = PAGES.filter((p) => !since || pageUpdated(p) >= since).map(pageUrl);
if (urlList.length === 0) {
  console.log(`Aucune page révisée depuis le ${since}.`);
  process.exit(0);
}

const body = {
  host: new URL(SITE).host,
  key: KEY,
  keyLocation: `${SITE}/${KEY}.txt`,
  urlList,
};

if (dryRun) {
  console.log(JSON.stringify(body, null, 2));
  process.exit(0);
}

const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify(body),
});
// 200 = reçu, 202 = reçu (vérification de la clé en attente).
if (res.status === 200 || res.status === 202) {
  console.log(`✓ IndexNow : ${urlList.length} URL notifiée(s) (HTTP ${res.status})`);
} else {
  console.error(`✗ IndexNow : HTTP ${res.status} — ${await res.text()}`);
  process.exit(1);
}
