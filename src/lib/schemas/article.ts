import { z } from 'astro/zod';
import { idSource } from './source';

/**
 * Article de contenu (« Ma situation », « Philosophie ») en trois niveaux :
 * - essentiel : une ou deux phrases visibles tout de suite ;
 * - comprendre : un paragraphe accessible ;
 * - approfondir : le corps Markdown, dans un bloc dépliable.
 */
export const articleSchema = z.object({
  titre: z.string().min(1),
  description: z.string().min(1).max(200),
  badge: z.enum(['science', 'reflexion']),
  ordre: z.number().int().min(0),
  essentiel: z.string().min(1),
  comprendre: z.string().min(1),
  sources: z.array(idSource).default([]),
  pour_aller_plus_loin: z.array(z.object({ href: z.string(), libelle: z.string() })).default([]),
  /** Brouillon à relire par l'équipe : un bandeau le signale sur la page. */
  brouillon: z.boolean().default(true),
});

export type Article = z.infer<typeof articleSchema>;
