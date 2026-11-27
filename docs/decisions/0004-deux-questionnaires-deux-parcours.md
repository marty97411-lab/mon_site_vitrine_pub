# 0004. Deux questionnaires, deux parcours

- **Statut** : accepté (2026-11-27)

## Contexte

Le Big Five seul prédit mal le type de métier qui convient à une personne : ses liens avec les
intérêts professionnels RIASEC sont décrits comme modestes (Larson, Rottinghaus et Borgen, 2002 ;
Barrick, Mount et Gupta, 2003 — **références à vérifier**). Ce sont surtout les intérêts qui
orientent vers un métier.

## Décision

- Deux questionnaires par parcours : **personnalité** (décrire le fonctionnement) et **intérêts
  RIASEC** (rapprochement avec les métiers).
- Deux parcours au choix (`src/data/parcours.json`) :

  | Parcours | Personnalité                                            | Intérêts                                     | Total |
  | -------- | ------------------------------------------------------- | -------------------------------------------- | ----- |
  | Rapide   | IPIP Big-Five Factor Markers, 50 items (Goldberg, 1992) | O*NET Mini-IP, 30 items                      | 80    |
  | Complet  | IPIP-NEO-120, 120 items, 30 facettes (Johnson, 2014)    | O*NET Interest Profiler Short Form, 60 items | 180   |

  Les durées affichées (10 à 15 min, 25 à 30 min) sont des **estimations du projet**, à mesurer.

- **Un seul moteur** : chaque questionnaire est décrit par un fichier JSON
  (`src/data/questionnaires/`) qui fixe l'échelle, le mode d'agrégation (moyenne ou somme), le seuil
  de complétude, les facettes et les items. La cotation (`src/lib/scoring/`) et la page de
  questionnaire sont communes.
- **Items partagés** : un item présent dans deux questionnaires porte le même identifiant (même
  texte original). Sa réponse est enregistrée une fois et reprise : les 30 items du Mini-IP font
  partie de l'IP 60, et 14 items des marqueurs de Goldberg font partie de l'IPIP-NEO-120.
- **Facteur IV des marqueurs de Goldberg** : il mesure la stabilité émotionnelle ; les clés sont
  inversées pour l'exprimer en névrosisme, comme l'IPIP-NEO (voir le champ `note` des items).
- **Ordre de présentation** :
  - marqueurs de Goldberg et Mini-IP : ordre officiel publié ;
  - IPIP-NEO-120 : aucun ordre officiel ; le projet alterne les facettes (N1, E1, O1, A1, C1, N2…) ;
  - IP 60 : ordre du PDF officiel (l'ordre de la version web n'a pas été vérifié).

## Traductions et licences

- Items IPIP : domaine public, traduction du projet **non validée**. Une adaptation française
  européenne de l'IPIP-NEO-300 (Thiry et Piolti, 2023) est signalée par l'IPIP ; le projet a choisi
  de ne pas la consulter ni l'utiliser à ce stade (décision du 2026-11-27).
- Items O*NET : **traduits par le projet** (décision du 2026-11-27, qui remplace l'option « items en
  anglais »). La traduction est une modification : elle relève de l'O*NET Tools Developer License et
  non de la CC BY-ND. Le projet applique les obligations de cette licence :
  - mention de modification dans le pied de page, sur la page du questionnaire et dans le README ;
  - page « modifications et avertissements » (`/modifications-onet`) décrivant les modifications et
    reproduisant l'avertissement de non-responsabilité ;
  - texte original anglais affiché sous chaque question.
    **Obligation non remplie** : la licence exige une étude de validation _avant_ la diffusion d'une
    version modifiée. Elle n'a pas été réalisée ; à traiter avant toute mise en ligne publique.
- Libellés de réponse : IPIP « Ne me correspond pas du tout » … « Me correspond tout à fait »
  (adaptation de l'échelle d'exactitude « Very Inaccurate » … « Very Accurate ») ; O*NET
  « Je n'aimerais pas du tout » … « J'aimerais beaucoup ».
- Consigne IPIP : reprend celle de l'IPIP, y compris la comparaison aux personnes « de même sexe
  et d'âge proche » (décision du 2026-11-27).
- Items O6-01 et O6-03 (vote « liberal » / « conservative ») : adaptés en « de gauche » / « de
  droite » (adaptation culturelle, décision du 2026-11-27), signalée dans le champ `note`.
- **Pas d'écriture inclusive** (décision du 2026-11-27) : formes neutres quand elles sont naturelles,
  masculin générique sinon.
