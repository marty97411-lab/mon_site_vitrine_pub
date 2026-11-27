/**
 * Conservation temporaire des réponses dans sessionStorage : les données restent
 * dans l'onglet du navigateur et disparaissent à sa fermeture. Rien n'est envoyé.
 */
import type { Reponses } from './scoring';

const CLE = 'orientation-personnalite:reponses';

export function enregistrerReponses(reponses: Reponses): void {
  try {
    sessionStorage.setItem(CLE, JSON.stringify(reponses));
  } catch {
    // Stockage indisponible (navigation privée stricte…) : les résultats ne pourront pas s'afficher.
  }
}

export function lireReponses(): Reponses | null {
  try {
    const brut = sessionStorage.getItem(CLE);
    if (brut === null) return null;
    const valeur: unknown = JSON.parse(brut);
    if (typeof valeur !== 'object' || valeur === null || Array.isArray(valeur)) return null;
    const reponses: Record<string, number> = {};
    for (const [cle, v] of Object.entries(valeur)) {
      if (typeof v === 'number') reponses[cle] = v;
    }
    return reponses;
  } catch {
    return null;
  }
}

export function effacerReponses(): void {
  try {
    sessionStorage.removeItem(CLE);
  } catch {
    // Rien à faire.
  }
}
