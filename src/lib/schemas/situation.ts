import { z } from 'astro/zod';
import { affirmationSchema, idSource } from './source';

/** Moments de vie de la page « Où en êtes-vous ? » (libellés dans src/data/situations.json). */
export const MOMENTS = ['transversal', 'etudes', 'questions', 'transition', 'suite'] as const;

const idContenu = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/);

/** Idée reçue : affirmation courante, verdict et explication sourcée (ou TODO explicite). */
export const ideeRecueSchema = z
  .object({
    affirmation: z.string().min(1),
    verdict: z.enum(['vrai', 'faux', 'nuance']),
    explication: z.string().min(1),
    sources: z.array(idSource).default([]),
    todo_source: z.boolean().default(false),
  })
  .refine((i) => i.sources.length > 0 || i.todo_source, {
    message: 'Idée reçue sans source : ajouter une source ou « todo_source: true »',
  });

export const LIBELLES_VERDICT = {
  vrai: 'Vrai',
  faux: 'Faux',
  nuance: "C'est plus nuancé",
} as const;

/**
 * Article « Ma situation » : modèle enrichi, identique pour tous (voir CLAUDE.md).
 * Le corps Markdown est le niveau « Approfondir » de « Ce que dit la recherche ».
 */
export const situationSchema = z.object({
  titre: z.string().min(1),
  /** Résumé pour le référencement et le chapeau. */
  description: z.string().min(1).max(200),
  /** Phrase d'accroche rassurante de la carte, sur la page « Où en êtes-vous ? ». */
  accroche: z.string().min(1).max(140),
  moment: z.enum(MOMENTS),
  ordre: z.number().int().min(0),
  badge: z.literal('science').default('science'),
  /** 1. L'essentiel : 3 ou 4 phrases, toujours visibles. */
  essentiel: z.string().min(1),
  /** 2. Ce que vous ressentez peut-être (paragraphes séparés par une ligne vide). */
  ressenti: z.object({
    texte: z.string().min(1),
    /** Données qui montrent que le lecteur n'est pas seul : sourcées ou TODO. */
    chiffres: z.array(affirmationSchema).default([]),
    /** Exemple de parcours, toujours présenté comme fictif. */
    exemple_fictif: z.string().min(1).optional(),
  }),
  /** 3. Ce que dit la recherche : L'essentiel et Comprendre (Approfondir = corps Markdown). */
  recherche: z.object({
    essentiel: z.string().min(1),
    comprendre: z.string().min(1),
    sources: z.array(idSource).min(1),
  }),
  /** Sous-parties dépliables pour des cas très différents (ex. reprise après un arrêt). */
  cas_particuliers: z
    .array(
      z.object({
        titre: z.string().min(1),
        texte: z.string().min(1),
        sources: z.array(idSource).default([]),
      }),
    )
    .default([]),
  /** 4. Idées reçues : 3 à 5. */
  idees_recues: z.array(ideeRecueSchema).min(3).max(5),
  /** 5. Questions pour faire le point : 5 à 8. */
  questions: z.array(z.string().min(1)).min(5).max(8),
  /** 6. Pistes concrètes, dans un ordre logique. */
  pistes: z
    .array(
      z.object({
        titre: z.string().min(1),
        texte: z.string().min(1),
        lien: z.object({ href: z.string().min(1), libelle: z.string().min(1) }).optional(),
      }),
    )
    .min(3),
  /** 7. Aides et dispositifs : identifiants de src/data/dispositifs.json. */
  dispositifs: z.array(idContenu).default([]),
  /** 8. Le regard des philosophes : une ou deux pages de la section Philosophie. */
  philosophie: z.array(idContenu).min(1).max(2),
  /** 9. Pour aller plus loin : 2 à 4 livres conseillés et des articles liés. */
  livres: z.array(idContenu).min(2).max(4),
  articles_lies: z.array(idContenu).default([]),
  /** 10. Quand demander de l'aide : précision propre à la situation (le bloc commun est ajouté). */
  aide: z.string().min(1).optional(),
  brouillon: z.boolean().default(true),
});

export type Situation = z.infer<typeof situationSchema>;

/**
 * Dispositif d'aide en France. Les règles changent souvent : lien officiel et date de
 * vérification obligatoires ; sinon, `lien: null` et un TODO explicite (jamais de lien deviné).
 */
export const dispositifSchema = z
  .object({
    id: idContenu,
    nom: z.string().min(1),
    sigle: z.string().min(1).optional(),
    description: z.string().min(1),
    pour_qui: z.string().min(1),
    lien: z.object({ url: z.url(), libelle: z.string().min(1) }).nullable(),
    verifie_le: z.iso.date().nullable(),
    /** Source (sources.json) qui appuie la description. */
    source: idSource.nullable(),
    todo: z.string().min(1).optional(),
  })
  .refine((d) => d.lien === null || (d.verifie_le !== null && d.source !== null), {
    message: 'Un dispositif avec lien doit indiquer sa date de vérification et sa source',
  })
  .refine((d) => d.lien !== null || d.todo !== undefined, {
    message: 'Un dispositif sans lien vérifié doit porter un TODO explicite',
  });

export const dispositifsSchema = z.object({
  avertissement: z.string().min(1),
  dispositifs: z.array(dispositifSchema).min(1),
});

export type Dispositif = z.infer<typeof dispositifSchema>;

/** Moments de vie et question facultative de la page de résultats. */
export const configSituationsSchema = z.object({
  introduction: z.string().min(1),
  moments: z
    .array(
      z.object({
        id: z.enum(MOMENTS),
        titre: z.string().min(1),
        description: z.string().min(1),
      }),
    )
    .length(MOMENTS.length),
  question_resultats: z.object({
    question: z.string().min(1),
    aide: z.string().min(1),
    options: z
      .array(z.object({ valeur: idContenu, libelle: z.string().min(1), article: idContenu }))
      .min(1),
  }),
});
