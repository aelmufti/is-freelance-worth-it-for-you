# freelance-ou-cdi.fr

```
╔══════════════════════════════════════════════════════════════════╗
║  FREELANCE OU CDI ? COMBIEN IL VOUS RESTE VRAIMENT.              ║
║                                                                  ║
║  Un simulateur 2026 sans bullshit : taux officiels, comparaison  ║
║  honnête, calculs validés contre le moteur de l'URSSAF.          ║
╚══════════════════════════════════════════════════════════════════╝
```

**Live →** [freelance-ou-cdi.fr](https://freelance-ou-cdi.fr)

Comparez **micro-entreprise, EI au réel, EURL, SASU, portage salarial et CDI** en net après cotisations *et* impôt sur le revenu. Trouvez le TJM à partir duquel chaque statut bat votre CDI. Tout est paramétrable, rien n'est envoyé sur un serveur.

---

## Pourquoi ce truc existe

Tous les simulateurs en ligne ont l'un de ces problèmes :

- ils comparent **un seul statut à la fois** (impossible d'arbitrer)
- ils s'arrêtent **avant l'impôt sur le revenu** (le net affiché est faux d'un quart)
- ils sortent un chiffre **sans expliquer comment on y arrive**
- ils sont des **portes d'entrée commerciales** (portage, comptable…) avec des hypothèses biaisées en leur faveur
- ils ignorent les **taux 2026** (flat tax à 31,4 %, réforme de l'assiette TNS)

Celui-ci fait le contraire. Tout le code est ici, tous les taux sont visibles dans `src/lib/params.ts` et modifiables dans l'UI.

---

## Ce qu'il calcule

| Statut | Cotisations | Impôt | Spécificités modélisées |
|---|---|---|---|
| **Micro-entreprise** | BNC / BIC services / BIC vente | IR ou versement libératoire | ACRE, CIPAV, plafonds, seuils TVA |
| **EI au réel (TNS)** | Assiette unique 2026 (−26 %) | Barème IR | Frais réels déductibles |
| **EURL (IS)** | TNS sur rémunération | IS 15/25 % + IR + dividendes | Seuil des 10 % du capital (TNS sur excédent) |
| **SASU (IS)** | Assimilé salarié | IS + IR + flat tax | Arbitrage rémunération/dividendes |
| **Portage salarial** | Salarié | IR | Frais de gestion paramétrables |
| **CDI cadre** | Salarié | IR | Coût total employeur affiché |

Plus : **barème IR 2026** (revenus 2025), quotient familial, décote, flat tax **31,4 %**, et un **graphe de break-even** qui montre à partir de quel TJM chaque statut dépasse votre CDI.

---

## Comment on sait que les chiffres sont justes

On compare nos résultats au **moteur officiel `modele-social`** — c'est le moteur open source qui fait tourner [mon-entreprise.urssaf.fr](https://mon-entreprise.urssaf.fr). Une suite de tests automatisés vérifie l'écart sur des dizaines de scénarios :

```bash
npm test
```

```
✓ Micro BNC cotisations             écart < 0,1 %
✓ TNS (EI/EURL) cotisations         écart < 2 %  (jusqu'à 110 k€)
✓ Impôt sur le revenu               écart 0,0 %  (exact à l'euro)
✓ SASU coût total → net             écart < 1 %
✓ CDI brut → net                    écart < 1 %
✓ CDI coût employeur                écart < 4 %
```

Pour voir les comparaisons en détail :

```bash
npm run compare
```

> ⚠ Ce site est **strictement indépendant**. Il n'est ni édité, ni approuvé, ni soutenu par l'URSSAF ou toute autre administration. La comparaison avec `modele-social` est purement technique.

---

## Stack

- **React 19** + **TypeScript** + **Vite 6**
- **Tailwind CSS v4** avec design tokens néo-brutalistes
- **recharts** pour les graphiques
- **publicodes / modele-social** + **vitest** pour la validation contre l'URSSAF
- **Vercel** (hébergement) + **Vercel Analytics** (sans cookie, exempté de consentement)

Charte graphique : **néo-brutalisme strict** — JetBrains Mono partout, border-radius 0, ombres dures décalées sans blur, aucun dégradé, palette plate à fort contraste.

---

## Lancer le projet

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production
npm test          # tests vs modele-social URSSAF
npm run compare   # rapport détaillé des écarts
```

---

## Architecture

```
src/
├── lib/
│   ├── params.ts          # tous les taux 2026 (modifiables dans l'UI)
│   ├── ir.ts              # barème IR, quotient familial, décote
│   ├── engine.ts          # moteur de calcul par statut + break-even
│   └── pages.ts           # registre des 67 pages (routing, sitemap, prerender)
├── components/
│   ├── Form.tsx           # inputs + panneau "paramètres avancés"
│   ├── Results.tsx        # cartes par statut
│   ├── Charts.tsx         # barres comparatives + courbe de break-even
│   ├── BreakEvenTable.tsx # seuils de TJM (colonnes ciblées par page)
│   ├── ProsCons.tsx       # forces/faiblesses (fiches ciblées par page)
│   └── MentionsLegales.tsx
├── data/                  # contenu éditorial (statuts, comparatifs, guides, TJM)
└── App.tsx
tests/urssaf.test.ts       # validation contre le moteur URSSAF
scripts/compare-urssaf.ts  # rapport humain des écarts
scripts/prerender.ts       # capture Playwright + <head> et JSON-LD par route
scripts/apply-prerender.ts # réapplique le HTML committé sur le dist/ Vercel
scripts/build-sitemap.ts   # sitemap.xml depuis le registre de pages
```

---

## SEO : les règles à ne pas casser

Le site publie 67 pages qui partagent le même simulateur. Tout l'enjeu est que
chacune reste **distincte** : un cluster de pages quasi identiques finit en
« explorée, actuellement non indexée ».

**1. Le contenu partagé reste minoritaire.** Les blocs génériques sont réduits
ou ciblés selon la page :

| Bloc | Règle |
|---|---|
| Fiches forces/faiblesses | filtrées sur `page.statuts` ; remplacées par des liens sur la longue traîne TJM |
| Tableau des seuils de TJM | colonnes limitées aux statuts de la page |
| Sources + réserves | version complète sur l'accueil, les guides et les pages éditoriales ; version courte ailleurs, avec lien vers `/methodologie/` |
| `<noscript>` | deux lignes — le contenu réel est déjà prérendu |

Repère : viser **≥ 45 % de contenu propre** par page (mesure par 8-grammes
non partagés). Ajouter un bloc affiché partout fait mécaniquement baisser ce
ratio sur les 67 URL à la fois.

**2. Le prerender committé doit suivre le code.** `prerendered/` est appliqué
tel quel en production par `apply-prerender.ts`. Toute modification de
`src/` visible dans le DOM impose de relancer :

```bash
npm run prerender:capture   # puis commiter prerendered/ et prerendered.html
```

Sans ça, Vercel sert l'ancien HTML avec le nouveau JS : les crawlers voient le
contenu périmé et React casse l'hydration. Si `playwright install` ne peut pas
télécharger Chromium (CI, conteneur), pointez un binaire existant :
`CHROMIUM_EXECUTABLE_PATH=/chemin/vers/chrome npm run prerender:capture`.

**3. Les dates sont des signaux, pas de la décoration.**

- `CONTENT_UPDATED` — dernière vérification des **taux** ; affichée dans
  « Sources officielles ». Ne l'avancez que si vous avez réellement revérifié.
- `SITE_UPDATED` — dernière **révision éditoriale** ; alimente `<lastmod>` et
  `dateModified`. Une page peut la surcharger avec son propre champ `updated`.
- `SITE_PUBLISHED` / `published` — première publication, jamais égale à
  `dateModified`.

**4. Chaque page doit garder des liens entrants.** `hideFromFooter` retire une
page du plan de site : ne l'utilisez que pour la longue traîne, et vérifiez
qu'un hub (`/tjm-en-salaire/`, `/observatoire-tjm-2026/`, `/guides/`) ou les
`related` d'autres pages la relaient — sinon elle tombe à zéro lien interne.

---

## Ce qui n'est pas modélisé (volontairement)

Pour rester lisible, on simplifie. Sont **hors périmètre** :

- la CFE (variable selon la commune)
- la réduction générale de cotisations (Fillon) sur les bas salaires CDI
- le plafonnement du quotient familial
- la mutuelle obligatoire d'entreprise
- la prévoyance et la retraite complémentaire facultatives
- les cas DROM, conventions collectives spécifiques, abattement zone

→ Le simulateur affiche en clair toutes ces réserves et **ne remplace pas un expert-comptable**.

---

## Vie privée

- **Aucune donnée** saisie dans le simulateur ne quitte votre navigateur.
- **Aucun cookie** ni traceur : mesure d'audience anonyme via Vercel Analytics, sans consentement requis.
- **Code source intégral** disponible ici — vérifiez vous-même.

---

## Licence

Le **code** est public sous licence MIT. Reprenez-le, forkez-le, améliorez-le.
Le **contenu éditorial** (textes, formulations) est diffusé sous CC BY 4.0.

---

## Auteur

Fait par **Ali El Mufti** — [aelm.dev](https://aelm.dev?utm_source=freelance-simulateur&utm_medium=referral&utm_campaign=readme)

Une idée, un bug, un taux qui a changé ? Ouvrez une issue.
