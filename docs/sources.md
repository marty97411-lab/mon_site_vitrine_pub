# Sources scientifiques et données

Liste des sources envisagées, avec leur licence et leur statut. La version qui fait foi pour le
site est `src/content/sources/sources.json` (validée par schéma au build) ; ce document en donne
la vue d'ensemble et le suivi des vérifications.

**Statuts**

- ✅ **Vérifié** : la source (ou la page de licence) a été consultée directement, à la date indiquée.
- ⚠️ **À vérifier** : référence citée de mémoire ou incomplète. Ne pas s'appuyer dessus pour
  afficher une affirmation tant qu'elle n'est pas vérifiée.

## Personnalité (Big Five)

| Id             | Source                                                                                                                                                                                             | Licence                | Statut           | Notes                                                                                                                                                                                                                                                                                 |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ipip`         | International Personality Item Pool, <https://ipip.ori.org/>                                                                                                                                       | Domaine public         | ✅ 2026-11-27    | Page de permission : « Because the IPIP has been placed in the public domain, permission has already been automatically granted for any person to use IPIP items, scales, and inventories for any purpose, commercial or non-commercial. » (<https://ipip.ori.org/newPermission.htm>) |
| `johnson-2014` | Johnson, J. A. (2014). Measuring thirty facets of the Five Factor Model with a 120-item public domain inventory: Development of the IPIP-NEO-120. _Journal of Research in Personality, 51_, 78-89. | Items : domaine public | ⚠️ partiellement | Référence et liste des 120 items (avec leur clé) vérifiées sur <https://ipip.ori.org/30FacetNEO-PI-RItems.htm>. **DOI (10.1016/j.jrp.2014.05.003) non vérifié.** Vérifier si l'article publie des normes.                                                                             |

## Intérêts professionnels et métiers

| Id                    | Source                                                                                                                                                                             | Licence                                              | Statut                    | Notes                                                                                                                                                                                                  |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `onet-31`             | O*NET 31.0 Database, USDOL/ETA, <https://www.onetcenter.org/database.html>                                                                                                         | CC BY 4.0                                            | ✅ 2026-11-27             | Licence : <https://www.onetcenter.org/license_db.html>. Attribution obligatoire (texte repris dans le pied de page du site). La licence couvre **uniquement les fichiers téléchargeables** de la base. |
| `onet-online`         | O*NET OnLine, <https://www.onetonline.org/>                                                                                                                                        | ⚠️ « O*NET Resource Center Content License », à lire | ✅ 2026-11-27 (contenu)   | Utilisé pour vérifier les codes et les codes d'intérêts des 3 fiches d'exemple. TODO : reprendre ces données depuis le fichier _Interests_ de la base (CC BY 4.0).                                     |
| `onet-tools-licence`  | O*NET Tools Developer License, <https://www.onetcenter.org/license_toolsdev.html>                                                                                                  | Licence spécifique                                   | ✅ 2026-11-27 (existence) | S'applique à l'Interest Profiler. Conditions détaillées **à lire** avant d'en réutiliser les items.                                                                                                    |
| `holland-1997`        | Holland, J. L. (1997). _Making vocational choices_ (3e éd.).                                                                                                                       | Droits de l'éditeur (citation seulement)             | ⚠️                        | Éditeur, édition et ISBN à vérifier.                                                                                                                                                                   |
| `armstrong-2008`      | Armstrong, P. I., Allison, W., & Rounds, J. (2008). Development and initial validation of brief public domain RIASEC marker scales. _Journal of Vocational Behavior, 73_, 287-299. | ⚠️ Items annoncés « domaine public », à confirmer    | ⚠️                        | Piste pour un futur questionnaire d'intérêts.                                                                                                                                                          |
| `rome-france-travail` | ROME, France Travail                                                                                                                                                               | ⚠️ Licence Ouverte Etalab 2.0 supposée               | ⚠️                        | URL officielle, version, licence et format à vérifier.                                                                                                                                                 |

## Liens entre personnalité, intérêts et travail

| Id                   | Source                                                                                                                                                                         | Statut | Notes                                                                                                |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------ | ---------------------------------------------------------------------------------------------------- |
| `larson-2002`        | Larson, L. M., Rottinghaus, P. J., & Borgen, F. H. (2002). Meta-analyses of Big Six interests and Big Five personality factors. _Journal of Vocational Behavior, 61_, 217-239. | ⚠️     | Métadonnées et DOI à vérifier. **Aucun coefficient ne doit être repris avant lecture de l'article.** |
| `barrick-mount-1991` | Barrick, M. R., & Mount, M. K. (1991). The Big Five personality dimensions and job performance: A meta-analysis. _Personnel Psychology, 44_, 1-26.                             | ⚠️     | À compléter par des méta-analyses plus récentes.                                                     |

## Méthodes

| Id                       | Source                                                                        | Statut | Notes                                                                                                                                      |
| ------------------------ | ----------------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `abramowitz-stegun-1964` | Abramowitz, M., & Stegun, I. A. (1964). _Handbook of Mathematical Functions_. | ⚠️     | Approximation de erf (formule 7.1.26) utilisée pour les percentiles. Les tests vérifient la précision à 10⁻⁵ près sur des valeurs connues. |

## Données encore manquantes (TODO)

- **Normes** pour convertir les scores en percentiles (moyennes et écarts-types par trait et
  facette, idéalement sur une population francophone). `src/data/normes/normes.json` est vide.
- **Adaptation française validée** des items IPIP-NEO-120.
- **Sources pour l'avertissement** affiché sur le site (« la personnalité n'explique qu'une partie
  de la réussite et de la satisfaction au travail ») : méta-analyses vérifiées à citer.
- **Scores RIASEC détaillés** des métiers (fichier _Interests_ d'O*NET 31.0).
- **Table de correspondance O\*NET-SOC → ROME**.
