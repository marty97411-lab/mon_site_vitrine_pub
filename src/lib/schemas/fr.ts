import { z } from 'astro/zod';

/**
 * Schémas des données françaises générées par scripts/import-fr.mjs
 * (correspondance O*NET → ROME 4.0 → RNCP). Voir docs/decisions/0010-metiers-francais-rome-rncp.md.
 */
export const codeRome = z.string().regex(/^[A-N]\d{4}$/, 'Code ROME invalide');
const codeOnet = z.string().regex(/^\d{2}-\d{4}\.\d{2}$/);

/** Qualité de la chaîne de correspondance (« manuelle » : ajoutée à la relecture). */
export const qualiteCorrespondance = z.enum([
  'exacte',
  'approchee',
  'incertaine',
  'proche',
  'manuelle',
]);
export const statutCorrespondance = z.enum(['valide', 'a_valider']);

const versions = z.object({
  onet_esco: z.object({ titre: z.string(), url: z.url() }),
  esco_rome: z.object({ titre: z.string(), rome: z.string().nullable(), url: z.url() }),
  rome: z.object({
    version: z.string().nullable(),
    titre: z.string().nullable(),
    publie_le: z.string().nullable(),
    url: z.url(),
  }),
  onisep: z.object({ modifie_le: z.string().nullable(), url: z.url() }),
  /** null tant que l'export RNCP n'a pas pu être importé. */
  rncp: z
    .object({ fichier: z.string(), url: z.url().nullable(), modifie: z.string().optional() })
    .nullable(),
});

/** Code OGR d'une appellation ROME (ex. « 38400 »). */
const codeOgr = z.string().regex(/^\d+$/);

const lien = z.object({
  rome: codeRome,
  qualite: qualiteCorrespondance,
  statut: statutCorrespondance,
  /** Appellation ROME affichée à la place de l'intitulé de la fiche (choisie à la relecture). */
  appellation: codeOgr.optional(),
});

export const correspondancesFrSchema = z
  .object({
    genere_le: z.iso.date(),
    versions,
    note: z.string(),
    correspondances: z.record(codeOnet, z.array(lien).min(1)),
    libelles: z.record(codeRome, z.string().min(1)),
    appellations: z.record(codeOgr, z.string().min(1)),
  })
  .superRefine((d, ctx) => {
    for (const [onet, liens] of Object.entries(d.correspondances)) {
      const vus = new Set<string>();
      for (const l of liens) {
        if (vus.has(l.rome))
          ctx.addIssue({ code: 'custom', message: `${onet} : doublon ${l.rome}` });
        vus.add(l.rome);
        // Jamais de métier affiché sans correspondance validée ou de type acceptable.
        if (l.statut !== 'valide' && !['exacte', 'approchee'].includes(l.qualite)) {
          ctx.addIssue({
            code: 'custom',
            message: `${onet} → ${l.rome} : qualité ${l.qualite} affichée sans validation`,
          });
        }
        if (!d.libelles[l.rome]) {
          ctx.addIssue({ code: 'custom', message: `${l.rome} : libellé manquant` });
        }
        if (
          l.appellation !== undefined &&
          (l.statut !== 'valide' || !d.appellations[l.appellation])
        ) {
          ctx.addIssue({
            code: 'custom',
            message: `${onet} → ${l.rome} : appellation ${l.appellation} non validée ou sans libellé`,
          });
        }
      }
    }
  });

export const NIVEAUX_RNCP = [3, 4, 5, 6, 7, 8] as const;

export const certificationSchema = z.object({
  numero: z.string().regex(/^RNCP\d+$/, 'Seules les fiches RNCP sont affichées'),
  intitule: z.string().min(1),
  niveau: z
    .number()
    .int()
    .refine((n) => (NIVEAUX_RNCP as readonly number[]).includes(n))
    .nullable(),
  lien: z.url().regex(/^https:\/\/www\.francecompetences\.fr\/recherche\/rncp\/\d+\/$/),
});

export const metierRomeSchema = z.object({
  code: codeRome,
  libelle: z.string().min(1),
  grand_domaine: z.string().min(1).nullable(),
  definition: z.array(z.string().min(1)),
  acces_metier: z.array(z.string().min(1)),
  riasec: z.object({ majeur: z.string(), mineur: z.string() }).nullable(),
  lien_metierscope: z
    .url()
    .regex(/^https:\/\/candidat\.francetravail\.fr\/metierscope\/fiche-metier\/[A-N]\d{4}$/),
  /** null : export RNCP pas encore importé (affiché « en cours d'import »). */
  certifications: z.array(certificationSchema).max(5).nullable(),
  onet: z
    .array(
      z.object({
        code: codeOnet,
        titre: z.string().min(1),
        qualite: qualiteCorrespondance,
        statut: statutCorrespondance,
        appellation: z.string().min(1).optional(),
      }),
    )
    .min(1),
});

export const metiersRomeSchema = z.object({
  genere_le: z.iso.date(),
  versions,
  attribution: z.string().min(1),
  fiches: z.record(codeRome, metierRomeSchema),
});

export const onisepRomeSchema = z.object({
  genere_le: z.iso.date(),
  licence: z.literal('ODbL 1.0'),
  attribution: z.string().min(1),
  source: z.url(),
  modifie_le: z.string().nullable(),
  fiches: z.record(
    codeRome,
    z.array(
      z.object({
        libelle: z.string().min(1),
        lien: z.url().regex(/^https:\/\/www\.onisep\.fr\//),
      }),
    ),
  ),
});

export const validationsFrSchema = z.object({
  note: z.string(),
  validations: z.array(
    z.object({
      onet: codeOnet,
      rome: codeRome,
      decision: z.enum(['valide', 'rejete']),
      appellation: codeOgr.optional(),
      note: z.string().optional(),
      date: z.iso.date().optional(),
    }),
  ),
});

/** Précisions de l'équipe affichées sur une fiche ROME (toujours sourcées). */
export const notesFichesSchema = z.object({
  note: z.string(),
  notes: z.record(
    codeRome,
    z.object({ texte: z.string().min(1), sources: z.array(z.string().min(1)).min(1) }),
  ),
});

export type MetierRome = z.infer<typeof metierRomeSchema>;
export type MetiersRome = z.infer<typeof metiersRomeSchema>;
