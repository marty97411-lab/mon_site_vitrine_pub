# 0006. Sauvegarde locale des réponses (localStorage)

- **Statut** : accepté (2026-11-27) ; remplace la partie « sessionStorage » de la décision 0003.

## Décision

- Les réponses sont enregistrées dans le `localStorage` du navigateur à chaque changement, pour
  pouvoir reprendre plus tard (questionnaires de 80 à 180 questions).
- Clé unique versionnée (`orientation-personnalite:v2`), réponses indexées par identifiant d'item.
- Bouton « Effacer toutes mes réponses » sur la page des résultats ; les mentions légales
  expliquent comment les données sont conservées.
- Toujours rien n'est envoyé : pas de serveur, pas de cookie, pas d'analytics.

## Conséquences

- Les réponses restent sur l'appareil jusqu'à leur effacement : sur un ordinateur partagé, une
  autre personne pourrait les voir. TODO : le signaler plus visiblement, voire proposer une
  expiration automatique.
- Si le stockage est indisponible (navigation privée stricte), le questionnaire fonctionne mais la
  reprise n'est pas possible.
