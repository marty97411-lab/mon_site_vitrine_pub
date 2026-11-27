# 0007. Identité visuelle « Personnalisé » et contenus en trois niveaux

- **Statut** : accepté (2026-11-27)

## Identité visuelle

- **Nom et logo** : « Personnalisé ». Logotype en Fraunces précédé de deux cercles qui se
  chevauchent (violet et pêche, « deux facettes d'une même personne »). Fichiers :
  `src/components/Logo.astro`, `public/logo-personnalise.svg`, `public/favicon.svg`,
  `public/og-personnalise.png` (image de partage 1200 × 630).
- **Palette** : définie uniquement dans `src/styles/tokens.css` (préfixe `--c-`). Fond crème
  lumineux, violet vif `#5A3FD9` en couleur principale, pêche `#FF9E6D` en couleur secondaire
  décorative, bleu-vert pour le badge « Science », ambre pour le badge « Réflexion ». Contrastes
  WCAG AA vérifiés par `src/lib/contraste.test.ts` (modes clair et sombre). Aucune couleur rouge/vert
  ne qualifie un score.
- **Typographies** auto-hébergées (paquets `@fontsource`, licence OFL, aucun appel à Google Fonts) :
  Atkinson Hyperlegible Next pour le texte (18 px), Fraunces (variante « soft ») pour les titres.
  Lignes limitées à 68 caractères (`--mesure`).
- **Mise en page** : cartes arrondies, ombres légères, animations courtes coupées par
  `prefers-reduced-motion`. Mode sombre automatique, le mode clair restant prioritaire.
- **Illustrations** : formes abstraites en SVG (`Illustration.astro`), aucune photo.
- **Composants** : Bouton, Carte, Essentiel, EnSavoirPlus, Source, Badge, FilAriane, Illustration,
  ScienceOuReflexion ; barres et hexagone des résultats générés côté client
  (`src/lib/visualisation.ts`, testé).

## Contenus

- **Trois niveaux partout** : « L'essentiel » (visible), « Comprendre » (visible), « Approfondir »
  (dépliable, corps Markdown). Schéma `articleSchema` (`src/lib/schemas/article.ts`) et mise en page
  `src/layouts/Article.astro`.
- **Ton** : chaleureux, rassurant, honnête ; **vouvoiement** (décision du 2026-11-27, qui remplace le
  tutoiement proposé) ; pas de promesse, pas de positivité forcée ; chaque trait a ses atouts et
  ses coûts.
- **Science / Réflexion** : badges distincts ; encadré explicatif sur les pages de philosophie.
- **Nouvelles sections** : « Ma situation » (4 pages), « Philosophie » (6 pages), « Besoin d'en
  parler ? », « Comprendre », « Intérêts professionnels », plan du site. Tous les articles sont des
  brouillons à relire (`brouillon: true`).
- **Statut de source « metadonnees-verifiees »** : référence vérifiée dans Crossref, contenu non
  relu. Affiché « contenu à relire ».
- **Référencement** : titres, descriptions, Open Graph. URL canonique, `og:url`, `og:image` et
  `sitemap.xml` en attente du nom de domaine (TODO).
