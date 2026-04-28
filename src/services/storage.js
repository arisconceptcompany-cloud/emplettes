const STORAGE_KEYS = {
  ARTICLES: 'emplettes_articles',
  VENTES: 'emplettes_ventes'
};

export const storage = {
  getArticles: () => {
    const data = localStorage.getItem(STORAGE_KEYS.ARTICLES);
    return data ? JSON.parse(data) : [];
  },
  
  setArticles: (articles) => {
    localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(articles));
  },
  
  getVentes: () => {
    const data = localStorage.getItem(STORAGE_KEYS.VENTES);
    return data ? JSON.parse(data) : [];
  },
  
  setVentes: (ventes) => {
    localStorage.setItem(STORAGE_KEYS.VENTES, JSON.stringify(ventes));
  },
  
  getNextId: (key) => {
    const data = key === 'articles' ? storage.getArticles() : storage.getVentes();
    if (data.length === 0) return 1;
    return Math.max(...data.map(item => item.id)) + 1;
  }
};

export const initialData = {
  articles: [
    {
      id: 1,
      reference: 'REF001',
      nom: 'Robe Summer',
      photoUrl: 'https://picsum.photos/200/300?random=1',
      prix: 45000,
      quantite: 15,
      description: 'Robe légère pour été',
      taille: 'M',
      couleur: 'Bleu',
      contenance: null,
      dimension: null,
      articleCadeau: false
    },
    {
      id: 2,
      reference: 'REF002',
      nom: 'Pantalon Classic',
      photoUrl: 'https://picsum.photos/200/300?random=2',
      prix: 35000,
      quantite: 1,
      description: 'Pantalon classique homme',
      taille: 'L',
      couleur: 'Noir',
      contenance: null,
      dimension: null,
      articleCadeau: false
    },
    {
      id: 3,
      reference: 'REF003',
      nom: 'Sac à main Luxe',
      photoUrl: 'https://picsum.photos/200/300?random=3',
      prix: 85000,
      quantite: 0,
      description: 'Sac en cuir véritable',
      taille: null,
      couleur: 'Marron',
      contenance: '15L',
      dimension: '30x25x10cm',
      articleCadeau: true
    }
  ],
  ventes: []
};
