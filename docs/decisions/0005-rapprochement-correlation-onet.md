# 0005. Rapprochement profil → métiers par corrélation (méthode O*NET)

- **Statut** : accepté (2026-11-27)

## Décision

Le site reprend la méthode documentée dans le manuel de l'O*NET Interest Profiler (Rounds, Hoff et
Lewis, 2021, chapitre 2, d'après Gregory et Lewis, 2016) :

1. **Indice** : corrélation de Pearson entre le profil RIASEC de la personne (6 sommes) et le
   profil « Occupational Interests » de chaque métier (6 scores de 1 à 7, base O*NET 31.0). La
   corrélation mesure la similarité de **forme** et non de niveau, ce qui rend inutile toute mise à
   l'échelle entre les deux profils.
2. **Seuils** (manuel O*NET) :

   | Corrélation       | O*NET       | Libellé sur le site       |
   | ----------------- | ----------- | ------------------------- |
   | r ≥ 0,729         | Best Fit    | Correspondance très forte |
   | 0,608 ≤ r < 0,729 | Great Fit   | Correspondance forte      |
   | 0 ≤ r < 0,608     | Good Fit    | Correspondance modérée    |
   | r < 0             | non affiché | non affiché               |

3. **Profil plat** (toutes les dimensions égales, par exemple « strongly dislike » partout) : la
   corrélation n'est pas définie ; le site affiche un message invitant à reprendre le questionnaire,
   comme la règle 9 du manuel.

Code : `src/lib/rapprochement/`, tests : `src/lib/rapprochement/rapprochement.test.ts`.

## Choix de présentation (propres au projet)

- **Pas de pourcentage** : uniquement les trois libellés ci-dessus.
- **Plusieurs familles** : les métiers sont regroupés par famille O*NET (les 2 premiers chiffres du
  code SOC, 22 familles). Les familles sont triées selon leur métier le mieux classé ; le site en
  affiche 6, avec au plus 5 métiers chacune. Ce tri est un choix d'affichage, pas une formule de
  score.
- O*NET présente aussi les résultats par niveau de préparation (Job Zone) ; le site affiche ce
  niveau pour chaque métier mais ne filtre pas encore dessus (TODO).
- La famille 55 (« Military Specific ») est exclue à l'import.

## Limites

- Les seuils ont été établis pour des profils de métiers notés par des experts ; dans la base
  O*NET 31.0, ces profils sont produits par « Machine Learning/Expert ». L'effet de ce changement
  sur les seuils n'est pas documenté ici (TODO : vérifier dans les rapports O*NET).
- Le Big Five **n'intervient pas** dans le classement. Il ne servira qu'à expliquer, lorsqu'une
  source vérifiée le permet.
- Work Styles O*NET 31.0 : non utilisés. Cette version introduit une nouvelle grille de 21 styles,
  notée « AI/Expert », sans correspondance officielle avec le Big Five.
- Intitulés en anglais ; correspondance O*NET → ROME à faire (TODO).

## Données

`scripts/import-onet.mjs` télécharge `career_interest_types.csv`, `occupation_data.csv` et
`job_zones.csv` (O*NET 31.0, CC BY 4.0) et génère `src/data/onet/metiers.json` (923 métiers). Dans
l'environnement de développement cloud, lancer `NODE_USE_ENV_PROXY=1 node scripts/import-onet.mjs`.
