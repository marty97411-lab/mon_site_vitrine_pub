// @ts-check
import { defineConfig } from 'astro/config';

// Site entièrement statique : aucune réponse au questionnaire ne quitte le navigateur.
export default defineConfig({
  output: 'static',
  // TODO(déploiement) : renseigner `site` (et `base` pour GitHub Pages) une fois l'hébergeur choisi.
  trailingSlash: 'ignore',
});
