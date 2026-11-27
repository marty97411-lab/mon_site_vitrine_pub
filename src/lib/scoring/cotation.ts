import { ECHELLE, type ItemCotation } from './types';

/** Vérifie qu'une réponse est un entier de l'échelle. */
export function estReponseValide(valeur: unknown): valeur is number {
  return (
    typeof valeur === 'number' &&
    Number.isInteger(valeur) &&
    valeur >= ECHELLE.min &&
    valeur <= ECHELLE.max
  );
}

/**
 * Cote une réponse : inchangée pour un item direct, inversée pour un item
 * à clé négative (sur une échelle 1–5 : 1↔5, 2↔4, 3 inchangé).
 */
export function coterItem(valeur: number, cle: ItemCotation['cle']): number {
  if (!estReponseValide(valeur)) {
    throw new RangeError(
      `Réponse invalide : ${String(valeur)} (entier attendu entre ${ECHELLE.min} et ${ECHELLE.max})`,
    );
  }
  return cle === 'moins' ? ECHELLE.min + ECHELLE.max - valeur : valeur;
}
