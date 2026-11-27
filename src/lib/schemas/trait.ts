import { z } from 'astro/zod';
import { FACETTES, FACETTE_IDS, TRAITS } from '../big-five';
import { idSource } from './source';

/** Fiche d'un trait Big Five (frontmatter ; le corps Markdown contient les explications). */
export const traitSchema = z
  .object({
    trait: z.enum(TRAITS),
    nom: z.string().min(1),
    nom_original: z.string().min(1),
    ordre: z.number().int().min(1).max(5),
    resume: z.string().min(1),
    facettes: z.array(z.enum(FACETTE_IDS)).length(6),
    sources: z.array(idSource).min(1),
    brouillon: z.boolean().default(true),
  })
  .refine((t) => t.facettes.every((f) => FACETTES[f].trait === t.trait), {
    message: 'Toutes les facettes doivent appartenir au trait',
  });

export type Trait = z.infer<typeof traitSchema>;
