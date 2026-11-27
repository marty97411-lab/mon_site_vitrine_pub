# Méthodologie de calcul des scores

Code : `src/lib/scoring/`, tests : `src/lib/scoring/*.test.ts`.

## 1. Cotation des réponses

- Échelle de Likert de 1 (« Pas du tout d'accord ») à 5 (« Tout à fait d'accord »).
- Item à clé `plus` : valeur conservée. Item à clé `moins` (inversé) : valeur cotée `6 − x`.
- Toute valeur qui n'est pas un entier de 1 à 5 est refusée (erreur).

## 2. Scores d'échelle

- **Facette** : moyenne des items cotés de la facette.
- **Trait** : moyenne de **tous** les items cotés du trait. Lorsque toutes les facettes sont
  complètes et de même taille (4 items dans l'IPIP-NEO-120), c'est équivalent à la moyenne des
  facettes.
- **Données manquantes** : un score n'est calculé que si au moins 50 % des items de l'échelle ont
  une réponse (option `seuilCompletude`). Sinon, le score vaut `null`.
  - Le seuil de 50 % est un **choix de conception provisoire, non sourcé** (TODO : le justifier
    par la littérature ou l'ajuster).

## 3. Percentiles

- Le percentile est calculé à partir d'une norme (moyenne `m`, écart-type `s`) :
  `z = (score − m) / s`, puis `percentile = 100 × Φ(z)`, où Φ est la fonction de répartition de
  la loi normale.
- Cela **suppose une distribution normale** des scores dans la population de référence. TODO :
  si des tables de percentiles empiriques sont publiées, les préférer.
- Les normes sont dans `src/data/normes/normes.json`. **Tant qu'une valeur est `null` (non
  sourcée), aucun percentile n'est affiché.** Ne jamais y mettre de valeurs « plausibles ».
- Pour renseigner des normes, il faut : la source (dans `sources.json`), la population (pays,
  âge, effectif), et passer `statut` à `"verifie"`.

## 4. Ce que le score ne dit pas

Un score est une estimation qui comporte une erreur de mesure. Avec 2 items par trait, comme
dans le prototype, cette erreur est trop grande pour une interprétation. TODO : afficher à terme
un intervalle d'incertitude fondé sur la fidélité publiée des échelles.
