/**
 * Accès centralisé au contenu. Au premier appel (donc au build), vérifie que
 * toutes les sources citées existent : une référence cassée fait échouer le build.
 */
import { getCollection, type CollectionEntry } from 'astro:content';
import { verifierReferences, type Reference } from './integrite';
import type { Affirmation } from './schemas';

export interface Contenu {
  sources: CollectionEntry<'sources'>[];
  items: CollectionEntry<'items'>[];
  traits: CollectionEntry<'traits'>[];
  metiers: CollectionEntry<'metiers'>[];
}

let cache: Promise<Contenu> | undefined;

function refsAffirmations(origine: string, affirmations: readonly Affirmation[]): Reference[] {
  return affirmations.flatMap((a, i) =>
    a.sources.map((idSource) => ({ origine: `${origine}[${i}]`, idSource })),
  );
}

async function charger(): Promise<Contenu> {
  const [sources, items, traits, metiers] = await Promise.all([
    getCollection('sources'),
    getCollection('items'),
    getCollection('traits'),
    getCollection('metiers'),
  ]);

  const refs: Reference[] = [];
  for (const { id, data } of items) {
    refs.push({ origine: `items/${id}`, idSource: data.source });
    if (data.traduction.source) {
      refs.push({ origine: `items/${id} → traduction`, idSource: data.traduction.source });
    }
  }
  for (const { id, data } of traits) {
    refs.push(...data.sources.map((idSource) => ({ origine: `traits/${id}`, idSource })));
  }
  for (const { id, data } of metiers) {
    const o = `metiers/${id}`;
    refs.push(...data.sources.map((idSource) => ({ origine: o, idSource })));
    refs.push({ origine: `${o} → riasec`, idSource: data.riasec.source });
    refs.push(
      ...refsAffirmations(
        `${o} → traits_pertinents`,
        data.traits_pertinents.map((t) => t.justification),
      ),
    );
    refs.push(...refsAffirmations(`${o} → points_forts`, data.points_forts));
    refs.push(...refsAffirmations(`${o} → points_vigilance`, data.points_vigilance));
  }
  verifierReferences(new Set(sources.map((s) => s.id)), refs);

  traits.sort((a, b) => a.data.ordre - b.data.ordre);
  metiers.sort((a, b) => a.data.intitule.localeCompare(b.data.intitule, 'fr'));
  return { sources, items, traits, metiers };
}

export function chargerContenu(): Promise<Contenu> {
  cache ??= charger();
  return cache;
}

export function sourcesParIds(contenu: Contenu, ids: readonly string[]) {
  const uniques = [...new Set(ids)];
  return uniques
    .map((id) => contenu.sources.find((s) => s.id === id))
    .filter((s): s is CollectionEntry<'sources'> => s !== undefined);
}
