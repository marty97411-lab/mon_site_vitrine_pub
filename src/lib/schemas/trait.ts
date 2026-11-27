import { z } from 'astro/zod';
import { FACETTES, FACETTE_IDS, TRAITS } from '../big-five';
import { affirmationSchema, idSource } from './source';

/** Fiche d'un trait Big Five, en trois niveaux : essentiel, comprendre, approfondir (corps). */
export const traitSchema = z
  .object({
    trait: z.enum(TRAITS),
    nom: z.string().min(1),
    nom_original: z.string().min(1),
    ordre: z.number().int().min(1).max(5),
    resume: z.string().min(1),
    description: z.string().min(1),
    essentiel: z.string().min(1),
    comprendre: z.string().min(1),
    facettes: z.array(z.enum(FACETTE_IDS)).length(6),
    /** Atouts et coûts d'un score élevé ou bas : il n'y a pas de bon ou de mauvais profil. */
    atouts: z.array(affirmationSchema).default([]),
    couts: z.array(affirmationSchema).default([]),
    sources: z.array(idSource).min(1),
    pour_aller_plus_loin: z.array(z.object({ href: z.string(), libelle: z.string() })).default([]),
    brouillon: z.boolean().default(true),
  })
  .refine((t) => t.facettes.every((f) => FACETTES[f].trait === t.trait), {
    message: 'Toutes les facettes doivent appartenir au trait',
  });

export type Trait = z.infer<typeof traitSchema>;
