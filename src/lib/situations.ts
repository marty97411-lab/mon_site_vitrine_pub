/**
 * Données de la section « Ma situation » : moments de vie, question facultative des résultats et
 * dispositifs d'aide. Contrôle des références au build (fonction pure, testée).
 */
import configJson from '../data/situations.json';
import dispositifsJson from '../data/dispositifs.json';
import {
  configSituationsSchema,
  dispositifsSchema,
  type Dispositif,
  type Situation,
} from './schemas';
import { compterMots, MOTS_PAR_MINUTE } from './lecture';

export const configSituations = configSituationsSchema.parse(configJson);
export const dispositifs = dispositifsSchema.parse(dispositifsJson);

export function dispositifsParIds(ids: readonly string[]): Dispositif[] {
  return ids
    .map((id) => dispositifs.dispositifs.find((d) => d.id === id))
    .filter((d): d is Dispositif => d !== undefined);
}

interface Identifiants {
  dispositifs: ReadonlySet<string>;
  philosophie: ReadonlySet<string>;
  livres: ReadonlySet<string>;
}

/** Lève une erreur si un article cite un dispositif, une page, un livre ou un article inconnu. */
export function verifierSituations(
  situations: readonly { id: string; data: Situation }[],
  ids: Identifiants,
  config: { question_resultats: { options: readonly { valeur: string; article: string }[] } },
): void {
  const idsSituations = new Set(situations.map((s) => s.id));
  const erreurs: string[] = [];
  for (const { id, data } of situations) {
    for (const d of data.dispositifs)
      if (!ids.dispositifs.has(d)) erreurs.push(`${id} : dispositif inconnu « ${d} »`);
    for (const p of data.philosophie)
      if (!ids.philosophie.has(p)) erreurs.push(`${id} : page Philosophie inconnue « ${p} »`);
    for (const l of data.livres)
      if (!ids.livres.has(l)) erreurs.push(`${id} : livre inconnu « ${l} »`);
    for (const a of data.articles_lies)
      if (!idsSituations.has(a) || a === id) erreurs.push(`${id} : article lié invalide « ${a} »`);
  }
  for (const o of config.question_resultats.options)
    if (!idsSituations.has(o.article))
      erreurs.push(`situations.json : article inconnu « ${o.article} » (option ${o.valeur})`);
  if (erreurs.length > 0) throw new Error(`Section « Ma situation » :\n${erreurs.join('\n')}`);
}

/** Textes visibles sans dépliage (pour le temps de lecture « rapide »). */
export function texteVisible(s: Situation): string[] {
  return [
    s.essentiel,
    s.ressenti.texte,
    s.recherche.essentiel,
    s.recherche.comprendre,
    ...s.pistes.flatMap((p) => [p.titre, p.texte]),
  ];
}

/** Textes repliés par défaut. */
export function texteReplie(s: Situation, corps: string | undefined): string[] {
  return [
    corps ?? '',
    s.ressenti.exemple_fictif ?? '',
    ...s.ressenti.chiffres.map((c) => c.texte),
    ...s.cas_particuliers.flatMap((c) => [c.titre, c.texte]),
    ...s.idees_recues.flatMap((i) => [i.affirmation, i.explication]),
    ...s.questions,
  ];
}

/** Minutes de lecture, arrondies, au moins une. */
export function minutes(textes: readonly string[]): number {
  const mots = textes.reduce((n, t) => n + compterMots(t), 0);
  return Math.max(1, Math.round(mots / MOTS_PAR_MINUTE));
}
