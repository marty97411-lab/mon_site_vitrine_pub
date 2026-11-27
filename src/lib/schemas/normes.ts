import { z } from 'astro/zod';
import { FACETTE_IDS, TRAITS } from '../big-five';
import { idSource } from './source';

/** Norme d'une échelle : null tant que la valeur n'est pas sourcée (TODO). */
const normeEchelle = z
  .object({
    moyenne: z.number().nullable(),
    ecart_type: z.number().positive().nullable(),
  })
  .refine((n) => (n.moyenne === null) === (n.ecart_type === null), {
    message: 'Moyenne et écart-type doivent être renseignés ensemble',
  });

/** Fichier de normes utilisé pour convertir les scores bruts en percentiles. */
export const normesSchema = z
  .object({
    instrument: z.literal('IPIP-NEO-120'),
    statut: z.enum(['todo', 'verifie']),
    source: idSource.nullable(),
    population: z.string().nullable(),
    echelle: z.object({ min: z.literal(1), max: z.literal(5) }),
    note: z.string().optional(),
    traits: z.record(z.enum(TRAITS), normeEchelle),
    facettes: z.partialRecord(z.enum(FACETTE_IDS), normeEchelle),
  })
  .refine((n) => n.statut === 'todo' || n.source !== null, {
    message: 'Des normes « verifie » doivent citer leur source',
  });

export type Normes = z.infer<typeof normesSchema>;
