import { z } from 'astro/zod';
import { FACETTES, FACETTE_IDS, RIASEC, TRAITS } from '../big-five';
import { affirmationSchema, idSource } from './source';

const scoreRiasec = z.number().nullable();

/** Fiche métier (frontmatter ; le corps Markdown contient la description). */
export const metierSchema = z.object({
  intitule: z.string().min(1),
  intitule_original: z.string().optional(),
  codes: z
    .object({
      /** Code O*NET-SOC, ex. 29-1141.00 */
      onet: z
        .string()
        .regex(/^\d{2}-\d{4}\.\d{2}$/)
        .optional(),
      /** Code ROME (France Travail), ex. J1506 */
      rome: z
        .string()
        .regex(/^[A-N]\d{4}$/)
        .optional(),
    })
    .refine((c) => c.onet !== undefined || c.rome !== undefined, {
      message: 'Au moins un code O*NET ou ROME est requis',
    }),
  riasec: z.object({
    /** Code d'intérêts dominant (1 à 3 lettres), ex. « SCI ». */
    code: z.string().regex(/^[RIASEC]{1,3}$/),
    /** Scores détaillés par dimension ; null = TODO (à extraire des données O*NET). */
    scores: z.record(z.enum(RIASEC), scoreRiasec).optional(),
    source: idSource,
  }),
  traits_pertinents: z
    .array(
      z
        .object({
          trait: z.enum(TRAITS),
          facettes: z.array(z.enum(FACETTE_IDS)).optional(),
          sens: z.enum(['eleve', 'faible', 'variable']),
          justification: affirmationSchema,
        })
        .refine((t) => (t.facettes ?? []).every((f) => FACETTES[f].trait === t.trait), {
          message: 'Les facettes doivent appartenir au trait indiqué',
        }),
    )
    .min(1),
  points_forts: z.array(affirmationSchema).min(1),
  points_vigilance: z.array(affirmationSchema).min(1),
  sources: z.array(idSource).min(1),
  /** « exemple » : contenu de démonstration, à ne pas présenter comme validé. */
  statut: z.enum(['exemple', 'brouillon', 'valide']),
});

export type Metier = z.infer<typeof metierSchema>;
