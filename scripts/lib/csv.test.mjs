import { describe, expect, it } from 'vitest';
import { analyserCsv, csvVersObjets } from './csv.mjs';

describe('analyserCsv', () => {
  it('lit des champs simples', () => {
    expect(analyserCsv('a,b\n1,2\n')).toEqual([
      ['a', 'b'],
      ['1', '2'],
    ]);
  });
  it('gère les guillemets, virgules et guillemets doublés', () => {
    expect(analyserCsv('"x, y","dit ""oui"""\n')).toEqual([['x, y', 'dit "oui"']]);
  });
  it('gère les fins de ligne CRLF, le BOM et une dernière ligne sans saut', () => {
    expect(analyserCsv(String.fromCharCode(0xfeff) + 'a,b\r\n1,2')).toEqual([
      ['a', 'b'],
      ['1', '2'],
    ]);
  });
  it('gère un saut de ligne dans un champ entre guillemets', () => {
    expect(analyserCsv('"a\nb",c\n')).toEqual([['a\nb', 'c']]);
  });
});

describe('csvVersObjets', () => {
  it('associe chaque valeur à son en-tête et ignore les lignes vides', () => {
    expect(csvVersObjets('Code,Titre\n11-1011.00,"Chief Executives"\n\n')).toEqual([
      { Code: '11-1011.00', Titre: 'Chief Executives' },
    ]);
  });
});
