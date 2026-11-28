// Tests de la correspondance O*NET → ROME → RNCP. Toutes les données ci-dessous sont
// FICTIVES (codes et intitulés inventés pour les besoins du test).
import { describe, expect, it } from 'vitest';
import {
  qualiteChaine,
  coherenceRiasec,
  construireCorrespondances,
  choisirAffichage,
  choisirCertifications,
  pearson,
  simulerApparitions,
  champCsv,
  lignesApresEntete,
  lienRncp,
  MAX_FICHES_PAR_METIER,
} from './correspondance-fr.mjs';
import { lireExportRncp, lireNiveau, lireActif } from './rncp.mjs';
import { correlation } from '../../src/lib/rapprochement/index.ts';

describe('qualiteChaine', () => {
  it('exacte seulement pour deux liens exacts', () => {
    expect(qualiteChaine('exactMatch', 'exactMatch')).toBe('exacte');
  });
  it('approchée pour un lien exact et un lien large ou étroit, ou deux liens dans le même sens', () => {
    expect(qualiteChaine('exactMatch', 'broadMatch')).toBe('approchee');
    expect(qualiteChaine('narrowMatch', 'exactMatch')).toBe('approchee');
    expect(qualiteChaine('broadMatch', 'broadMatch')).toBe('approchee');
  });
  it('incertaine pour deux liens de sens opposés', () => {
    expect(qualiteChaine('broadMatch', 'narrowMatch')).toBe('incertaine');
  });
  it('proche dès qu’un lien est « close » ou que le métier ne correspond qu’à un groupe ISCO', () => {
    expect(qualiteChaine('closeMatch', 'exactMatch')).toBe('proche');
    expect(qualiteChaine('exactMatch', 'closeMatch')).toBe('proche');
    expect(qualiteChaine('exactISCO', 'exactMatch')).toBe('proche');
  });
  it('refuse un type inconnu', () => {
    expect(() => qualiteChaine('relatedMatch', 'exactMatch')).toThrow();
  });
});

describe('coherenceRiasec', () => {
  it('compare le code O*NET aux dimensions majeure et mineure du ROME', () => {
    expect(coherenceRiasec('EC', { majeur: 'E', mineur: '' })).toBe(true);
    expect(coherenceRiasec('RS', { majeur: 'A', mineur: 'R' })).toBe(true);
    expect(coherenceRiasec('EC', { majeur: 'S', mineur: 'A' })).toBe(false);
    expect(coherenceRiasec('', { majeur: 'S', mineur: '' })).toBeNull();
    expect(coherenceRiasec('EC', undefined)).toBeNull();
  });
});

const fiche = (rome, qualite, extra = {}) => ({
  rome,
  libelle: rome,
  qualite,
  chemins: ['x'],
  soutien: 1,
  esco: [],
  coherence: true,
  statut: 'a_valider',
  note: '',
  ...extra,
});

describe('choisirAffichage', () => {
  it('n’affiche jamais une correspondance proche, incertaine, rejetée ou incohérente', () => {
    const r = choisirAffichage([
      fiche('Z0001', 'proche'),
      fiche('Z0002', 'incertaine'),
      fiche('Z0003', 'exacte', { statut: 'rejete' }),
      fiche('Z0004', 'approchee', { coherence: false }),
    ]);
    expect(r.filter((c) => c.affiche)).toEqual([]);
  });
  it('garde une correspondance exacte malgré des codes RIASEC divergents', () => {
    const r = choisirAffichage([fiche('Z0001', 'exacte', { coherence: false })]);
    expect(r[0]?.affiche).toBe(true);
  });
  it('affiche toujours une correspondance validée, même de qualité proche', () => {
    const r = choisirAffichage([fiche('Z0001', 'proche', { statut: 'valide' })]);
    expect(r[0]).toMatchObject({ affiche: true, raison: 'validée à la relecture' });
  });
  it('limite le nombre de fiches automatiques et classe les exactes en premier', () => {
    const r = choisirAffichage([
      fiche('Z0001', 'approchee', { soutien: 9 }),
      fiche('Z0002', 'approchee'),
      fiche('Z0003', 'exacte'),
      fiche('Z0004', 'approchee'),
      fiche('Z0005', 'approchee'),
    ]);
    const affichees = r.filter((c) => c.affiche);
    expect(affichees).toHaveLength(MAX_FICHES_PAR_METIER);
    expect(affichees[0].rome).toBe('Z0003');
    expect(affichees[1].rome).toBe('Z0001');
  });
});

describe('construireCorrespondances', () => {
  const base = {
    metiersOnet: [
      { code: '00-0001.00', titre: 'Fictif A', code_riasec: 'RI' },
      { code: '00-0002.00', titre: 'Fictif B', code_riasec: 'S' },
    ],
    onetEsco: [
      { onet: '00-0001.00', esco: 'esco:1', escoTitre: 'esco un', type: 'exactMatch' },
      { onet: '00-0002.00', esco: 'esco:2', escoTitre: 'esco deux', type: 'closeMatch' },
    ],
    escoRome: [
      { esco: 'esco:1', ogr: '11', type: 'exactMatch' },
      { esco: 'esco:1', ogr: '12', type: 'exactMatch' },
      { esco: 'esco:1', ogr: '99', type: 'exactMatch' }, // appellation absente du ROME
      { esco: 'esco:2', ogr: '21', type: 'exactMatch' },
    ],
    appellationVersFiche: new Map([
      ['11', 'Z1001'],
      ['12', 'Z1001'],
      ['21', 'Z2001'],
    ]),
    fiches: new Map([
      ['Z1001', { libelle: 'Métier fictif un', riasec: { majeur: 'R', mineur: '' } }],
      ['Z2001', { libelle: 'Métier fictif deux', riasec: { majeur: 'S', mineur: '' } }],
    ]),
    validations: [],
  };
  it('fusionne les appellations d’une même fiche et ignore celles absentes du ROME', () => {
    const t = construireCorrespondances(base);
    const a = t.get('00-0001.00');
    expect(a).toHaveLength(1);
    expect(a[0]).toMatchObject({ rome: 'Z1001', qualite: 'exacte', soutien: 2, affiche: true });
  });
  it('n’affiche pas une correspondance proche tant qu’elle n’est pas validée', () => {
    expect(construireCorrespondances(base).get('00-0002.00')[0].affiche).toBe(false);
    const t = construireCorrespondances({
      ...base,
      validations: [{ onet: '00-0002.00', rome: 'Z2001', decision: 'valide' }],
    });
    expect(t.get('00-0002.00')[0]).toMatchObject({ affiche: true, statut: 'valide' });
  });
  it('permet d’ajouter à la main une correspondance absente de la chaîne', () => {
    const t = construireCorrespondances({
      ...base,
      validations: [{ onet: '00-0002.00', rome: 'Z1001', decision: 'valide' }],
    });
    expect(t.get('00-0002.00').find((c) => c.rome === 'Z1001')).toMatchObject({
      qualite: 'manuelle',
      affiche: true,
    });
  });
  it('refuse une validation vers un code ROME inconnu ou une décision inconnue', () => {
    expect(() =>
      construireCorrespondances({
        ...base,
        validations: [{ onet: '00-0001.00', rome: 'Z9999', decision: 'valide' }],
      }),
    ).toThrow(/ROME inconnu/);
    expect(() =>
      construireCorrespondances({
        ...base,
        validations: [{ onet: '00-0001.00', rome: 'Z1001', decision: 'peut-etre' }],
      }),
    ).toThrow(/décision inconnue/);
  });
});

describe('choisirCertifications', () => {
  const certifs = [
    { numero: 'RNCP100', intitule: 'Inactive', niveau: 3, actif: false, codesRome: ['Z1001'] },
    {
      numero: 'RS200',
      intitule: 'Répertoire spécifique',
      niveau: null,
      actif: true,
      codesRome: ['Z1001'],
    },
    { numero: 'RNCP300', intitule: 'Large', niveau: 3, actif: true, codesRome: ['Z1001', 'Z2001'] },
    {
      numero: 'RNCP400',
      intitule: 'Spécifique niv 5',
      niveau: 5,
      actif: true,
      codesRome: ['Z1001'],
    },
    {
      numero: 'RNCP500',
      intitule: 'Spécifique niv 3',
      niveau: 3,
      actif: true,
      codesRome: ['Z1001'],
    },
    { numero: 'RNCP600', intitule: 'Autre métier', niveau: 3, actif: true, codesRome: ['Z2001'] },
  ];
  it('ne garde que des fiches RNCP actives liées au code ROME', () => {
    const r = choisirCertifications(certifs, 'Z1001');
    expect(r.map((c) => c.numero)).toEqual(['RNCP500', 'RNCP400', 'RNCP300']);
    expect(r.every((c) => c.lien === lienRncp(c.numero))).toBe(true);
  });
  it('en affiche au plus cinq', () => {
    const beaucoup = Array.from({ length: 9 }, (_, i) => ({
      numero: `RNCP${i + 1}`,
      intitule: 'x',
      niveau: 4,
      actif: true,
      codesRome: ['Z1001'],
    }));
    expect(choisirCertifications(beaucoup, 'Z1001')).toHaveLength(5);
  });
});

describe('lecture de l’export RNCP (format à confirmer, données fictives)', () => {
  it('lit niveaux et états', () => {
    expect(lireNiveau('NIV5')).toBe(5);
    expect(lireNiveau('')).toBeNull();
    expect(lireActif('ACTIVE')).toBe(true);
    expect(lireActif('INACTIVE')).toBe(false);
  });
  it('assemble fiches et codes ROME, et considère inactive une fiche ambiguë', () => {
    const r = lireExportRncp([
      {
        nom: 'export_fiches_CSV_Standard.csv',
        texte:
          'Numero_Fiche;Intitule;Nomenclature_Europe_Niveau;Actif\nRNCP1;Titre un;NIV3;ACTIVE\nRNCP2;Titre deux;NIV5;ACTIVE\nRNCP2;Titre deux;NIV5;INACTIVE\n',
      },
      {
        nom: 'export_fiches_CSV_Rome.csv',
        texte: 'Numero_Fiche;Codes_Rome_Code\nRNCP1;Z1001\nRNCP1;Z2001\nRNCP2;Z1001\n',
      },
    ]);
    expect(r).toEqual([
      {
        numero: 'RNCP1',
        intitule: 'Titre un',
        niveau: 3,
        actif: true,
        codesRome: ['Z1001', 'Z2001'],
      },
      { numero: 'RNCP2', intitule: 'Titre deux', niveau: 5, actif: false, codesRome: ['Z1001'] },
    ]);
  });
  it('s’arrête avec un message clair si une colonne attendue manque', () => {
    expect(() =>
      lireExportRncp([
        { nom: 'Standard.csv', texte: 'Autre;Colonne\n1;2\n' },
        { nom: 'Rome.csv', texte: 'Numero_Fiche;Codes_Rome_Code\nRNCP1;Z1001\n' },
      ]),
    ).toThrow(/Colonnes présentes : Autre, Colonne/);
  });
});

describe('outils', () => {
  it('la corrélation des scripts est identique à celle du site', () => {
    const x = [3, 2, 1, 0, 0, 0];
    const y = [2.1, 4.5, 1.2, 6.3, 3.3, 1.9];
    expect(pearson(x, y)).toBeCloseTo(correlation(x, y), 12);
  });
  it('la simulation compte des apparitions sur les 120 profils', () => {
    const metiers = [
      { code: 'a', famille: '1', riasec: { R: 7, I: 5, A: 1, S: 1, E: 1, C: 1 } },
      { code: 'b', famille: '2', riasec: { R: 1, I: 1, A: 1, S: 7, E: 5, C: 1 } },
    ];
    const c = simulerApparitions(metiers);
    expect((c.get('a') ?? 0) + (c.get('b') ?? 0)).toBeGreaterThan(0);
    expect(c.get('a')).toBeLessThanOrEqual(120);
  });
  it('échappe les champs CSV et lit une table au format ESCO', () => {
    expect(champCsv('a;b')).toBe('"a;b"');
    expect(champCsv('dit "oui"')).toBe('"dit ""oui"""');
    expect(lignesApresEntete([['Titre', 'x'], [''], ['Id', 'Nom'], ['1', 'Un']], 'Id')).toEqual([
      { Id: '1', Nom: 'Un' },
    ]);
  });
});
