import { z } from 'astro/zod';

/** Définition du glossaire : source unique des explications de termes techniques. */
export const entreeGlossaireSchema = z.object({
  id: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
  terme: z.string().min(1),
  /** Explication très courte, affichée entre parenthèses à la première mention. */
  court: z.string().min(1).max(200),
  /** Définition simple affichée sur la page Glossaire. */
  definition: z.string().min(1),
  /** Page du site pour en savoir plus. */
  voir: z.string().startsWith('/').optional(),
});

export const glossaireSchema = z.array(entreeGlossaireSchema).min(1);
export type EntreeGlossaire = z.infer<typeof entreeGlossaireSchema>;
