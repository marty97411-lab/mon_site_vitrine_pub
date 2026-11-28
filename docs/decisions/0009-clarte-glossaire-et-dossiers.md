# 0009. Clarté : glossaire, section « Explication » et dossiers thématiques

- **Statut** : accepté (2026-11-28)

## Contexte

Le site s'enrichit (traits, intérêts, philosophie, livres) et risque de devenir difficile à suivre :
jargon (Big Five, RIASEC, facette…), menu qui s'allonge, sujets qui se dispersent.

## Décisions

1. **Règle de simplicité** (prioritaire, inscrite dans CLAUDE.md) : chaque nouveau sujet entre dans
   la structure existante (trois niveaux, sections existantes), sans nouvel onglet de menu sauf
   nécessité, avec au plus une carte sur l'accueil.
2. **Glossaire centralisé** : `src/data/glossaire.json` (schéma `glossaireSchema`) est la source
   unique des définitions. Le composant `Definition` affiche, à la première apparition d'un terme
   sur une page, le terme cliquable vers `/glossaire#id` et une explication courte entre
   parenthèses. Le composant est écrit pour ne produire aucun espace parasite (dans le lien ou avant
   la ponctuation).
3. **« Comprendre » devient « Explication »** (`/explication`), avec redirection des anciennes
   adresses (`/comprendre`, `/comprendre/interets`). Le niveau de lecture « Comprendre » garde son
   nom.
4. **Dossiers thématiques** : un sujet vaste devient un dossier dans la section Explication, et non
   une nouvelle section. Premier dossier : « Introversion et extraversion »
   (`/explication/introversion-extraversion`) :
   - collection `introversion` (schéma `articleSchema`, `src/content/introversion/`) ;
   - une page sommaire et cinq pages courtes en trois niveaux, toutes en brouillon ;
   - accès : fiche Extraversion, lien contextuel sur la page de résultats, une carte sur l'accueil,
     carte de la section Explication et plan du site ;
   - les pages sont recommandables (identifiants `introversion/…` dans `recommandations.json`).
5. **Lien contextuel sur les résultats** : la page proposée dépend du score d'extraversion, avec les
   mêmes seuils éditoriaux que les suggestions de lecture (2,5 et 3,5). La phrase décrit une
   position (« plutôt du côté de… », « vers le milieu de l'échelle »), jamais une catégorie.
6. **Expérience courante ≠ preuve** : ce qui ne vient pas d'une étude vérifiée est signalé dans un
   encadré « Expérience courante, pas une preuve » ; les résultats d'articles dont seul le résumé ou
   les métadonnées ont été vérifiés ne sont pas chiffrés (TODO de relecture).
7. **Résumé détaillé des livres** : champ optionnel `resume_detaille`, affiché dans un bloc dépliable
   fermé par défaut ; texte fourni par l'équipe éditoriale, jamais rédigé automatiquement.
8. **Vouvoiement** contrôlé par `src/lib/vouvoiement.test.ts`.

## Conséquences

- Ajouter un terme au glossaire : l'entrée JSON, le type `TermeGlossaire` et la liste du test.
- Ajouter un dossier : une collection (schéma `articleSchema`), ses pages sous `/explication/…`, son
  contrôle des références dans `src/lib/contenu.ts` et, s'il est recommandable, l'extension de
  `idArticle`.
- Étymologie du nom (page À propos) : les dictionnaires de référence (CNRTL, Gaffiot) n'étaient pas
  accessibles ; les points non vérifiés sont marqués « à vérifier » (source
  `dictionnaire-etymologique`).
