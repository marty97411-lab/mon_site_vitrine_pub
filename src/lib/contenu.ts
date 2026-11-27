/**
 * Accès centralisé au contenu. Au premier appel (donc au build), vérifie que
 * toutes les sources citées existent : une référence cassée fait échouer le build.
 */
import { getCollection, type CollectionEntry } from 'astro:content';
import { verifierReferences, type Reference } from './integrite';
import {
  famillesSchema,
  jobZonesSchema,
  metiersOnetSchema,
  type Affirmation,
  type Questionnaire,
} from './schemas';
import metiersJson from '../data/onet/metiers.json';
import famillesJson from '../data/onet/familles.json';
import jobZonesJson from '../data/onet/job-zones.json';

export interface Contenu {
  sources: CollectionEntry<'sources'>[];
  questionnaires: CollectionEntry<'questionnaires'>[];
  parcours: CollectionEntry<'parcours'>[];
  traits: CollectionEntry<'traits'>[];
  metiers: CollectionEntry<'metiers'>[];
  situations: CollectionEntry<'situations'>[];
  philosophie: CollectionEntry<'philosophie'>[];
}

let cache: Promise<Contenu> | undefined;

function refsAffirmations(origine: string, affirmations: readonly Affirmation[]): Reference[] {
  return affirmations.flatMap((a, i) =>
    a.sources.map((idSource) => ({ origine: `${origine}[${i}]`, idSource })),
  );
}

async function charger(): Promise<Contenu> {
  const [sources, questionnaires, parcours, traits, metiers, situations, philosophie] =
    await Promise.all([
      getCollection('sources'),
      getCollection('questionnaires'),
      getCollection('parcours'),
      getCollection('traits'),
      getCollection('metiers'),
      getCollection('situations'),
      getCollection('philosophie'),
    ]);

  const refs: Reference[] = [];
  for (const { data: q } of questionnaires) {
    for (const idSource of [q.source, ...q.sources_complementaires]) {
      refs.push({ origine: `questionnaires/${q.id}`, idSource });
    }
    if (q.traduction.source) {
      refs.push({ origine: `questionnaires/${q.id} → traduction`, idSource: q.traduction.source });
    }
  }
  for (const [nom, json, schema] of [
    ['onet/metiers.json', metiersJson, metiersOnetSchema],
    ['onet/familles.json', famillesJson, famillesSchema],
    ['onet/job-zones.json', jobZonesJson, jobZonesSchema],
  ] as const) {
    refs.push({ origine: nom, idSource: schema.parse(json).source });
  }
  for (const { id, data } of traits) {
    refs.push(...data.sources.map((idSource) => ({ origine: `traits/${id}`, idSource })));
    refs.push(...refsAffirmations(`traits/${id} → atouts`, data.atouts));
    refs.push(...refsAffirmations(`traits/${id} → couts`, data.couts));
  }
  for (const [nom, entrees] of [
    ['situations', situations],
    ['philosophie', philosophie],
  ] as const) {
    for (const { id, data } of entrees) {
      refs.push(...data.sources.map((idSource) => ({ origine: `${nom}/${id}`, idSource })));
    }
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

  const idsQuestionnaires = new Set(questionnaires.map((q) => q.data.id));
  for (const { data: p } of parcours) {
    for (const q of p.questionnaires) {
      if (!idsQuestionnaires.has(q))
        throw new Error(`Parcours ${p.id} : questionnaire inconnu ${q}`);
    }
  }

  traits.sort((a, b) => a.data.ordre - b.data.ordre);
  metiers.sort((a, b) => a.data.intitule.localeCompare(b.data.intitule, 'fr'));
  parcours.sort((a) => (a.data.id === 'rapide' ? -1 : 1));
  situations.sort((a, b) => a.data.ordre - b.data.ordre);
  philosophie.sort((a, b) => a.data.ordre - b.data.ordre);
  return { sources, questionnaires, parcours, traits, metiers, situations, philosophie };
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

export function questionnaireParId(contenu: Contenu, id: string): Questionnaire {
  const q = contenu.questionnaires.find((x) => x.data.id === id);
  if (!q) throw new Error(`Questionnaire inconnu : ${id}`);
  return q.data;
}
