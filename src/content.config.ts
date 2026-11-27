/**
 * Collections de contenu Astro. Les schémas Zod sont définis dans src/lib/schemas/
 * pour pouvoir être réutilisés (et testés) en dehors d'Astro.
 */
import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { itemSchema, metierSchema, sourceSchema, traitSchema } from './lib/schemas';

const sources = defineCollection({
  loader: file('src/content/sources/sources.json'),
  schema: sourceSchema,
});

const items = defineCollection({
  loader: file('src/data/items/items.json'),
  schema: itemSchema,
});

const traits = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/traits' }),
  schema: traitSchema,
});

const metiers = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/metiers' }),
  schema: metierSchema,
});

export const collections = { sources, items, traits, metiers };
