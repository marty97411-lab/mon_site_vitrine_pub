import { describe, expect, it } from 'vitest';
import { segmenterItalique } from './texte';

describe('segmenterItalique', () => {
  it('repère les passages en italique', () => {
    expect(segmenterItalique('Revue *Psychological Science*, 2018.')).toEqual([
      { texte: 'Revue ', italique: false },
      { texte: 'Psychological Science', italique: true },
      { texte: ', 2018.', italique: false },
    ]);
  });
  it('laisse un texte sans italique intact, y compris un astérisque isolé', () => {
    expect(segmenterItalique('Note * isolée')).toEqual([
      { texte: 'Note * isolée', italique: false },
    ]);
  });
});
