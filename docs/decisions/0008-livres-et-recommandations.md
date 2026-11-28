# 0008. Livres conseillés et suggestions de lecture selon le profil

- **Statut** : accepté (2026-11-28)

## Livres conseillés

- Collection `livres` (`src/content/livres/livres.json`, schéma `src/lib/schemas/livre.ts`).
- **Vérification obligatoire** : titre, auteur, année, éditeur et ISBN (quand il est connu) vérifiés
  sur une notice Crossref (Cairn, Mardaga, presses universitaires), un compte rendu publié dans une
  revue (qui donne éditeur et année), ou Wikisource pour les textes du domaine public. Les preuves
  sont listées dans `verification.preuves`. Un livre non vérifiable n'est pas ajouté.
  - Les catalogues BnF et Open Library n'étaient pas accessibles depuis l'environnement de travail ;
    les ISBN manquants sont signalés dans `verification.reste_a_verifier`.
  - Les ISBN présents sont contrôlés (clé de contrôle) par le schéma.
- **Étiquettes** : « Fondé sur la recherche », « Philosophie », « Témoignage / inspiration ». Un
  livre populaire mais contesté porte une `note_controverse` ; les ouvrages sans base solide sont
  écartés.
- **Résumés, « pour qui », « à garder en tête »** rédigés par l'équipe, jamais copiés ; fiches au
  statut brouillon jusqu'à relecture.
- **Liens** : lien vérifié (DOI ou Wikisource) quand il existe, plus une recherche dans le catalogue
  de la BnF et une recherche Amazon, **sans affiliation** et sans rien charger depuis ces sites
  (décision du 2026-11-28). Le format du lien de recherche BnF n'a pas pu être testé (TODO).

## Suggestions de lecture

- Règles dans `src/data/recommandations.json` (schéma `src/lib/schemas/recommandations.ts`),
  moteur pur et testé dans `src/lib/recommandations/`.
- Conditions : score d'un trait (minimum ou maximum sur 1–5), dimension RIASEC dominante, profil
  RIASEC peu différencié (écart max − min ≤ 25 % du score maximal), règle « toujours ».
- Seuils validés le 2026-11-28 : 3,5 (plutôt élevé) et 2,5 (plutôt bas) pour les traits, 25 % pour
  la différenciation RIASEC. Ce sont des **choix éditoriaux pour sélectionner des lectures**, jamais
  présentés comme des catégories de personnalité.
- Règles appliquées dans l'ordre ; doublons fusionnés (raisons cumulées) ; 2 à 4 articles et 2 à 4
  livres ; la règle « toujours » ne sert qu'à compléter jusqu'au minimum.
- Sur la page de résultats : chaque suggestion affiche sa raison ; une phrase précise qu'il s'agit
  de pistes choisies par l'équipe, avec un lien vers `/suggestions`, page générée depuis le JSON.
- Calcul dans le navigateur ; rien n'est envoyé.
