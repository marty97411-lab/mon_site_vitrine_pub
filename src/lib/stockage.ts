/**
 * Sauvegarde locale des réponses dans le localStorage du navigateur, pour pouvoir
 * reprendre plus tard. Rien n'est envoyé à un serveur. Les réponses sont indexées par
 * identifiant d'item : un item commun à deux questionnaires n'est posé qu'une fois.
 */
import type { Reponses } from './scoring';

const CLE = 'orientation-personnalite:v2';

export type IdParcours = 'rapide' | 'complet';

export interface EtatSauvegarde {
  version: 2;
  reponses: Record<string, number>;
  parcours: IdParcours | null;
  maj: string | null;
}

const vide = (): EtatSauvegarde => ({ version: 2, reponses: {}, parcours: null, maj: null });

export function lireEtat(): EtatSauvegarde {
  try {
    const brut = localStorage.getItem(CLE);
    if (brut === null) return vide();
    const valeur: unknown = JSON.parse(brut);
    if (typeof valeur !== 'object' || valeur === null) return vide();
    const v = valeur as Partial<EtatSauvegarde>;
    if (v.version !== 2) return vide();
    const reponses: Record<string, number> = {};
    for (const [cle, rep] of Object.entries(v.reponses ?? {})) {
      if (typeof rep === 'number' && Number.isInteger(rep)) reponses[cle] = rep;
    }
    const parcours = v.parcours === 'rapide' || v.parcours === 'complet' ? v.parcours : null;
    return { version: 2, reponses, parcours, maj: typeof v.maj === 'string' ? v.maj : null };
  } catch {
    return vide();
  }
}

function ecrire(etat: EtatSauvegarde): boolean {
  try {
    localStorage.setItem(CLE, JSON.stringify({ ...etat, maj: new Date().toISOString() }));
    return true;
  } catch {
    // Stockage indisponible (navigation privée stricte, quota…) : on continue sans sauvegarde.
    return false;
  }
}

export function enregistrerReponse(idItem: string, valeur: number): boolean {
  const etat = lireEtat();
  etat.reponses[idItem] = valeur;
  return ecrire(etat);
}

export function definirParcours(parcours: IdParcours): boolean {
  const etat = lireEtat();
  etat.parcours = parcours;
  return ecrire(etat);
}

export function lireReponses(): Reponses {
  return lireEtat().reponses;
}

/** Notes personnelles des articles « Ma situation » : une clé par article. */
export const PREFIXE_NOTES = 'personalis:notes:';
/** Réponse facultative « Quelle situation vous ressemble le plus ? » (page de résultats). */
export const CLE_SITUATION = 'personalis:situation';

export function lireTexte(cle: string): string {
  try {
    return localStorage.getItem(cle) ?? '';
  } catch {
    return '';
  }
}

export function ecrireTexte(cle: string, valeur: string): boolean {
  try {
    if (valeur === '') localStorage.removeItem(cle);
    else localStorage.setItem(cle, valeur);
    return true;
  } catch {
    return false;
  }
}

export function effacerTout(): void {
  try {
    // Notes personnelles et situation choisie.
    const cles: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const cle = localStorage.key(i);
      if (cle?.startsWith(PREFIXE_NOTES) || cle === CLE_SITUATION) cles.push(cle);
    }
    for (const cle of cles) localStorage.removeItem(cle);
    localStorage.removeItem(CLE);
    // Ancienne clé de l'étape 1 (sessionStorage).
    sessionStorage.removeItem('orientation-personnalite:reponses');
  } catch {
    // Rien à faire.
  }
}
