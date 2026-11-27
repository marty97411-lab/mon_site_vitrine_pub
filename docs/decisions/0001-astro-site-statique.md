# 0001. Astro et site statique

- **Statut** : accepté (2026-11-27)

## Contexte

Le site doit être gratuit à héberger, rapide, accessible, et permettre d'enrichir les contenus
(traits, métiers, sources) sans toucher au code.

## Décision

- Astro en sortie statique (`output: 'static'`), TypeScript strict (`astro/tsconfigs/strictest`).
- Contenus dans des collections Astro (Markdown et JSON) validées par des schémas Zod définis dans
  `src/lib/schemas/`, réutilisables par les tests Vitest.
- Aucun framework d'interface (React, Vue…) : le questionnaire n'utilise que des scripts
  TypeScript simples.
- Le TypeScript utilisé reste en version 6.x, car `typescript-eslint` ne prend pas encore en
  charge la version 7.
- `compressHTML` désactivé : la compression supprimait l'espace entre un texte et un lien placé
  à la ligne suivante.

## Conséquences

Déploiement possible sur GitHub Pages, Netlify ou Vercel (à choisir, voir `astro.config.mjs`).
Pas de rendu côté serveur, donc aucune donnée utilisateur ne peut être traitée côté serveur.
