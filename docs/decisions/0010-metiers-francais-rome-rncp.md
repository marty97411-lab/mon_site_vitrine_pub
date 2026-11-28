# 0010. Métiers français (ROME) et certifications (RNCP) dans les résultats

- **Statut** : accepté (2026-11-28), en cours (import RNCP et relecture manuelle à faire)

## Contexte

La page de résultats affichait des métiers O*NET en anglais avec des liens vers O*NET OnLine. Le
visiteur doit voir des **métiers français**, des fiches françaises et les **certifications** qui y
mènent. Seule la base O*NET fournit un profil d'intérêts RIASEC pour chaque métier : le calcul doit
donc rester fondé sur O*NET.

Rappel des référentiels : le **ROME** (France Travail) décrit les **métiers** ; le **RNCP**
(France compétences) recense les **certifications** (diplômes, titres, CQP) et ne décrit pas des
métiers.

## Décisions

1. **Le calcul ne change pas** (ADR 0005). Seul l'affichage passe par les métiers ROME.
2. **Chaîne de correspondance officielle**, téléchargée par `npm run import:fr`
   (`scripts/import-fr.mjs`) :
   - O*NET → ESCO : « O*NET - ESCO Crosswalk (Occupations) » (Commission européenne et USDOL/ETA) ;
   - ESCO → ROME 4.0 : table nationale « ROME 4.0 - ESCO 1.0.9 » V1.1 (France Travail, 19/11/2025),
     page « EURES countries mapping tables » du portail ESCO. Elle existe bien pour le ROME 4.0 :
     aucun repli n'est nécessaire pour la majorité des métiers ;
   - ROME 4.0 : export open data complet (version 62, 26M10) ;
   - ROME → RNCP : export de France compétences (data.gouv.fr) ;
   - Onisep : Idéo-Métiers (ODbL), pour les liens vers les fiches Onisep.
3. **Qualité de chaque lien conservée** (types `exactMatch`, `narrowMatch`, `broadMatch`,
   `closeMatch`, `exactISCO`), puis qualité de la chaîne : `exacte` (deux liens exacts),
   `approchee` (un lien exact, ou deux liens dans le même sens), `incertaine` (sens opposés),
   `proche` (un lien « close », ou O*NET relié seulement à un groupe ISCO), `manuelle` (ajoutée à
   la relecture), `absente`. Sens des liens vérifié dans le rapport technique ESCO–O*NET.
4. **Règles d'affichage** (décision du propriétaire) :
   - affichées sans relecture : qualités `exacte` et `approchee`, avec la mention « automatique,
     non relue » ;
   - jamais affichées : `incertaine`, `proche`, `rejete` ;
   - une correspondance validée à la relecture est toujours affichée ;
   - garde-fou : une correspondance **approchée** est écartée quand le code RIASEC du métier
     O*NET et celui que le ROME attribue à la fiche se contredisent (deux sources officielles
     indépendantes) ; une correspondance exacte est gardée, la divergence étant signalée dans le
     fichier de relecture (ex. « Web and Digital Interface Designers » → « UX - UI Designer ») ;
   - au plus 3 fiches ROME par métier O*NET (tri : qualité, cohérence RIASEC, nombre de chemins) ;
   - doublons fusionnés : une fiche ROME n'apparaît qu'une fois dans les résultats ;
   - un métier O*NET sans équivalent affichable n'est pas montré. Un métier « proche » n'est pas
     substitué automatiquement : il ne l'est qu'après validation (choix plus prudent que la
     demande initiale, conforme à la décision n° 2 du propriétaire).
5. **Repli CITP/ISCO-08 (option b du propriétaire) : non réalisable aujourd'hui.** France Travail
   ne publie plus de table ROME ↔ ISCO (citée dans sa licence, absente de la page et de l'export
   actuels). Aucune correspondance n'est inventée : les métiers concernés restent `absente`.
6. **Validation manuelle** : `docs/controle/correspondances-onet-rome.csv` (point-virgule, UTF-8)
   liste chaque couple O*NET → ROME, sa qualité, les chemins, la cohérence RIASEC, l'affichage et sa
   raison, le statut (`a_valider`). Ordre de priorité : simulation déterministe des 120 ordres de
   trois dimensions RIASEC dominantes, avec la présentation de la page de résultats. Les décisions
   vont dans `src/data/fr/validations.json` (`valide` / `rejete`), relu à chaque import et jamais
   écrasé.
7. **Certifications** : fiches RNCP actives uniquement (jamais le RS) ; d'abord les plus
   spécifiques (rattachées au moins de codes ROME), puis par niveau, puis les numéros les plus
   récents ; au plus 5 ; lien `https://www.francecompetences.fr/recherche/rncp/<n>/`. Niveaux du
   cadre national des certifications (3 = CAP … 8 = doctorat).
8. **Fiches du site** `/metiers/rome/[code]` (pas de nouvel onglet ; section « Fiches métiers ») :
   définition et accès au métier (ROME, source citée), niveau de correspondance transmis dans
   l'adresse (`?niveau=…`, rien n'est envoyé à un serveur), formations, liens MétierScope et
   Onisep, partie « Approfondir » avec les métiers O*NET d'origine et les limites. Le « niveau de
   préparation habituel en France » est la rubrique « Accès au métier » du ROME (et non une
   équivalence maison des Job Zones, qui restent dans « Approfondir »).
9. **Lien Onisep** gardé (décision du propriétaire) : l'extrait réutilisé
   (`src/data/fr/onisep-rome.json`) reste sous ODbL, mentionné dans « Crédits et licences ». Les
   codes ROME d'Idéo-Métiers sont ceux du ROME V3 : un lien n'est proposé que si le code existe
   aussi dans le ROME 4.0.
10. **Dépendance ajoutée** : `fflate` (outil de développement, quelques kilo-octets, sans
    dépendance) pour lire les archives zip du ROME et du RNCP dans le script d'import. Rien n'est
    ajouté au site publié.

## Limites et points ouverts

- **Export RNCP non importé** : data.gouv.fr coupe la connexion depuis l'environnement de
  développement en ligne. Le format exact n'a pas pu être observé : `scripts/lib/rncp.mjs` repère
  les colonnes par leur nom et s'arrête avec un message clair si elles diffèrent. En attendant,
  les fiches affichent « certifications en cours de préparation ». Pour importer : télécharger
  l'archive `export-fiches-csv-…zip` sur data.gouv.fr et lancer
  `npm run import:fr -- --rncp chemin/vers/archive.zip` (ou lancer le script depuis un poste qui
  accède à data.gouv.fr).
- Versions différentes d'ESCO dans les deux tables (v1.1.0 côté O*NET, 1.0.9 côté ROME) : les URI
  communes sont rapprochées telles quelles ; les métiers ESCO propres à la v1.1 ne trouvent pas
  de correspondance.
- Licences à reconfirmer : table ESCO–ROME (pas de licence propre indiquée), RNCP, Onisep.
- Données à relancer régulièrement (ROME deux fois par an, prochaine version en mars 2027 ;
  RNCP chaque semaine).
