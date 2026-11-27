import { describe, expect, it } from 'vitest';
import { compterMots, minutesDeLecture } from './lecture';

describe('temps de lecture', () => {
  it('compte les mots en ignorant la syntaxe Markdown', () => {
    expect(compterMots('## Titre\n\nUn *texte* avec [un lien](https://exemple.fr).')).toBe(6);
  });
  it('arrondit à la minute, avec un minimum d’une minute', () => {
    expect(minutesDeLecture('un deux trois')).toBe(1);
    expect(minutesDeLecture('mot '.repeat(500))).toBe(3);
  });
});
