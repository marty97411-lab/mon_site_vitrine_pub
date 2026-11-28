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
  recommandationsSchema,
  type Affirmation,
  type Questionnaire,
} from './schemas';
import metiersJson from '../data/onet/metiers.json';
import famillesJson from '../data/onet/familles.json';
import jobZonesJson from '../data/onet/job-zones.json';
import recommandationsJson from '../data/recommandations.json';

export interface Contenu {
  sources: CollectionEntry<'sources'>[];
  questionnaires: CollectionEntry<'questionnaires'>[];
  parcours: CollectionEntry<'parcours'>[];
  traits: CollectionEntry<'traits'>[];
  metiers: CollectionEntry<'metiers'>[];
  situations: CollectionEntry<'situations'>[];
  philosophie: CollectionEntry<'philosophie'>[];
  introversion: CollectionEntry<'introversion'>[];
  livres: CollectionEntry<'livres'>[];
}

let cache: Promise<Contenu> | undefined;

function refsAffirmations(origine: string, affirmations: readonly Affirmation[]): Reference[] {
  return affirmations.flatMap((a, i) =>
    a.sources.map((idSource) => ({ origine: `${origine}[${i}]`, idSource })),
  );
}

async function charger(): Promise<Contenu> {
  const [
    sources,
    questionnaires,
    parcours,
    traits,
    metiers,
    situations,
    philosophie,
    introversion,
    livres,
  ] = await Promise.all([
    getCollection('sources'),
    getCollection('questionnaires'),
    getCollection('parcours'),
    getCollection('traits'),
    getCollection('metiers'),
    getCollection('situations'),
    getCollection('philosophie'),
    getCollection('introversion'),
    getCollection('livres'),
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
    ['introversion', introversion],
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
  // Recommandations : toute référence à un livre ou à un article doit exister.
  const config = recommandationsSchema.parse(recommandationsJson);
  const idsLivres = new Set(livres.map((l) => l.data.id));
  const idsArticles = new Set([
    ...situations.map((e) => `situations/${e.id}`),
    ...philosophie.map((e) => `philosophie/${e.id}`),
    ...traits.map((e) => `traits/${e.id}`),
    ...introversion.map((e) => `introversion/${e.id}`),
  ]);
  for (const regle of config.regles) {
    for (const id of regle.livres) {
      if (!idsLivres.has(id)) throw new Error(`Recommandation ${regle.id} : livre inconnu ${id}`);
    }
    for (const id of regle.articles) {
      if (!idsArticles.has(id))
        throw new Error(`Recommandation ${regle.id} : article inconnu ${id}`);
    }
  }

  parcours.sort((a) => (a.data.id === 'rapide' ? -1 : 1));
  livres.sort((a, b) => a.data.titre.localeCompare(b.data.titre, 'fr'));
  situations.sort((a, b) => a.data.ordre - b.data.ordre);
  philosophie.sort((a, b) => a.data.ordre - b.data.ordre);
  introversion.sort((a, b) => a.data.ordre - b.data.ordre);
  return {
    sources,
    questionnaires,
    parcours,
    traits,
    metiers,
    situations,
    philosophie,
    introversion,
    livres,
  };
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

/** Titre et adresse de chaque article recommandable (« situations/… », « philosophie/… », « traits/… », « introversion/… »). */
export function catalogueArticles(
  contenu: Contenu,
): Record<string, { titre: string; url: string; badge: string }> {
  const catalogue: Record<string, { titre: string; url: string; badge: string }> = {};
  for (const e of contenu.situations) {
    catalogue[`situations/${e.id}`] = {
      titre: e.data.titre,
      url: `/situations/${e.id}`,
      badge: 'Science',
    };
  }
  for (const e of contenu.philosophie) {
    catalogue[`philosophie/${e.id}`] = {
      titre: e.data.titre,
      url: `/philosophie/${e.id}`,
      badge: 'Réflexion',
    };
  }
  for (const e of contenu.traits) {
    catalogue[`traits/${e.id}`] = { titre: e.data.nom, url: `/traits/${e.id}`, badge: 'Science' };
  }
  for (const e of contenu.introversion) {
    catalogue[`introversion/${e.id}`] = {
      titre: e.data.titre,
      url: `/explication/introversion-extraversion/${e.id}`,
      badge: 'Science',
    };
  }
  return catalogue;
}
