/** Échelle de réponse d'un questionnaire (bornes incluses). */
export interface Echelle {
  min: number;
  max: number;
}

/** Sous-ensemble d'un item nécessaire au calcul. */
export interface ItemCotation {
  id: string;
  /** Trait Big Five ou dimension RIASEC. */
  domaine: string;
  facette?: string | undefined;
  cle: 'plus' | 'moins';
}

/** Ce que le moteur de cotation doit connaître d'un questionnaire. */
export interface ConfigCotation {
  echelle: Echelle;
  agregation: 'moyenne' | 'somme';
  /** Part minimale d'items répondus pour qu'un score soit calculé (0 exclu à 1). */
  seuil_completude: number;
  items: readonly ItemCotation[];
}

/** Réponses brutes du visiteur, indexées par identifiant d'item. */
export type Reponses = Readonly<Record<string, number | undefined>>;

export interface ScoreEchelle {
  /** Moyenne ou somme des items cotés, ou null si trop peu de réponses. */
  valeur: number | null;
  nbRepondus: number;
  nbItems: number;
  /** Bornes théoriques du score, pour l'affichage. */
  min: number;
  max: number;
}

export interface Profil {
  domaines: Record<string, ScoreEchelle>;
  facettes: Record<string, ScoreEchelle>;
}

/** Norme d'une échelle ; null = norme non sourcée (TODO). */
export interface Norme {
  moyenne: number | null;
  ecart_type: number | null;
}
