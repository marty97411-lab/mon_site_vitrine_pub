# CLAUDE.md

Ce fichier guide Claude Code (et tout contributeur) lorsqu'il travaille sur ce dépôt.

## Présentation du projet

**mon_site_vitrine_pub** est un site vitrine statique.

- **Technologies** : HTML5, CSS3 et JavaScript natif (vanilla) uniquement.
- **Aucun framework ni bibliothèque** : pas de React, Vue, Bootstrap, Tailwind, jQuery, etc.
- **Aucun outil de build** : pas de npm, bundler ou préprocesseur (Sass, TypeScript…). Les fichiers sont servis tels quels.
- **Langue** : tout le contenu visible (textes, attributs `alt`, `title`, `aria-label`, messages) est rédigé en **français**. Les commentaires dans le code sont également en français.
- **Design** : sobre, épuré et professionnel.
- **Responsive** : le site doit s'afficher correctement sur mobile, tablette et ordinateur.

## Structure recommandée

```
/
├── index.html          # Page d'accueil
├── *.html              # Autres pages (services.html, contact.html, …)
├── css/
│   └── style.css       # Feuille de style principale
├── js/
│   └── main.js         # Scripts du site
├── images/             # Images optimisées (WebP/JPEG/PNG/SVG)
├── CLAUDE.md
└── README.md
```

## Conventions HTML

- Déclarer `<!DOCTYPE html>` et `<html lang="fr">`.
- Inclure `<meta charset="UTF-8">` et `<meta name="viewport" content="width=device-width, initial-scale=1">`.
- Renseigner un `<title>` et une `<meta name="description">` pertinents pour chaque page.
- Utiliser des balises sémantiques : `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`.
- Une seule balise `<h1>` par page, hiérarchie de titres respectée.
- Toutes les images ont un attribut `alt` descriptif en français (vide si purement décoratives).
- Indentation de 2 espaces.

## Conventions CSS

- Approche **mobile first** : styles de base pour mobile, puis `@media (min-width: …)` pour les écrans plus larges.
- Points de rupture indicatifs : `600px` (tablette), `1024px` (ordinateur).
- Centraliser couleurs, typographies et espacements dans des **variables CSS** (`:root { --couleur-primaire: …; }`).
- Mises en page avec **Flexbox** et **CSS Grid** ; éviter les positionnements fixes en pixels pour la structure.
- Unités relatives privilégiées (`rem`, `%`, `vw`, `clamp()`).
- Noms de classes clairs et cohérents (kebab-case, ex. `.carte-service`, `.menu-principal`).
- Pas de `!important` sauf nécessité absolue.

## Charte graphique (design sobre)

- Palette restreinte : 1 couleur principale, 1 couleur d'accent, des neutres (blanc, gris, quasi-noir).
- Typographie lisible : une ou deux polices maximum (polices système ou une police web légère).
- Beaucoup d'espace blanc, alignements nets, peu d'effets.
- Animations discrètes et courtes ; respecter `prefers-reduced-motion`.
- Contrastes conformes WCAG AA (ratio ≥ 4.5:1 pour le texte courant).

## Conventions JavaScript

- JavaScript natif moderne (ES6+), sans dépendance externe.
- Charger les scripts avec `defer`.
- Le site doit rester utilisable si JavaScript est désactivé (amélioration progressive).
- Usages typiques : menu burger mobile, défilement doux, validation de formulaire, petites interactions.
- Utiliser `const`/`let`, jamais `var` ; préférer `addEventListener` aux attributs `onclick`.

## Accessibilité et performance

- Navigation au clavier possible, focus visible.
- Attributs ARIA uniquement lorsque le HTML sémantique ne suffit pas (ex. `aria-expanded` sur le bouton du menu).
- Images compressées, dimensions `width`/`height` renseignées, `loading="lazy"` hors de la zone visible initiale.
- Limiter le nombre de requêtes et le poids total des pages.

## Tester le site en local

Aucune installation n'est nécessaire : ouvrir `index.html` dans un navigateur, ou lancer un petit serveur local :

```bash
python3 -m http.server 8000
# puis ouvrir http://localhost:8000
```

Vérifier systématiquement l'affichage en largeur mobile (~375px), tablette (~768px) et ordinateur (≥1280px).

## Règles pour Claude

- Ne jamais introduire de framework, de bibliothèque ou d'outil de build sans demande explicite.
- Rédiger tout nouveau contenu en français correct (accents, typographie française : espace avant `:`, `;`, `!`, `?`).
- Conserver la cohérence visuelle avec l'existant (réutiliser les variables CSS).
- Garder le code simple, lisible et commenté lorsque c'est utile.
