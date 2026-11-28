import { z } from 'astro/zod';
import { RIASEC, TRAITS } from '../big-five';

/** Identifiant d'article : « situations/… », « philosophie/… », « traits/… » ou « introversion/… ». */
export const idArticle = z
  .string()
  .regex(/^(situations|philosophie|traits|introversion)\/[a-z0-9-]+$/);

export const conditionSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('trait'),
    trait: z.enum(TRAITS),
    min: z.number().min(1).max(5).optional(),
    max: z.number().min(1).max(5).optional(),
  }),
  /** La dimension RIASEC la plus élevée (ou l'une des ex æquo) fait partie de `lettres`. */
  z.object({ type: z.literal('riasec-dominant'), lettres: z.array(z.enum(RIASEC)).min(1) }),
  /** Écart entre la dimension la plus haute et la plus basse ≤ `ecart_max` × score maximal. */
  z.object({ type: z.literal('riasec-peu-differencie'), ecart_max: z.number().gt(0).lt(1) }),
  z.object({ type: z.literal('toujours') }),
]);

export const regleSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9-]+$/),
    /** Phrase affichée au visiteur : « parce que … ». */
    raison: z.string().min(1),
    si: conditionSchema,
    articles: z.array(idArticle).default([]),
    livres: z.array(z.string().regex(/^[a-z0-9-]+$/)).default([]),
  })
  .refine((r) => r.articles.length + r.livres.length > 0, { message: 'Règle sans suggestion' })
  .refine((r) => r.si.type !== 'trait' || r.si.min !== undefined || r.si.max !== undefined, {
    message: 'Une condition de trait doit avoir un minimum ou un maximum',
  });

export const recommandationsSchema = z.object({
  note: z.string().min(1),
  /** Nombre de suggestions affichées par type (articles, livres). */
  minimum: z.number().int().min(1),
  maximum: z.number().int().min(1),
  /** Règles dans l'ordre de priorité ; la dernière doit être une règle « toujours ». */
  regles: z.array(regleSchema).min(1),
});

export type Regle = z.infer<typeof regleSchema>;
export type Condition = z.infer<typeof conditionSchema>;
export type ConfigRecommandations = z.infer<typeof recommandationsSchema>;
