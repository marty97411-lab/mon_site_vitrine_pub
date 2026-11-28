/** Libellé public du statut de vérification d'une source (null = vérifiée). */
export function libelleStatut(
  statut: 'verifie' | 'metadonnees-verifiees' | 'a-verifier',
): string | null {
  if (statut === 'a-verifier') return 'référence à vérifier';
  if (statut === 'metadonnees-verifiees') return 'contenu à relire';
  return null;
}

interface ReferenceSource {
  auteurs: string[];
  annee: number | null;
  publication?: string | undefined;
  volume?: string | undefined;
  pages?: string | undefined;
}

/** Parties textuelles d'une référence, autour du titre (affiché en <cite>). */
export function partiesReference(s: ReferenceSource): { avant: string; apres: string } {
  const suite = [s.publication, s.volume, s.pages].filter(Boolean).join(', ');
  return {
    avant: `${s.auteurs.join(', ')} (${s.annee ?? 's. d.'}). `,
    apres: `${suite ? `. ${suite}` : ''}.`,
  };
}
