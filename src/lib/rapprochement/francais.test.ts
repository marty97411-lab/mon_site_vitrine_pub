// Données FICTIVES (codes O*NET et ROME inventés pour le test).
import { describe, expect, it } from 'vitest';
import type { Correspondance, MetierProfil, NiveauCorrespondance } from './index';
import { lienFicheRome, versMetiersFrancais } from './francais';

const profil = { R: 1, I: 1, A: 1, S: 1, E: 1, C: 1 };
const corr = (
  code: string,
  famille: string,
  r: number,
  niveau: NiveauCorrespondance = 'forte',
): Correspondance<MetierProfil> => ({ metier: { code, famille, riasec: profil }, r, niveau });

const libelles = { Z0001: 'Un', Z0002: 'Deux', Z0003: 'Trois', Z0004: 'Quatre' };

describe('versMetiersFrancais', () => {
  it('ignore les métiers O*NET sans fiche ROME et fusionne les doublons', () => {
    const r = versMetiersFrancais(
      [
        corr('00-0001.00', '11', 0.9, 'tres-forte'),
        corr('00-0002.00', '11', 0.8),
        corr('00-0003.00', '13', 0.7),
        corr('00-0004.00', '13', 0.6, 'moderee'),
      ],
      {
        '00-0001.00': [{ rome: 'Z0001', statut: 'valide' }],
        '00-0002.00': [{ rome: 'Z0001', statut: 'a_valider' }],
        '00-0003.00': [
          { rome: 'Z0001', statut: 'valide' },
          { rome: 'Z0002', statut: 'valide' },
        ],
      },
      libelles,
    );
    expect(r.map((f) => f.famille)).toEqual(['11', '13']);
    const [f11, f13] = r;
    expect(f11?.metiers.map((m) => m.rome)).toEqual(['Z0001']);
    expect(f11?.metiers[0]).toMatchObject({ libelle: 'Un', niveau: 'tres-forte', nonRelue: true });
    expect(f11?.metiers[0]?.onet.map((c) => c.metier.code)).toEqual([
      '00-0001.00',
      '00-0002.00',
      '00-0003.00',
    ]);
    // Z0001 déjà affiché : seule Z0002 apparaît dans la famille 13.
    expect(f13?.metiers.map((m) => m.rome)).toEqual(['Z0002']);
    expect(f13?.metiers[0]?.nonRelue).toBe(false);
  });

  it('respecte les limites de familles et de métiers par famille', () => {
    const table = Object.fromEntries(
      ['Z0001', 'Z0002', 'Z0003', 'Z0004'].map((rome, i) => [
        `00-000${i + 1}.00`,
        [{ rome, statut: 'valide' as const }],
      ]),
    );
    const c = [
      corr('00-0001.00', '11', 0.9),
      corr('00-0002.00', '11', 0.8),
      corr('00-0003.00', '13', 0.7),
      corr('00-0004.00', '15', 0.6),
    ];
    const r = versMetiersFrancais(c, table, libelles, { familles: 2, parFamille: 1 });
    expect(r.map((f) => [f.famille, f.metiers.map((m) => m.rome)])).toEqual([
      ['11', ['Z0001']],
      ['13', ['Z0003']],
    ]);
  });

  it('affiche l’appellation choisie et la distingue de l’intitulé de la fiche', () => {
    const r = versMetiersFrancais(
      [corr('00-0001.00', '11', 0.9), corr('00-0002.00', '11', 0.8)],
      {
        '00-0001.00': [{ rome: 'Z0001', statut: 'valide' }],
        '00-0002.00': [{ rome: 'Z0001', statut: 'valide', appellation: '99' }],
      },
      libelles,
      {},
      { '99': 'Appellation fictive' },
    );
    expect(r[0]?.metiers.map((m) => [m.rome, m.libelle])).toEqual([
      ['Z0001', 'Un'],
      ['Z0001', 'Appellation fictive'],
    ]);
  });

  it('garde la spécialité et distingue deux spécialités d’une même fiche', () => {
    const r = versMetiersFrancais(
      [corr('00-0001.00', '11', 0.9), corr('00-0002.00', '11', 0.8)],
      {
        '00-0001.00': [{ rome: 'Z0001', statut: 'a_valider', specialite: 'spécialité A' }],
        '00-0002.00': [{ rome: 'Z0001', statut: 'a_valider', specialite: 'spécialité B' }],
      },
      libelles,
    );
    expect(r[0]?.metiers.map((m) => m.specialite)).toEqual(['spécialité A', 'spécialité B']);
  });

  it('construit le lien vers la fiche avec le niveau dans l’adresse', () => {
    expect(lienFicheRome('Z0001', 'forte')).toBe('/metiers/rome/Z0001?niveau=forte');
    expect(lienFicheRome('Z0001')).toBe('/metiers/rome/Z0001');
  });
});
