/**
 * Référentiel du modèle Big Five tel qu'opérationnalisé par l'IPIP-NEO-120.
 *
 * Source de la structure (5 domaines × 6 facettes, codes N1…C6) :
 * Johnson, J. A. (2014). Measuring thirty facets of the Five Factor Model with a
 * 120-item public domain inventory: Development of the IPIP-NEO-120.
 * Journal of Research in Personality, 51, 78-89.
 * Liste des facettes vérifiée sur https://ipip.ori.org/30FacetNEO-PI-RItems.htm (consulté le 2026-11-27).
 *
 * Les libellés français sont des traductions du projet, NON validées scientifiquement.
 */

export const TRAITS = ['O', 'C', 'E', 'A', 'N'] as const;
export type TraitId = (typeof TRAITS)[number];

export const FACETTES = {
  N1: { trait: 'N', nomOriginal: 'Anxiety', nomFr: 'Anxiété' },
  N2: { trait: 'N', nomOriginal: 'Anger', nomFr: 'Colère' },
  N3: { trait: 'N', nomOriginal: 'Depression', nomFr: 'Humeur dépressive' },
  N4: { trait: 'N', nomOriginal: 'Self-Consciousness', nomFr: 'Gêne sociale' },
  N5: { trait: 'N', nomOriginal: 'Immoderation', nomFr: 'Impulsivité' },
  N6: { trait: 'N', nomOriginal: 'Vulnerability', nomFr: 'Vulnérabilité au stress' },
  E1: { trait: 'E', nomOriginal: 'Friendliness', nomFr: 'Chaleur' },
  E2: { trait: 'E', nomOriginal: 'Gregariousness', nomFr: 'Grégarité' },
  E3: { trait: 'E', nomOriginal: 'Assertiveness', nomFr: 'Affirmation de soi' },
  E4: { trait: 'E', nomOriginal: 'Activity Level', nomFr: "Niveau d'activité" },
  E5: { trait: 'E', nomOriginal: 'Excitement-Seeking', nomFr: 'Recherche de sensations' },
  E6: { trait: 'E', nomOriginal: 'Cheerfulness', nomFr: 'Émotions positives' },
  O1: { trait: 'O', nomOriginal: 'Imagination', nomFr: 'Imagination' },
  O2: { trait: 'O', nomOriginal: 'Artistic Interests', nomFr: 'Intérêts artistiques' },
  O3: { trait: 'O', nomOriginal: 'Emotionality', nomFr: 'Sensibilité émotionnelle' },
  O4: { trait: 'O', nomOriginal: 'Adventurousness', nomFr: 'Goût de la nouveauté' },
  O5: { trait: 'O', nomOriginal: 'Intellect', nomFr: 'Curiosité intellectuelle' },
  O6: { trait: 'O', nomOriginal: 'Liberalism', nomFr: 'Libéralisme des valeurs' },
  A1: { trait: 'A', nomOriginal: 'Trust', nomFr: 'Confiance' },
  A2: { trait: 'A', nomOriginal: 'Morality', nomFr: 'Droiture' },
  A3: { trait: 'A', nomOriginal: 'Altruism', nomFr: 'Altruisme' },
  A4: { trait: 'A', nomOriginal: 'Cooperation', nomFr: 'Coopération' },
  A5: { trait: 'A', nomOriginal: 'Modesty', nomFr: 'Modestie' },
  A6: { trait: 'A', nomOriginal: 'Sympathy', nomFr: 'Compassion' },
  C1: { trait: 'C', nomOriginal: 'Self-Efficacy', nomFr: "Sentiment d'efficacité" },
  C2: { trait: 'C', nomOriginal: 'Orderliness', nomFr: 'Ordre' },
  C3: { trait: 'C', nomOriginal: 'Dutifulness', nomFr: 'Sens du devoir' },
  C4: { trait: 'C', nomOriginal: 'Achievement-Striving', nomFr: 'Recherche de réussite' },
  C5: { trait: 'C', nomOriginal: 'Self-Discipline', nomFr: 'Autodiscipline' },
  C6: { trait: 'C', nomOriginal: 'Cautiousness', nomFr: 'Prudence' },
} as const satisfies Record<string, { trait: TraitId; nomOriginal: string; nomFr: string }>;

export type FacetteId = keyof typeof FACETTES;
export const FACETTE_IDS = Object.keys(FACETTES) as [FacetteId, ...FacetteId[]];

/** Modèle RIASEC de Holland : Réaliste, Investigateur, Artistique, Social, Entreprenant, Conventionnel. */
export const RIASEC = ['R', 'I', 'A', 'S', 'E', 'C'] as const;
export type RiasecId = (typeof RIASEC)[number];

/** Libellés des dimensions RIASEC (traductions usuelles, non officielles). */
export const RIASEC_NOMS: Record<RiasecId, { nomFr: string; nomOriginal: string }> = {
  R: { nomFr: 'Réaliste', nomOriginal: 'Realistic' },
  I: { nomFr: 'Investigateur', nomOriginal: 'Investigative' },
  A: { nomFr: 'Artistique', nomOriginal: 'Artistic' },
  S: { nomFr: 'Social', nomOriginal: 'Social' },
  E: { nomFr: 'Entreprenant', nomOriginal: 'Enterprising' },
  C: { nomFr: 'Conventionnel', nomOriginal: 'Conventional' },
};
