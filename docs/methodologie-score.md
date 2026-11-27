# Méthodologie de calcul des scores

Code : `src/lib/scoring/`, tests : `src/lib/scoring/*.test.ts`. Chaque questionnaire est décrit
par un fichier de `src/data/questionnaires/` (échelle, agrégation, seuil, items).

## 1. Personnalité (IPIP-NEO-120 et Big-Five Factor Markers)

- Réponses de 1 (« Très inexact ») à 5 (« Très exact »), selon la consigne IPIP.
- Item à clé `plus` : valeur conservée ; item à clé `moins` : `min + max − x` (soit `6 − x`).
- **Score** : moyenne des items cotés. L'IPIP indique de sommer ; la moyenne est une transformation
  linéaire de la somme quand toutes les réponses sont données, et reste sur l'échelle 1–5.
- **Facettes** (parcours complet) : moyenne des 4 items de la facette ; trait = moyenne de ses
  24 items.
- **Données manquantes** : le questionnaire exige une réponse à chaque question. Le moteur accepte
  néanmoins un seuil de complétude (50 % par défaut pour l'IPIP, **choix provisoire non sourcé**).
- Facteur IV des marqueurs (stabilité émotionnelle) exprimé en névrosisme par inversion des clés.

## 2. Intérêts (O*NET Interest Profiler et Mini-IP)

- Réponses de 0 (« Strongly Dislike ») à 4 (« Strongly Like ») ; aucun item inversé.
- **Score** : somme par dimension (0 à 40 pour l'IP 60, 0 à 20 pour le Mini-IP), selon le manuel
  O*NET (chapitre 3). Une somme exige toutes les réponses.
- **Code à trois lettres** : les trois dimensions les plus élevées. En cas d'égalité, l'ordre
  R-I-A-S-E-C départage et l'égalité est signalée ; le manuel laisse la personne choisir.

## 3. Pas de percentile

Le site n'affiche pas de percentile (décision du 2026-11-27) : l'IPIP ne fournit pas de normes et
déconseille les normes « toutes faites » (<https://ipip.ori.org/newNorms.htm>). Le code de
conversion (`percentiles.ts`) et le fichier `src/data/normes/normes.json` (vide) sont conservés pour
un éventuel usage futur avec des normes sourcées et adaptées.

## 4. Ce que le score ne dit pas

Un score est une estimation qui comporte une erreur de mesure, plus grande dans le parcours rapide.
TODO : afficher un intervalle d'incertitude fondé sur la fidélité publiée des échelles.
