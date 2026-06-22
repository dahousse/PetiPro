const DATA = {
  requests: [
    { id: 1, client: 'Sophie Martin', subject: 'Devis pour rénovation cuisine', priority: 'haute', status: 'en cours', date: '2026-06-22' },
    { id: 2, client: 'Lucas Bernard', subject: 'Problème de connexion internet', priority: 'haute', status: 'nouveau', date: '2026-06-22' },
    { id: 3, client: 'Camille Dubois', subject: 'Demande de rendez-vous', priority: 'moyenne', status: 'résolu', date: '2026-06-21' },
    { id: 4, client: 'Antoine Petit', subject: 'Facture manquante', priority: 'basse', status: 'en cours', date: '2026-06-21' },
    { id: 5, client: 'Emma Richard', subject: 'Devis assurance habitation', priority: 'moyenne', status: 'nouveau', date: '2026-06-20' },
    { id: 6, client: 'Thomas Moreau', subject: 'Suivi commande #4821', priority: 'haute', status: 'en cours', date: '2026-06-20' },
    { id: 7, client: 'Julie Lambert', subject: 'Réclamation produit', priority: 'haute', status: 'nouveau', date: '2026-06-19' },
    { id: 8, client: 'Nicolas Girard', subject: 'Demande d\'extension garantie', priority: 'basse', status: 'résolu', date: '2026-06-19' },
  ],
  tasks: [
    { id: 1, title: 'Préparer le rapport mensuel', desc: 'Compiler les données de juin pour le rapport client.', priority: 'haute', done: false },
    { id: 2, title: 'Relancer client Sophie M.', desc: 'Envoyer le devis mis à jour pour la cuisine.', priority: 'haute', done: false },
    { id: 3, title: 'Mettre à jour la base clients', desc: 'Importer le fichier CSV des nouveaux prospects.', priority: 'moyenne', done: false },
    { id: 4, title: 'Vérifier les factures en retard', desc: 'Identifier les impayés et relancer.', priority: 'moyenne', done: true },
    { id: 5, title: 'Réunion équipe commerciale', desc: 'Préparer l\'ordre du jour pour vendredi.', priority: 'basse', done: false },
    { id: 6, title: 'Vérifier site web', desc: 'Tester les formulaires de contact.', priority: 'basse', done: true },
  ],
  weeklyStats: {
    resolved: [5, 7, 4, 8, 6, 9, 3],
    newRequests: [6, 8, 5, 9, 7, 10, 4],
    labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
  },
};
