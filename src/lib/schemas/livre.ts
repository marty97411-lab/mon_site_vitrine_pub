import { z } from 'astro/zod';
import { isbnValide } from '../isbn';

export const THEMES_LIVRES = [
  'connaissance-de-soi',
  'orientation',
  'reconversion',
  'sens-du-travail',
  'motivation',
  'bien-etre',
  'philosophie-de-vie',
] as const;

export const LIBELLES_THEMES: Record<(typeof THEMES_LIVRES)[number], string> = {
  'connaissance-de-soi': 'Connaissance de soi et personnalité',
  orientation: 'Orientation et choix de carrière',
  reconversion: 'Reconversion',
  'sens-du-travail': 'Sens du travail',
  motivation: 'Motivation',
  'bien-etre': 'Bien-être',
  'philosophie-de-vie': 'Philosophie de vie',
};

export const LIBELLES_ETIQUETTES = {
  recherche: 'Fondé sur la recherche',
  philosophie: 'Philosophie',
  temoignage: 'Témoignage / inspiration',
} as const;

/**
 * Livre conseillé. Règle : chaque livre a été vérifié (titre, auteur, année, éditeur, ISBN quand
 * il est connu) ; jamais de livre ni de résumé inventés.
 */
export const livreSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
    titre: z.string().min(1),
    sous_titre: z.string().optional(),
    auteurs: z.array(z.string().min(1)).min(1),
    /** « dir. » pour un ouvrage collectif. */
    direction: z.boolean().default(false),
    traducteurs: z.array(z.string().min(1)).default([]),
    annee: z.number().int().min(1500).max(2100),
    /** Précision sur l'édition (première édition, réédition…), si elle est vérifiée. */
    note_edition: z.string().optional(),
    editeur: z.string().min(1),
    isbn: z.string().refine(isbnValide, 'ISBN invalide (clé de contrôle)').nullable(),
    langue: z.enum(['fr', 'en']),
    domaine_public: z.boolean().default(false),
    etiquette: z.enum(['recherche', 'philosophie', 'temoignage']),
    /** Obligatoire pour un livre populaire mais contesté. */
    note_controverse: z.string().optional(),
    niveau: z.enum(['accessible', 'exigeant']),
    themes: z.array(z.enum(THEMES_LIVRES)).min(1),
    resume: z.string().min(1),
    pour_qui: z.string().min(1),
    a_garder_en_tete: z.string().min(1),
    /** Lien de lecture ou de notice vérifié (DOI, Wikisource), en plus des recherches BnF/Amazon. */
    lien: z.object({ url: z.url(), libelle: z.string().min(1) }).optional(),
    verification: z.object({
      date: z.iso.date(),
      /** Notices consultées : DOI de la notice Crossref, compte rendu, page Wikisource. */
      preuves: z.array(z.string().min(1)).min(1),
      /** Ce qui reste à vérifier (ISBN, traducteur…). */
      reste_a_verifier: z.string().optional(),
    }),
    brouillon: z.boolean().default(true),
  })
  .refine(
    (l) => l.isbn !== null || l.verification.reste_a_verifier !== undefined || l.domaine_public,
    {
      message:
        'Sans ISBN, préciser ce qui reste à vérifier (sauf texte du domaine public en ligne)',
    },
  );

export type Livre = z.infer<typeof livreSchema>;

/**
 * Auteur à découvrir dont les livres n'ont pas encore pu être vérifiés : on cite l'auteur et son
 * domaine, jamais un titre précis. La présentation reste à vérifier.
 */
export const auteurAVerifierSchema = z.object({
  id: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
  nom: z.string().min(1),
  presentation: z.string().min(1).max(200),
  etiquette: z.enum(['recherche', 'philosophie', 'temoignage']),
  themes: z.array(z.enum(THEMES_LIVRES)).min(1),
  note: z.string().optional(),
});

export type AuteurAVerifier = z.infer<typeof auteurAVerifierSchema>;
