import { z } from 'astro/zod';

export const parcoursSchema = z.object({
  id: z.enum(['rapide', 'complet']),
  nom: z.string().min(1),
  /** Exactement un questionnaire de personnalité puis un questionnaire d'intérêts. */
  questionnaires: z.tuple([
    z.enum(['ipip-neo-120', 'ipip-bffm-50']),
    z.enum(['onet-ip-60', 'onet-mini-ip-30']),
  ]),
  /** Estimation du projet, à affiner avec des mesures réelles. */
  duree: z.string().min(1),
  precision: z.enum(['indicative', 'plus-fine']),
  apporte: z.array(z.string().min(1)).min(1),
  limites: z.array(z.string().min(1)).min(1),
});

export type Parcours = z.infer<typeof parcoursSchema>;
