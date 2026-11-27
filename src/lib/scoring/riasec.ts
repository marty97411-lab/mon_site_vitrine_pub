import { RIASEC, type RiasecId } from '../big-five';
import type { Profil } from './types';

export type ProfilRiasec = Record<RiasecId, number>;

/** Extrait les six scores RIASEC d'un profil, ou null s'il en manque un. */
export function profilRiasec(profil: Profil): ProfilRiasec | null {
  const resultat: Partial<ProfilRiasec> = {};
  for (const lettre of RIASEC) {
    const valeur = profil.domaines[lettre]?.valeur;
    if (valeur === null || valeur === undefined) return null;
    resultat[lettre] = valeur;
  }
  return resultat as ProfilRiasec;
}

export interface CodeRiasec {
  /** Les trois dimensions aux scores les plus élevés, de la plus forte à la moins forte. */
  code: string;
  /** Vrai si une égalité de scores rend l'ordre (ou le choix de la 3e lettre) arbitraire. */
  egalite: boolean;
}

/**
 * Code à trois lettres. En cas d'égalité, l'ordre R-I-A-S-E-C départage, et l'égalité est
 * signalée : le manuel O*NET laisse alors la personne choisir l'intérêt qui lui correspond le mieux.
 */
export function codeRiasec(scores: ProfilRiasec): CodeRiasec {
  const tries = [...RIASEC].sort((a, b) => scores[b] - scores[a]);
  const top = tries.slice(0, 3);
  const quatrieme = tries[3];
  const egaliteInterne = top.some((l, i) => i > 0 && scores[l] === scores[top[i - 1] as RiasecId]);
  const egaliteFrontiere =
    quatrieme !== undefined && scores[quatrieme] === scores[top[2] as RiasecId];
  return { code: top.join(''), egalite: egaliteInterne || egaliteFrontiere };
}
