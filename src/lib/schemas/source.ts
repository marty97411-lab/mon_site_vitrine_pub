import { z } from 'astro/zod';

/** Identifiant de source : minuscules, chiffres et tirets (ex. « johnson-2014 »). */
export const idSource = z
  .string()
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Identifiant de source invalide');

/** Référence bibliographique ou source de données. */
export const sourceSchema = z
  .object({
    id: idSource,
    type: z.enum(['article', 'livre', 'chapitre', 'base-de-donnees', 'site-web', 'instrument']),
    auteurs: z.array(z.string().min(1)).min(1),
    annee: z.number().int().min(1500).max(2100).nullable(),
    titre: z.string().min(1),
    publication: z.string().optional(),
    volume: z.string().optional(),
    pages: z.string().optional(),
    doi: z
      .string()
      .regex(/^10\.\d{4,9}\/\S+$/, 'DOI invalide (sans préfixe https://doi.org/)')
      .optional(),
    url: z.url().optional(),
    licence: z.string().min(1).optional(),
    /**
     * « verifie » : source consultée et contenu contrôlé ;
     * « metadonnees-verifiees » : référence bibliographique vérifiée (Crossref), contenu non relu ;
     * « a-verifier » : référence citée de mémoire ou incomplète.
     */
    statut: z.enum(['verifie', 'metadonnees-verifiees', 'a-verifier']),
    consulte_le: z.iso.date().optional(),
    notes: z.string().optional(),
  })
  .refine((s) => s.statut === 'a-verifier' || s.doi !== undefined || s.url !== undefined, {
    message: 'Une source vérifiée doit avoir un DOI ou une URL',
  })
  .refine((s) => s.statut === 'a-verifier' || s.consulte_le !== undefined, {
    message: 'Une source vérifiée doit indiquer sa date de consultation',
  });

export type Source = z.infer<typeof sourceSchema>;

/**
 * Affirmation affichée sur le site : elle doit être reliée à au moins une source,
 * ou être explicitement marquée comme non sourcée (TODO).
 */
export const affirmationSchema = z
  .object({
    texte: z.string().min(1),
    sources: z.array(idSource).default([]),
    todo_source: z.boolean().default(false),
  })
  .refine((a) => a.sources.length > 0 || a.todo_source, {
    message: 'Affirmation sans source : ajouter une source ou « todo_source: true »',
  });

export type Affirmation = z.infer<typeof affirmationSchema>;
