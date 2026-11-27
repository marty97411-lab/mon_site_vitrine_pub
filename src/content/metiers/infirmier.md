---
intitule: 'Infirmier / infirmière'
intitule_original: Registered Nurses
codes:
  onet: 29-1141.00
  # TODO(ROME) : ajouter le code ROME correspondant après vérification sur le référentiel France Travail.
riasec:
  code: SCI
  # Scores « Occupational Interests » (1 à 7), O*NET 31.0, fichier career_interest_types.
  scores:
    R: 3.46
    I: 4.71
    A: 1.34
    S: 5.57
    E: 2.38
    C: 4.75
  source: onet-31
traits_pertinents:
  - trait: A
    facettes: [A3, A6]
    sens: eleve
    justification:
      texte: "Hypothèse à vérifier : un métier d'aide et de soin pourrait mieux convenir aux personnes qui ont un goût marqué pour l'aide aux autres."
      todo_source: true
  - trait: N
    facettes: [N6]
    sens: faible
    justification:
      texte: 'Hypothèse à vérifier : une bonne résistance au stress pourrait être utile dans des situations de soin urgentes.'
      todo_source: true
points_forts:
  - texte: 'TODO : points forts du profil pour ce métier, à rédiger à partir de sources vérifiées.'
    todo_source: true
points_vigilance:
  - texte: 'TODO : points de vigilance du profil pour ce métier, à rédiger à partir de sources vérifiées.'
    todo_source: true
sources: [onet-online, onet-31]
statut: exemple
---

> **Fiche d'exemple, à valider.** Seuls le code O*NET-SOC, l'intitulé original, le code
> d'intérêts (O*NET OnLine, consulté le 2026-11-27) et les scores RIASEC (base O*NET 31.0) ont
> été vérifiés. Tout le reste est
> provisoire.

TODO : description du métier (missions, conditions d'exercice, formation en France), sourcée.
