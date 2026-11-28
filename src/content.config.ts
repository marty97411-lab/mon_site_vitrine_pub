/**
 * Collections de contenu Astro. Les schémas Zod sont définis dans src/lib/schemas/
 * pour pouvoir être réutilisés (et testés) en dehors d'Astro.
 */
import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import {
  articleSchema,
  auteurAVerifierSchema,
  livreSchema,
  metierSchema,
  parcoursSchema,
  questionnaireSchema,
  sourceSchema,
  traitSchema,
} from './lib/schemas';

const sources = defineCollection({
  loader: file('src/content/sources/sources.json'),
  schema: sourceSchema,
});

const questionnaires = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/data/questionnaires' }),
  schema: questionnaireSchema,
});

const parcours = defineCollection({
  loader: file('src/data/parcours.json'),
  schema: parcoursSchema,
});

const traits = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/traits' }),
  schema: traitSchema,
});

const metiers = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/metiers' }),
  schema: metierSchema,
});

const situations = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/situations' }),
  schema: articleSchema,
});

const philosophie = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/philosophie' }),
  schema: articleSchema,
});

const livres = defineCollection({
  loader: file('src/content/livres/livres.json'),
  schema: livreSchema,
});

const auteurs = defineCollection({
  loader: file('src/content/livres/auteurs-a-verifier.json'),
  schema: auteurAVerifierSchema,
});

export const collections = {
  livres,
  auteurs,
  sources,
  questionnaires,
  parcours,
  traits,
  metiers,
  situations,
  philosophie,
};
