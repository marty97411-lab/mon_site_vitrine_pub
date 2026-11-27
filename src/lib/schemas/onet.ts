import { z } from 'astro/zod';
import { RIASEC } from '../big-five';
import { idSource } from './source';

const codeOnet = z.string().regex(/^\d{2}-\d{4}\.\d{2}$/);
const codeFamille = z.string().regex(/^\d{2}$/);

/** Profils d'intérêts des métiers générés par scripts/import-onet.mjs. */
export const metiersOnetSchema = z.object({
  source: idSource,
  version: z.string(),
  genere_le: z.iso.date(),
  attribution: z.string().min(1),
  modifications: z.string().min(1),
  metiers: z
    .array(
      z.object({
        code: codeOnet,
        titre: z.string().min(1),
        famille: codeFamille,
        job_zone: z.number().int().min(1).max(5).nullable(),
        /** Scores « Occupational Interests » O*NET, de 1 à 7. */
        riasec: z.record(z.enum(RIASEC), z.number().min(1).max(7)),
        code_riasec: z.string().regex(/^[RIASEC]{0,3}$/),
      }),
    )
    .min(1),
});

export const famillesSchema = z.object({
  source: idSource,
  note: z.string(),
  familles: z.array(
    z.object({ code: codeFamille, nom_original: z.string().min(1), nom: z.string().min(1) }),
  ),
});

export const jobZonesSchema = z.object({
  source: idSource,
  note: z.string(),
  zones: z.array(
    z.object({
      zone: z.number().int().min(1).max(5),
      nom_original: z.string().min(1),
      nom: z.string().min(1),
    }),
  ),
});

export type MetiersOnet = z.infer<typeof metiersOnetSchema>;
export type MetierOnet = MetiersOnet['metiers'][number];
