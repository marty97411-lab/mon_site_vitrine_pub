import type { Norme } from './types';

/**
 * Fonction d'erreur, approximation d'Abramowitz & Stegun (1964), formule 7.1.26
 * (erreur absolue annoncée ≤ 1,5 × 10⁻⁷ ; référence à vérifier, voir docs/sources.md).
 */
export function erf(x: number): number {
  const signe = x < 0 ? -1 : 1;
  const ax = Math.abs(x);
  const t = 1 / (1 + 0.3275911 * ax);
  const y =
    1 -
    ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) *
      t *
      Math.exp(-ax * ax);
  return signe * y;
}

/** Fonction de répartition de la loi normale centrée réduite. */
export function repartitionNormale(z: number): number {
  return 0.5 * (1 + erf(z / Math.SQRT2));
}

/**
 * Convertit un score brut en percentile (0–100) à partir d'une norme (moyenne, écart-type),
 * en supposant une distribution normale des scores dans la population de référence.
 *
 * Renvoie null si le score ou la norme est absent : on n'affiche jamais de percentile
 * calculé sur une norme non sourcée.
 */
export function versPercentile(score: number | null, norme: Norme | undefined): number | null {
  if (score === null || norme === undefined) return null;
  const { moyenne, ecart_type } = norme;
  if (moyenne === null || ecart_type === null || !(ecart_type > 0)) return null;
  const z = (score - moyenne) / ecart_type;
  return 100 * repartitionNormale(z);
}
