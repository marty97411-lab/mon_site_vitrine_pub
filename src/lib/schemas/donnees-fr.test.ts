/**
 * Contrôle des données françaises générées (correspondance O*NET → ROME → RNCP) :
 * schémas, cohérence entre fichiers et respect des décisions de relecture.
 */
import { describe, expect, it } from 'vitest';
import correspondancesJson from '../../data/fr/correspondances.json';
import metiersRomeJson from '../../data/fr/metiers-rome.json';
import onisepJson from '../../data/fr/onisep-rome.json';
import validationsJson from '../../data/fr/validations.json';
import metiersOnetJson from '../../data/onet/metiers.json';
import {
  correspondancesFrSchema,
  metiersRomeSchema,
  onisepRomeSchema,
  validationsFrSchema,
} from './index';

const correspondances = correspondancesFrSchema.parse(correspondancesJson);
const metiersRome = metiersRomeSchema.parse(metiersRomeJson);
const onisep = onisepRomeSchema.parse(onisepJson);
const validations = validationsFrSchema.parse(validationsJson);
const codesOnet = new Set(metiersOnetJson.metiers.map((m) => m.code));

describe('données françaises (ROME, RNCP, Onisep)', () => {
  it('chaque métier O*NET relié existe dans la base O*NET du site', () => {
    for (const code of Object.keys(correspondances.correspondances)) {
      expect(codesOnet.has(code), code).toBe(true);
    }
  });

  it('chaque fiche ROME affichée a sa page, et chaque page est atteinte', () => {
    const atteintes = new Set(
      Object.values(correspondances.correspondances).flatMap((l) => l.map((x) => x.rome)),
    );
    for (const rome of atteintes) expect(metiersRome.fiches[rome], rome).toBeDefined();
    expect(new Set(Object.keys(metiersRome.fiches))).toEqual(atteintes);
  });

  it('aucun métier n’est affiché sans correspondance validée ou de type acceptable', () => {
    for (const fiche of Object.values(metiersRome.fiches)) {
      for (const o of fiche.onet) {
        expect(
          o.statut === 'valide' || ['exacte', 'approchee'].includes(o.qualite),
          `${o.code} → ${fiche.code}`,
        ).toBe(true);
      }
    }
  });

  it('une correspondance rejetée à la relecture n’est jamais affichée', () => {
    for (const v of validations.validations.filter((x) => x.decision === 'rejete')) {
      const liens = correspondances.correspondances[v.onet] ?? [];
      expect(
        liens.some((l) => l.rome === v.rome),
        `${v.onet} → ${v.rome}`,
      ).toBe(false);
    }
  });

  it('les certifications sont des fiches RNCP (jamais le RS), au plus cinq, sans doublon', () => {
    for (const fiche of Object.values(metiersRome.fiches)) {
      if (fiche.certifications === null) continue;
      const numeros = fiche.certifications.map((c) => c.numero);
      expect(new Set(numeros).size).toBe(numeros.length);
      for (const c of fiche.certifications) {
        expect(c.lien).toBe(
          `https://www.francecompetences.fr/recherche/rncp/${c.numero.slice(4)}/`,
        );
      }
    }
  });

  it('les certifications sont absentes si et seulement si l’export RNCP n’a pas été importé', () => {
    const sansRncp = metiersRome.versions.rncp === null;
    for (const fiche of Object.values(metiersRome.fiches)) {
      expect(fiche.certifications === null).toBe(sansRncp);
    }
  });

  it('les liens Onisep ne concernent que des fiches ROME affichées', () => {
    for (const code of Object.keys(onisep.fiches)) {
      expect(metiersRome.fiches[code], code).toBeDefined();
    }
  });

  it('les libellés affichés sur la page de résultats sont ceux des fiches', () => {
    for (const [code, libelle] of Object.entries(correspondances.libelles)) {
      expect(metiersRome.fiches[code]?.libelle).toBe(libelle);
    }
  });
});
