/**
 * Contrôle d'intégrité des références bibliographiques : toute source citée
 * dans le contenu doit exister dans src/content/sources/sources.json.
 */

export interface Reference {
  /** Où la référence apparaît (ex. « metiers/infirmier → points_forts[0] »). */
  origine: string;
  idSource: string;
}

export function referencesManquantes(
  idsSourcesConnus: ReadonlySet<string>,
  references: readonly Reference[],
): Reference[] {
  return references.filter((r) => !idsSourcesConnus.has(r.idSource));
}

export function verifierReferences(
  idsSourcesConnus: ReadonlySet<string>,
  references: readonly Reference[],
): void {
  const manquantes = referencesManquantes(idsSourcesConnus, references);
  if (manquantes.length > 0) {
    const details = manquantes
      .map((r) => `  - « ${r.idSource} » cité dans ${r.origine}`)
      .join('\n');
    throw new Error(`Sources introuvables dans sources.json :\n${details}`);
  }
}
