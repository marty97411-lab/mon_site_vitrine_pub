# CLAUDE.md

Référence pour toutes les sessions de travail sur ce dépôt. À lire avant toute modification.

> **Au début de chaque session, lire `README.md` en entier**, en particulier les sections
> **3** (principes non négociables), **4** (règles éditoriales), **8** (méthode de travail) et
> **10** (feuille de route et chantiers ouverts). Le README est la référence pour la vision et les
> règles ; ce fichier précise les conventions techniques et l'organisation du code. En cas de
> contradiction, suivre le README et corriger ce fichier.
>
> **À la fin de chaque session, mettre à jour les sections 9 (historique des décisions) et 10
> (feuille de route et chantiers ouverts) du README.**

## Le projet

**Personalis** (du latin _personalis_, « personnel ») : site web en français d'aide à la
réflexion sur l'orientation professionnelle et sur la vie que l'on veut mener :

1. le visiteur choisit un parcours (rapide ou complet) et répond à deux questionnaires :
   personnalité (Big Five) et intérêts professionnels (RIASEC) ;
2. son profil est calculé **dans son navigateur** ;
3. la personnalité sert à **décrire** (points forts, points de vigilance, environnements
   adaptés) ; les **intérêts RIASEC** servent au rapprochement avec plusieurs familles de métiers ;
4. les explications sont d'abord simples, puis détaillées et sourcées pour qui veut creuser ;
5. des contenus se lisent sans faire le test (menu : Accueil, Le test, Ma situation, Explication,
   Philosophie, Livres conseillés, À propos ; plus « Besoin d'en parler ? »).

**Ton** : sérieux, honnête, sans « vendre du rêve ». Le site dit clairement qu'un test de
personnalité est une aide à la réflexion, pas un verdict, et que la personnalité n'explique
qu'une partie de la réussite et de la satisfaction au travail.

## Règle de simplicité (prioritaire)

Le site ne doit **pas devenir plus compliqué** à mesure qu'on ajoute des sujets. Chaque nouveau
contenu s'intègre dans la structure existante (trois niveaux : L'essentiel / Comprendre /
Approfondir), **sans nouvel onglet dans le menu sauf nécessité**, et la page d'accueil reste simple
(au plus une carte par nouveau sujet).

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
- **Licences des items** : IPIP = domaine public. O*NET Interest Profiler = items **traduits** par
  le projet sous \**O*NET Tools Developer License** : garder le texte original intact, afficher la
  mention de modification (pied de page, questionnaire, README) et la page `/modifications-onet`.
  L'étude de validation exigée par la licence avant diffusion **n'est pas faite** : la signaler et
  ne pas présenter la traduction comme validée.
- **Pas d'écriture inclusive** (ni point médian ni doublets) : formes neutres si naturelles, sinon
  masculin générique.
- **Pas de percentile sans norme publiée et sourcée** : l'IPIP déconseille les normes « toutes
  faites » ; aucune norme n'est sourcée à ce jour (`src/data/normes/normes.json` reste à `null`),
  on affiche donc la position sur l'échelle 1–5.
- **Toute affirmation affichée doit être reliée à une source** de
  `src/content/sources/sources.json` (référence avec DOI ou lien). Dans les fiches, une
  affirmation sans source doit porter `todo_source: true` ; sinon, le schéma la refuse.
- Statuts de source : `verifie` (contenu contrôlé), `metadonnees-verifiees` (référence vérifiée
  dans Crossref, contenu non relu : affiché « contenu à relire »), `a-verifier`.
- **Ne jamais inventer** de chiffres, de corrélations, de normes, de codes métiers ni de
  références. Si une donnée n'est pas sourcée : `TODO` explicite ou valeur `null`, jamais une
  valeur plausible. Une référence citée de mémoire reste au statut `a-verifier`.
- Vérifier la licence de chaque nouvelle source et la documenter dans `docs/sources.md`.
- Personnalité ≠ intérêts : le modèle RIASEC décrit des intérêts. Ne pas présenter un lien
  Big Five → métier comme établi sans source vérifiée.

## Ton et structure des contenus

- **Vouvoiement partout** (pages, questionnaires, consignes, résultats, boutons, messages,
  fiches) ; vérifié automatiquement par `src/lib/vouvoiement.test.ts` (exceptions justifiées :
  citations historiques). Ton chaleureux, rassurant, mais toujours honnête : pas de promesse
  (« trouvez le métier de vos rêves »), pas de positivité forcée, pas de dramatisation.
- **Il n'existe pas de bon ou de mauvais profil** : chaque trait est présenté avec ses atouts et ses
  coûts (champs `atouts` et `couts`, sourcés ou `todo_source: true`).
- **Trois niveaux partout** :
  1. **L'essentiel** : une ou deux phrases simples, visibles tout de suite (`essentiel`) ;
  2. **Comprendre** : un paragraphe accessible, jargon expliqué (`comprendre`) ;
  3. **Approfondir** : détails, chiffres, limites et références, dans un bloc dépliable (corps
     Markdown).
- **Science / Réflexion** : badge « Science » pour ce qui résume la recherche, « Réflexion » pour la
  philosophie ; ne jamais mélanger les deux registres sans le dire.
- **Citations** : courtes, avec leur référence complète ; de préférence des œuvres ou traductions du
  domaine public vérifiées (Wikisource). Œuvres protégées : très courte citation ou simple
  présentation des idées.
- **Aucun visiteur perdu face au jargon** : à la première apparition d'un terme technique sur une
  page (Big Five, RIASEC, facette, percentile, O*NET, Job Zone…), utiliser le composant
  `<Definition terme="…" />` : terme cliquable vers `/glossaire` + explication courte entre
  parenthèses. Définitions centralisées dans `src/data/glossaire.json` (identiques partout).
- La section « Explication » (`/explication`) regroupe traits, intérêts, science du test, le
  dossier Introversion et extraversion et le glossaire. Ne pas la confondre avec le niveau de
  lecture « Comprendre » des trois niveaux, qui garde son nom. (Les anciennes URL `/comprendre`
  redirigent vers `/explication`, voir `astro.config.mjs`.)
- **Dossiers thématiques** : un sujet vaste devient un dossier de la section Explication (page
  sommaire + pages courtes en trois niveaux, une collection dédiée), pas une nouvelle section ni un
  nouvel onglet. Exemple : `/explication/introversion-extraversion` (ADR 0009). Ce qui relève de
  l'expérience courante est signalé dans un encadré « Expérience courante, pas une preuve ».
- Toute page mentionnant une situation difficile renvoie vers « Besoin d'en parler ? ».
- Les nouvelles pages de contenu portent `brouillon: true` jusqu'à relecture humaine.

## Charte graphique

- Tokens uniques dans `src/styles/tokens.css` (couleurs `--c-*`, typographies, espacements, rayons,
  ombres, durées). Ne jamais écrire une couleur en dur ailleurs.
- Contrastes WCAG AA vérifiés par `src/lib/contraste.test.ts` : toute nouvelle paire texte/fond
  doit y être ajoutée.
- Polices auto-hébergées via `@fontsource` (Atkinson Hyperlegible Next, Fraunces « soft ») ; aucun
  appel à un service de polices distant.
- Texte de base 18 px, lignes ≤ 68 caractères (`.lecture`, `--mesure`).
- Cartes arrondies, ombres légères, animations courtes, coupées par `prefers-reduced-motion`.
- Illustrations : formes abstraites SVG (`Illustration.astro`), jamais de photos de banque d'images.
- Graphiques : une seule teinte (violet), jamais de rouge/vert qui jugerait un score ; toujours une
  phrase explicative et une alternative textuelle (titre SVG, tableau de valeurs).
- Composants : `src/components/` (Bouton, Carte, CarteLivre, Essentiel, EnSavoirPlus, Source,
  Badge, FilAriane, Illustration, ScienceOuReflexion, ListeSources, Logo, Definition,
  Avertissement). Mise en page d'article :
  `src/layouts/Article.astro`.
- Vérifier le rendu à 375, 768 et 1280 px (aucun défilement horizontal).
- **Nom du site : « Personalis »** (du latin _personalis_), partout : logo, bouton d'accueil,
  titres, balises SEO et Open Graph, documents.
- **Mentions de licence discrètes** : pied de page réduit à une ligne courte avec un lien vers
  `/credits` (textes complets d'attribution O*NET, IPIP, polices, licences du site). La mention
  O*NET Tools reste affichée en entier sur la page du questionnaire d'intérêts (« launch screen »
  exigé par la licence), avec le lien « modifications and disclaimers ».
- Encadrés « Source » et listes de références : petits et atténués (≥ 15 px, contraste AA).
- L'encadré « Science ou réflexion ? » n'apparaît que sur la page d'accueil de la section
  Philosophie ; les pages individuelles portent seulement le badge.
- Page « Besoin d'en parler ? » : l'accompagnement professionnel en haut ; le 3114 en bas, sobre
  mais lisible (≥ 15 px), visible sans clic, lien `tel:` cliquable.

## Livres conseillés

- Collection `src/content/livres/livres.json` (schéma `livreSchema`). **N'ajouter un livre que s'il
  est vérifié** (titre, auteur, année, éditeur, ISBN quand il est connu) sur une notice ou un compte
  rendu, preuves dans `verification.preuves` ; sinon, ne pas l'ajouter. Jamais de livre ni de résumé
  inventés.
- Étiquette honnête : `recherche`, `philosophie` ou `temoignage` ; `note_controverse` obligatoire pour
  un livre populaire mais contesté ; écarter les ouvrages sans base (MBTI, typologies, méthodes
  « miracles »).
- Résumé, « pour qui » et « à garder en tête » rédigés par l'équipe ; `brouillon: true` jusqu'à
  relecture.
- **Résumé détaillé** (`resume_detaille`, menu déroulant « Résumé détaillé » fermé par défaut) :
  **fourni par l’équipe éditoriale du projet**, ne pas le rédiger soi-même.
- **Mise en page (identique pour tous les livres, modèles `src/pages/livres/[id].astro` et
  `src/components/CarteLivre.astro`)** :
  - carte de la liste : entièrement cliquable vers la fiche ; petite étiquette discrète « Résumé
    détaillé disponible » seulement si `resume_detaille` existe ;
  - fiche : bloc « L'essentiel » = bref résumé + ligne « pour qui » (le texte de `pour_qui`
    commence par « Pour qui… » ou « Pour les… ») ; pas de section « Pour qui ? » séparée ; puis le
    menu « Résumé détaillé » ; « Ce qu'il faut garder en tête » est secondaire et discret, comme
    les encadrés « Source » (≥ 15 px, couleur atténuée, contraste AA).
- Liens : DOI ou Wikisource si vérifiés, plus recherches BnF et Amazon **sans affiliation**.
- **Auteurs non encore vérifiés** (`src/content/livres/auteurs-a-verifier.json`) : on peut citer
  l'auteur, son domaine et une note de prudence, **jamais un titre de livre précis**, avec la mention
  « références en cours de vérification ». Dès qu'un livre est vérifié, il passe dans `livres.json`
  et l'auteur sort de cette liste.
- **Livres en anglais** : possibles en petit nombre quand aucune édition française n'est vérifiable
  (`langue: "en"`, signalé sur la carte et la fiche) ; mêmes exigences de vérification.

## Suggestions de lecture (recommandations)

- Règles **uniquement** dans `src/data/recommandations.json`, jamais en dur dans le code ; moteur pur
  `src/lib/recommandations/` avec tests.
- Seuils éditoriaux : 3,5 / 2,5 (traits, échelle 1–5) et 25 % (différenciation RIASEC) ; ne jamais les
  présenter comme des catégories.
- Toujours afficher la raison de chaque suggestion, la phrase « pistes choisies par l'équipe, pas un
  résultat scientifique », le lien vers `/suggestions` et des liens vers les listes complètes.
- Toute référence d'une règle doit exister (contrôle au build dans `src/lib/contenu.ts` et test).

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
  content.config.ts      collections Astro (sources, questionnaires, parcours, traits, metiers,
                         situations, philosophie, introversion, livres, auteurs)
  content/traits/        une fiche Markdown par trait Big Five (trois niveaux, atouts / coûts)
  content/situations/    pages « Ma situation » (badge Science)
  content/philosophie/   pages « Philosophie » (badge Réflexion)
  content/introversion/  dossier « Introversion et extraversion » (5 pages, badge Science)
  content/metiers/       fiches métiers (Markdown + frontmatter structuré)
  content/sources/       sources.json : bibliographie, citée par identifiant
  content/livres/        livres.json : livres conseillés (vérifiés, étiquetés)
  data/recommandations.json  règles des suggestions de lecture
  data/glossaire.json    définitions des termes techniques (source unique)
  data/questionnaires/   un JSON par questionnaire (items, clés, échelle, licence)
  data/parcours.json     parcours rapide et complet
  data/onet/             metiers.json (généré), familles.json, job-zones.json
  data/normes/           normes.json : non utilisé (pas de percentile)
  lib/big-five.ts        traits, 30 facettes, RIASEC
  lib/schemas/           schémas Zod (questionnaire, parcours, O*NET, trait, métier, source) + tests
  lib/scoring/           cotation (moyenne ou somme), code RIASEC, percentiles + tests
  lib/rapprochement/     corrélation de profils, seuils O*NET, familles + tests
  lib/contenu.ts         accès au contenu + contrôle des références au build
  lib/integrite.ts       contrôle d'intégrité des sources citées (+ tests)
  lib/sources.ts         libellés des statuts de vérification des sources
  lib/glossaire.ts       accès au glossaire (+ tests)
  lib/texte.ts           mise en forme de texte (italiques) (+ tests)
  lib/stockage.ts        localStorage
  lib/contraste.ts       calcul des contrastes WCAG (+ test sur tokens.css)
  lib/visualisation.ts   géométrie des barres et de l'hexagone RIASEC (+ tests)
  lib/lecture.ts         temps de lecture estimé
  lib/isbn.ts            validation des ISBN, liens de recherche BnF et Amazon (+ tests)
  lib/recommandations/   moteur des suggestions de lecture (+ tests)
  styles/tokens.css      design tokens (source unique)
  components/, layouts/  composants et mises en page (Base, Article)
  pages/                 accueil, parcours, questionnaire/[parcours], résultats, situations,
                         philosophie, traits, la-science, besoin-d-en-parler,
                         plan-du-site, sources, a-propos, mentions-legales, metiers, livres,
                         suggestions, credits, glossaire ; section explication/ (index,
                         intérêts, dossier introversion-extraversion/)
scripts/
  import-onet.mjs        import des profils RIASEC O*NET (CC BY 4.0)
  doc-sources.mjs        génération de docs/sources.md depuis sources.json
  lib/                   utilitaires des scripts (lecture CSV, + tests)
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
npm run doc:sources  # régénérer docs/sources.md depuis sources.json (après toute modification)
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
    validation n'est citée (c'est le cas de tous les items actuels, IPIP comme O*NET) ;
  - un item commun à deux questionnaires garde le même identifiant (réponse réutilisée) ;
  - une nouvelle source s'ajoute dans `sources.json` (avec `statut`), puis `npm run doc:sources`
    régénère `docs/sources.md`.
- **Accessibilité** : HTML sémantique, `lang="fr"`, labels sur tous les champs, focus visible,
  contraste AA, `prefers-reduced-motion` respecté.
- **Git** : branche dédiée et petits commits explicites en français (voir README, section 8) ; ne
  jamais committer de secrets.

## Points ouverts

Liste tenue à jour : section 10 du `README.md`. Détails : voir les sections « TODO » de `docs/sources.md` : relecture du contenu des articles cités
(statut `metadonnees-verifiees`), relecture des brouillons, étude de validation de la traduction
O*NET (avant toute mise en ligne publique), liens sourcés personnalité → métiers, origine du
diagramme de l'ikigai, étymologie de « Personalis » (note de la page À propos), ISBN manquants
des livres, correspondance ROME, nom de domaine (sitemap, Open Graph), hébergeur.
