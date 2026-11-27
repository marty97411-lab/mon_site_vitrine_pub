/** Libellé public du statut de vérification d'une source (null = vérifiée). */
export function libelleStatut(
  statut: 'verifie' | 'metadonnees-verifiees' | 'a-verifier',
): string | null {
  if (statut === 'a-verifier') return 'référence à vérifier';
  if (statut === 'metadonnees-verifiees') return 'contenu à relire';
  return null;
}
