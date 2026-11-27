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
- **Métiers** : modèle RIASEC de Holland et données O*NET (CC BY 4.0, attribution obligatoire),
  avec à terme une correspondance vers le ROME (France Travail).
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
- Calculs côté client uniquement ; réponses dans `sessionStorage`. **Aucun** backend, base de
  données, cookie, analytics, compte ni ressource externe (CDN, polices distantes).
- Contenus dans les collections Astro, validés par des schémas Zod (`src/lib/schemas/`).
- Tests unitaires Vitest ; ESLint + Prettier.
- Accessibilité WCAG AA, mobile d'abord.
- Pas de dépendance lourde sans justification (à consigner dans `docs/decisions/`).

## Arborescence

```
src/
  content.config.ts      collections Astro (sources, items, traits, metiers)
  content/traits/        une fiche Markdown par trait Big Five
  content/metiers/       fiches métiers (Markdown + frontmatter structuré)
  content/sources/       sources.json : bibliographie, citée par identifiant
  data/items/            items.json : items du questionnaire
  data/normes/           normes.json : normes pour les percentiles (null = TODO)
  lib/big-five.ts        traits, 30 facettes, RIASEC
  lib/schemas/           schémas Zod (item, trait, métier, source, normes) + tests
  lib/scoring/           cotation, moyennes, percentiles + tests
  lib/contenu.ts         accès au contenu + contrôle des références au build
  lib/stockage.ts        sessionStorage
  pages/                 accueil, test, résultats, la-science, a-propos, mentions-legales, traits, metiers
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
```

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
    validation n'est citée ;
  - une nouvelle source s'ajoute d'abord dans `sources.json` (avec `statut`), puis dans
    `docs/sources.md`.
- **Accessibilité** : HTML sémantique, `lang="fr"`, labels sur tous les champs, focus visible,
  contraste AA, `prefers-reduced-motion` respecté.
- **Git** : petits commits explicites ; ne jamais committer de secrets.

## Points ouverts

Voir les sections « TODO » de `docs/sources.md` : normes, adaptation française validée des items,
algorithme de correspondance profil → métiers, questionnaire d'intérêts RIASEC, correspondance
ROME, choix de l'hébergeur.
