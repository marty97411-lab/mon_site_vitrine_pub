# Sources scientifiques et données

Liste des sources, avec leur licence et leur statut de vérification. La version qui fait foi pour
le site est `src/content/sources/sources.json` (validée par schéma au build) ; ce document en
donne la vue d'ensemble.

**Statuts**

- ✅ **Vérifié** : source ou page consultée directement, à la date indiquée (2026-11-27 sauf mention).
- ⚠️ **À vérifier** : référence citée de mémoire, incomplète ou non consultée. Ne pas s'appuyer
  dessus pour une affirmation tant qu'elle n'est pas vérifiée.

L'environnement de travail n'a pas accès à doi.org ni à Crossref : **aucun DOI n'a pu être
vérifié**.

## Questionnaires de personnalité (IPIP, domaine public)

| Id                  | Source                                                                                                              | Statut     | Notes                                                                                                                                                                                                                      |
| ------------------- | ------------------------------------------------------------------------------------------------------------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ipip`              | International Personality Item Pool, <https://ipip.ori.org/>                                                        | ✅         | Domaine public : « permission has already been automatically granted for any person to use IPIP items, scales, and inventories for any purpose, commercial or non-commercial » (<https://ipip.ori.org/newPermission.htm>). |
| `johnson-2014`      | Johnson (2014), IPIP-NEO-120, _J. Research in Personality, 51_, 78-89                                               | ⚠️ partiel | Référence et 120 items avec leurs clés vérifiés sur <https://ipip.ori.org/30FacetNEO-PI-RItems.htm>. DOI non vérifié.                                                                                                      |
| `goldberg-1992`     | Goldberg (1992), The development of markers for the Big-Five factor structure, _Psychological Assessment, 4_, 26-42 | ⚠️ partiel | Référence vérifiée telle que citée par l'IPIP. DOI non vérifié.                                                                                                                                                            |
| `ipip-bffm-50`      | 50-item Sample Questionnaire, <https://ipip.ori.org/New_IPIP-50-item-scale.htm>                                     | ✅         | Ordre officiel, clés, consigne. Clés recoupées avec <https://ipip.ori.org/newBigFive5broadKey.htm>.                                                                                                                        |
| `ipip-scoring`      | Scoring Instructions, <https://ipip.ori.org/newScoringInstructions.htm>                                             | ✅         | Échelle 1-5 « Very Inaccurate » … « Very Accurate », inversion, somme.                                                                                                                                                     |
| `ipip-normes`       | Norms and Data Sets, <https://ipip.ori.org/newNorms.htm>                                                            | ✅         | L'IPIP ne fournit pas de normes et déconseille les normes « toutes faites ». Données brutes de Johnson sur OSF (non consultées).                                                                                           |
| `ipip-traductions`  | Item Translations, <https://ipip.ori.org/newItemTranslations.htm>                                                   | ✅         | Traduction québécoise de l'IPIP-NEO-300 (Gravel) et adaptation européenne (Thiry et Piolti, 2023). Aucune traduction française des 50 marqueurs.                                                                           |
| `thiry-piolti-2023` | Adaptation en français européen de l'IPIP-NEO-300                                                                   | ⚠️         | Non consulté ; non utilisé par décision du projet (2026-11-27).                                                                                                                                                            |

## Questionnaires d'intérêts (O*NET Interest Profiler)

| Id                          | Source                                                               | Licence                                    | Statut | Notes                                                                                                                                                                                           |
| --------------------------- | -------------------------------------------------------------------- | ------------------------------------------ | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `onet-ip-manual-2021`       | Rounds, Hoff et Lewis (dir.), *O*NET Interest Profiler Manual*, 2021 | —                                          | ✅     | Cotation (ch. 3) et rapprochement par corrélation avec seuils (ch. 2).                                                                                                                          |
| `rounds-2016-mini-ip`       | Rounds et coll. (2016), Mini-IP                                      | —                                          | ✅     | 30 items et ordre (annexe A). Forme du nom d'un auteur à vérifier.                                                                                                                              |
| `onet-ip-short-form`        | Interest Profiler Short Form (PDF)                                   | Tools Developer License (version traduite) | ✅     | 60 items et leur dimension.                                                                                                                                                                     |
| `onet-career-tools-licence` | Career Exploration Tools Content License                             | CC BY-ND 4.0 / Tools Developer License     | ✅     | Toute modification, **traduction comprise**, relève de la Tools Developer License, qui exige une étude de validation préalable. Items traduits par décision du projet : **étude non réalisée**. |
| `onet-tools-licence`        | O*NET Tools Developer License                                        | —                                          | ✅     | Clause « Validation » lue.                                                                                                                                                                      |
| `gregory-lewis-2016`        | Rapport technique sur le rapprochement (cité par le manuel)          | —                                          | ⚠️     | Non consulté.                                                                                                                                                                                   |

## Métiers (base O*NET)

| Id                    | Source                             | Licence                | Statut       | Notes                                                                                                                                                                                       |
| --------------------- | ---------------------------------- | ---------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `onet-31`             | O*NET 31.0 Database                | CC BY 4.0              | ✅           | Fichiers `career_interest_types`, `occupation_data`, `job_zones`, `job_zone_reference` consultés. Profils d'intérêts produits par « Machine Learning/Expert ». Attribution en pied de page. |
| `onet-familles`       | O*NET OnLine, Browse by Job Family | —                      | ✅           | 22 familles utilisées (la 55, militaire, est exclue).                                                                                                                                       |
| `onet-online`         | O*NET OnLine                       | ⚠️ licence à lire      | ✅ (contenu) | Codes des fiches d'exemple.                                                                                                                                                                 |
| `rome-france-travail` | ROME, France Travail               | ⚠️ Etalab 2.0 supposée | ⚠️           | TODO : correspondance O*NET → ROME.                                                                                                                                                         |

## Liens entre personnalité, intérêts et travail

| Id                         | Source                                                                      | Statut | Notes                                                                              |
| -------------------------- | --------------------------------------------------------------------------- | ------ | ---------------------------------------------------------------------------------- |
| `larson-2002`              | Larson, Rottinghaus et Borgen (2002), _J. Vocational Behavior, 61_, 217-239 | ⚠️     | Cité sur la page « la science derrière » avec la mention « référence à vérifier ». |
| `barrick-mount-gupta-2003` | Barrick, Mount et Gupta (2003), _Personnel Psychology, 56_, 45-74           | ⚠️     | Idem.                                                                              |
| `barrick-mount-1991`       | Barrick et Mount (1991), _Personnel Psychology, 44_, 1-26                   | ⚠️     | —                                                                                  |
| `holland-1997`             | Holland (1997), _Making vocational choices_                                 | ⚠️     | —                                                                                  |
| `armstrong-2008`           | Armstrong, Allison et Rounds (2008)                                         | ⚠️     | Piste écartée à l'étape 2.                                                         |

## Méthodes

| Id                       | Source                        | Statut | Notes                                                    |
| ------------------------ | ----------------------------- | ------ | -------------------------------------------------------- |
| `abramowitz-stegun-1964` | Approximation de erf (7.1.26) | ⚠️     | Utilisée par `percentiles.ts`, actuellement non affiché. |

## Données encore manquantes (TODO)

- Vérification des DOI et métadonnées des articles (Crossref ou accès aux éditeurs).
- Étude de validation de la traduction des questionnaires O*NET (exigée par leur licence avant diffusion).
- Sources permettant de relier un trait de personnalité à un atout ou une vigilance dans un métier.
- Sources pour l'avertissement « la personnalité n'explique qu'une partie de la réussite et de la
  satisfaction au travail ».
- Correspondance O*NET → ROME et intitulés français.
- Effet du passage à des profils « Machine Learning/Expert » sur les seuils (seuils gardés et signalés).
