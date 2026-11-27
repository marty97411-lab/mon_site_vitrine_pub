import type { FacetteId, TraitId } from '../big-five';

/** Échelle de Likert de l'IPIP-NEO : 1 = « Pas du tout d'accord » … 5 = « Tout à fait d'accord ». */
export const ECHELLE = { min: 1, max: 5 } as const;

/** Sous-ensemble d'un item nécessaire au calcul. */
export interface ItemCotation {
  id: string;
  trait: TraitId;
  facette: FacetteId;
  cle: 'plus' | 'moins';
}

/** Réponses brutes du visiteur, indexées par identifiant d'item. */
export type Reponses = Readonly<Record<string, number | undefined>>;

export interface ScoreEchelle {
  /** Moyenne des items cotés (entre 1 et 5), ou null si trop peu de réponses. */
  moyenne: number | null;
  nbRepondus: number;
  nbItems: number;
}

export interface Profil {
  traits: Partial<Record<TraitId, ScoreEchelle>>;
  facettes: Partial<Record<FacetteId, ScoreEchelle>>;
}

/** Norme d'une échelle ; null = norme non sourcée (TODO). */
export interface Norme {
  moyenne: number | null;
  ecart_type: number | null;
}
