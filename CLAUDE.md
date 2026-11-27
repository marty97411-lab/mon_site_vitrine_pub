# CLAUDE.md

Référence pour toutes les sessions de travail sur ce dépôt. À lire avant toute modification.

## Le projet

Site web en français d'aide à la réflexion sur l'orientation professionnelle, fondé sur la
personnalité :

1. le visiteur passe un questionnaire de personnalité ;
2. son profil est calculé **dans son navigateur** ;
3. le site propose des familles de métiers, en expliquant pourquoi le profil y correspond, avec
   les points forts et les points de vigilance du profil ;
4. les explications sont d'abord simples, puis détaillées et sourcées pour qui veut creuser.

**Ton** : sérieux, honnête, sans « vendre du rêve ». Le site dit clairement qu'un test de
personnalité est une aide à la réflexion, pas un verdict, et que la personnalité n'explique
qu'une partie de la réussite et de la satisfaction au travail.

## Principes scientifiques (non négociables)

- **Modèle** : Big Five (OCEAN) avec ses 30 facettes (structure de l'IPIP-NEO-120, Johnson 2014).
  **Pas de MBTI, pas d'ennéagramme, pas de « types »** : uniquement des scores continus (moyennes,
  percentiles), jamais des cases ni des seuils présentés comme des catégories.
- **Items** : uniquement des items libres de droits, en priorité l'IPIP (domaine public). Chaque
  item indique trait, facette, clé (`plus`/`moins`), source, licence et statut de traduction.
- **Deux questionnaires** : personnalité (Big Five) pour décrire le fonctionnement, intérêts
  (RIASEC, O*NET Interest Profiler) pour le rapprochement avec les métiers. **Le Big Five ne sert
  jamais à classer les métiers** ; il ne sert qu'à expliquer, et seulement avec une source vérifiée.
- **Deux parcours** : rapide (marqueurs de Goldberg 50 + Mini-IP 30) et complet (IPIP-NEO-120 +
  IP 60), décrits dans `src/data/parcours.json`. Un seul moteur, configuré par les fichiers de
  `src/data/questionnaires/`.
- **Rapprochement** : corrélation de profils RIASEC et seuils du manuel O*NET (0,729 / 0,608),
  libellés sans pourcentage, plusieurs familles (voir `docs/decisions/0005-…`). Pas de formule
  maison non justifiée.
- **Métiers** : base O*NET 31.0 (CC BY 4.0, attribution obligatoire), importée par
  `scripts/import-onet.mjs` ; à terme, correspondance vers le ROME (France Travail).
- **Licences des items** : IPIP = domaine public. O*NET Interest Profiler = **CC BY-ND 4.0** :
  items reproduits **à l'identique, en anglais** ; ne jamais les traduire ni les modifier sans
  étude de validation (O*NET Tools Developer License).
- **Pas de percentile** : l'IPIP déconseille les normes « toutes faites » ; on affiche la position
  sur l'échelle 1–5.
- **Toute affirmation affichée doit être reliée à une source** de
  `src/content/sources/sources.json` (référence avec DOI ou lien). Dans les fiches, une
  affirmation sans source doit porter `todo_source: true` ; sinon, le schéma la refuse.
- **Ne jamais inventer** de chiffres, de corrélations, de normes, de codes métiers ni de
  références. Si une donnée n'est pas sourcée : `TODO` explicite ou valeur `null`, jamais une
  valeur plausible. Une référence citée de mémoire reste au statut `a-verifier`.
- Vérifier la licence de chaque nouvelle source et la documenter dans `docs/sources.md`.
- Personnalité ≠ intérêts : le modèle RIASEC décrit des intérêts. Ne pas présenter un lien
  Big Five → métier comme établi sans source vérifiée.

## Choix techniques

- Astro (sortie statique) + TypeScript strict, sans framework d'interface.
- Calculs côté client uniquement ; réponses dans `localStorage` (reprise possible, bouton
  d'effacement). **Aucun** backend, base de données, cookie, analytics, compte ni ressource
  externe (CDN, polices distantes).
- Contenus dans les collections Astro, validés par des schémas Zod (`src/lib/schemas/`).
- Tests unitaires Vitest ; ESLint + Prettier.
- Accessibilité WCAG AA, mobile d'abord.
- Pas de dépendance lourde sans justification (à consigner dans `docs/decisions/`).

## Arborescence

```
src/
  content.config.ts      collections Astro (sources, questionnaires, parcours, traits, metiers)
  content/traits/        une fiche Markdown par trait Big Five
  content/metiers/       fiches métiers (Markdown + frontmatter structuré)
  content/sources/       sources.json : bibliographie, citée par identifiant
  data/questionnaires/   un JSON par questionnaire (items, clés, échelle, licence)
  data/parcours.json     parcours rapide et complet
  data/onet/             metiers.json (généré), familles.json, job-zones.json
  data/normes/           normes.json : non utilisé (pas de percentile)
  lib/big-five.ts        traits, 30 facettes, RIASEC
  lib/schemas/           schémas Zod (questionnaire, parcours, O*NET, trait, métier, source) + tests
  lib/scoring/           cotation (moyenne ou somme), code RIASEC, percentiles + tests
  lib/rapprochement/     corrélation de profils, seuils O*NET, familles + tests
  lib/contenu.ts         accès au contenu + contrôle des références au build
  lib/stockage.ts        localStorage
  pages/                 accueil, parcours, questionnaire/[parcours], résultats, la-science, sources,
                         a-propos, mentions-legales, traits, metiers
scripts/
  import-onet.mjs        import des profils RIASEC O*NET (CC BY 4.0)
docs/
  sources.md             sources, licences, statut de vérification
  methodologie-score.md  règles de calcul
  decisions/             décisions de conception (ADR)
```

## Commandes

```bash
npm install          # installer les dépendances (Node ≥ 22.23.4, voir .nvmrc)
npm run dev          # serveur de développement (http://localhost:4321)
npm run build        # vérification des types (astro check) + build statique dans dist/
npm run preview      # prévisualiser le build
npm test             # tests unitaires Vitest
npm run lint         # ESLint
npm run format       # Prettier (écriture) ; format:check pour vérifier
npm run import:onet  # régénérer src/data/onet/metiers.json (réseau requis)
```

Dans l'environnement cloud, le `fetch` de Node exige `NODE_USE_ENV_PROXY=1` pour passer par le
proxy : `NODE_USE_ENV_PROXY=1 npm run import:onet`.

Avant chaque commit : `npm run lint && npm test && npm run build`.

## Conventions

- **Langue** : tout le contenu visible, les commentaires et les messages de commit sont en
  français. Identifiants de code en français quand c'est naturel (`calculerProfil`, `facette`).
- **Code** : TypeScript strict, pas de `any`, `const`/`let`, fonctions pures pour la logique de
  score (pas d'accès au DOM ni à `astro:content` dans `src/lib/scoring/`).
- **Tests** : toute modification de la logique de score ou des schémas s'accompagne de tests.
  Les normes utilisées dans les tests sont fictives et marquées comme telles.
- **Contenus** :
  - les fiches d'exemple portent `statut: exemple` (métiers) ou `brouillon: true` (traits) ;
  - les traductions d'items portent `traduction.statut: "non-validee"` tant qu'aucune
    validation n'est citée ; les items O*NET sont en anglais (`"sans-objet"`) ;
  - un item commun à deux questionnaires garde le même identifiant (réponse réutilisée) ;
  - une nouvelle source s'ajoute d'abord dans `sources.json` (avec `statut`), puis dans
    `docs/sources.md`.
- **Accessibilité** : HTML sémantique, `lang="fr"`, labels sur tous les champs, focus visible,
  contraste AA, `prefers-reduced-motion` respecté.
- **Git** : petits commits explicites ; ne jamais committer de secrets.

## Points ouverts

Voir les sections « TODO » de `docs/sources.md` : vérification des DOI, adaptation française de
Thiry et Piolti (2023), liens sourcés personnalité → métiers, correspondance ROME, filtre par
niveau de préparation, choix de l'hébergeur.
