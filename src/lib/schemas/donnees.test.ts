/**
 * Vérifie que les fichiers de données respectent leurs schémas, que la structure de chaque
 * questionnaire est conforme à sa source et que les références à des sources existent.
 */
import { describe, expect, it } from 'vitest';
import neo from '../../data/questionnaires/ipip-neo-120.json';
import bffm from '../../data/questionnaires/ipip-bffm-50.json';
import ip60 from '../../data/questionnaires/onet-ip-60.json';
import mini from '../../data/questionnaires/onet-mini-ip-30.json';
import parcoursJson from '../../data/parcours.json';
import metiersJson from '../../data/onet/metiers.json';
import famillesJson from '../../data/onet/familles.json';
import jobZonesJson from '../../data/onet/job-zones.json';
import normes from '../../data/normes/normes.json';
import sources from '../../content/sources/sources.json';
import { FACETTE_IDS, RIASEC, TRAITS } from '../big-five';
import {
  famillesSchema,
  jobZonesSchema,
  metiersOnetSchema,
  normesSchema,
  parcoursSchema,
  questionnaireSchema,
  sourceSchema,
} from './index';

const idsSources = new Set(sources.map((s) => s.id));
const questionnaires = [neo, bffm, ip60, mini].map((q) => questionnaireSchema.parse(q));
const [qNeo, qBffm, qIp60, qMini] = questionnaires as [
  (typeof questionnaires)[0],
  (typeof questionnaires)[0],
  (typeof questionnaires)[0],
  (typeof questionnaires)[0],
];

function compter<T>(valeurs: readonly T[]): Map<T, number> {
  const m = new Map<T, number>();
  for (const v of valeurs) m.set(v, (m.get(v) ?? 0) + 1);
  return m;
}

describe('sources.json', () => {
  it('respecte le schéma, sans identifiant en double', () => {
    for (const s of sources) expect(() => sourceSchema.parse(s), s.id).not.toThrow();
    expect(idsSources.size).toBe(sources.length);
  });
});

describe('questionnaires', () => {
  it('citent des sources existantes', () => {
    for (const q of questionnaires) {
      for (const id of [q.source, ...q.sources_complementaires]) {
        expect(idsSources.has(id), `${q.id} → ${id}`).toBe(true);
      }
    }
  });

  it('IPIP-NEO-120 : 120 items, 30 facettes de 4 items', () => {
    expect(qNeo.items).toHaveLength(120);
    const parFacette = compter(qNeo.items.map((i) => i.facette));
    expect(parFacette.size).toBe(30);
    for (const f of FACETTE_IDS) expect(parFacette.get(f), f).toBe(4);
  });

  it('Big-Five Factor Markers : 50 items, 10 par trait, ordre officiel 1 à 50', () => {
    expect(qBffm.items).toHaveLength(50);
    const parTrait = compter(qBffm.items.map((i) => i.domaine));
    for (const t of TRAITS) expect(parTrait.get(t), t).toBe(10);
    expect(qBffm.items.map((i) => i.position_originale)).toEqual(
      Array.from({ length: 50 }, (_, i) => i + 1),
    );
  });

  it('Interest Profiler 60 : 10 items par dimension', () => {
    expect(qIp60.items).toHaveLength(60);
    const parDim = compter(qIp60.items.map((i) => i.domaine));
    for (const d of RIASEC) expect(parDim.get(d), d).toBe(10);
  });

  it('Mini-IP : 5 items par dimension, tous présents dans l’IP 60 avec la même dimension', () => {
    expect(qMini.items).toHaveLength(30);
    const parDim = compter(qMini.items.map((i) => i.domaine));
    for (const d of RIASEC) expect(parDim.get(d), d).toBe(5);
    const ip = new Map(qIp60.items.map((i) => [i.id, i]));
    for (const item of qMini.items) {
      expect(ip.get(item.id)?.texte_original, item.id).toBe(item.texte_original);
      expect(ip.get(item.id)?.domaine, item.id).toBe(item.domaine);
    }
  });

  it('un même identifiant désigne partout le même texte original', () => {
    const textes = new Map<string, string>();
    for (const q of questionnaires) {
      for (const item of q.items) {
        const deja = textes.get(item.id);
        if (deja !== undefined) expect(item.texte_original, item.id).toBe(deja);
        textes.set(item.id, item.texte_original);
      }
    }
  });

  it('les items O*NET sont reproduits à l’identique (licence CC BY-ND)', () => {
    for (const q of [qIp60, qMini]) {
      for (const item of q.items) expect(item.texte).toBe(item.texte_original);
    }
  });
});

describe('parcours.json', () => {
  it('respecte le schéma et pointe vers des questionnaires existants', () => {
    const ids = new Set(questionnaires.map((q) => q.id));
    for (const p of parcoursJson) {
      const parse = parcoursSchema.parse(p);
      for (const q of parse.questionnaires) expect(ids.has(q)).toBe(true);
    }
  });
});

describe('données O*NET', () => {
  const metiers = metiersOnetSchema.parse(metiersJson);
  const familles = famillesSchema.parse(famillesJson);
  it('respectent leurs schémas et citent des sources existantes', () => {
    expect(idsSources.has(metiers.source)).toBe(true);
    expect(idsSources.has(familles.source)).toBe(true);
    expect(idsSources.has(jobZonesSchema.parse(jobZonesJson).source)).toBe(true);
  });
  it('chaque métier appartient à une famille connue, sans code en double', () => {
    const codesFamilles = new Set(familles.familles.map((f) => f.code));
    for (const m of metiers.metiers) expect(codesFamilles.has(m.famille), m.code).toBe(true);
    expect(new Set(metiers.metiers.map((m) => m.code)).size).toBe(metiers.metiers.length);
  });
});

describe('normes.json', () => {
  it('respecte le schéma', () => {
    expect(() => normesSchema.parse(normes)).not.toThrow();
  });
});
