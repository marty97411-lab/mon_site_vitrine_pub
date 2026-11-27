import type { Echelle, ItemCotation } from './types';

/** Vérifie qu'une réponse est un entier de l'échelle. */
export function estReponseValide(valeur: unknown, echelle: Echelle): valeur is number {
  return (
    typeof valeur === 'number' &&
    Number.isInteger(valeur) &&
    valeur >= echelle.min &&
    valeur <= echelle.max
  );
}

/**
 * Cote une réponse : inchangée pour un item direct, inversée pour un item
 * à clé négative (min + max − valeur ; sur une échelle 1–5 : 1↔5, 2↔4, 3 inchangé).
 */
export function coterItem(valeur: number, cle: ItemCotation['cle'], echelle: Echelle): number {
  if (!estReponseValide(valeur, echelle)) {
    throw new RangeError(
      `Réponse invalide : ${String(valeur)} (entier attendu entre ${echelle.min} et ${echelle.max})`,
    );
  }
  return cle === 'moins' ? echelle.min + echelle.max - valeur : valeur;
}
