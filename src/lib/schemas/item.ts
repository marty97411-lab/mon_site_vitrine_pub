import { z } from 'astro/zod';
import { FACETTES, FACETTE_IDS, TRAITS } from '../big-five';
import { idSource } from './source';

/** Item du questionnaire de personnalité. */
export const itemSchema = z
  .object({
    id: z
      .string()
      .regex(/^[NEOAC][1-6]-\d{2}$/, 'Identifiant attendu : <facette>-<numéro>, ex. N1-01'),
    texte_fr: z.string().min(1),
    texte_original: z.string().min(1),
    trait: z.enum(TRAITS),
    facette: z.enum(FACETTE_IDS),
    /** « plus » : un accord élevé augmente le score ; « moins » : item inversé. */
    cle: z.enum(['plus', 'moins']),
    instrument: z.literal('IPIP-NEO-120'),
    source: idSource,
    licence: z.literal('domaine-public'),
    traduction: z.object({
      statut: z.enum(['non-validee', 'validee']),
      source: idSource.optional(),
    }),
    exemple: z.boolean().default(false),
  })
  .refine((i) => FACETTES[i.facette].trait === i.trait, {
    message: 'La facette ne correspond pas au trait',
  })
  .refine((i) => i.id.startsWith(i.facette), {
    message: "L'identifiant doit commencer par le code de la facette",
  })
  .refine((i) => i.traduction.statut !== 'validee' || i.traduction.source !== undefined, {
    message: 'Une traduction « validee » doit citer sa source de validation',
  });

export type Item = z.infer<typeof itemSchema>;
