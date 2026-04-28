import { createContext, useContext, useState, useEffect } from 'react';
import { articleAPI, venteAPI, alerteAPI } from '../services/api';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [articles, setArticles] = useState([]);
  const [ventes, setVentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alertes, setAlertes] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const addNotification = (type, message) => {
    const notif = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type,
      message,
      createdAt: new Date().toISOString(),
      read: false
    };
    setNotifications(prev => [notif, ...prev].slice(0, 50));
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [articlesRes, ventesRes, alertesRes] = await Promise.all([
        articleAPI.getAll(),
        venteAPI.getAll(),
        alerteAPI.getLowStock()
      ]);
      setArticles(articlesRes.data);
      setVentes(ventesRes.data);
      setAlertes(alertesRes.data);
    } catch (error) {
      console.error('Erreur loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addArticle = async (article) => {
    const res = await articleAPI.create(article);
    addNotification('stock', `Nouveau stock ajouté : ${article.titre || article.id}`);
    await loadData();
    return res.data;
  };

  const updateArticle = async (id, data) => {
    const existing = getArticleById(id);
    await articleAPI.update(id, data);
    if (existing && Number(data.quantite) > Number(existing.quantite)) {
      addNotification('stock', `Stock augmenté pour ${data.titre || id}`);
    }
    await loadData();
  };

  const deleteArticle = async (id) => {
    await articleAPI.delete(id);
    await loadData();
  };

  const getArticleById = (id) => {
    return articles.find(a => (a.id || '').toUpperCase() === (id || '').toUpperCase());
  };

  const searchArticles = (keyword) => {
    const kw = keyword.toLowerCase();
    return articles.filter(a => 
      (a.id || '').toLowerCase().includes(kw) ||
      (a.reference || '').toLowerCase().includes(kw) ||
      (a.titre || '').toLowerCase().includes(kw)
    );
  };

  const addVente = async (articleId, quantite) => {
    const article = getArticleById(articleId);
    const qtyBefore = Number(article?.quantite || 0);
    const qtyAfter = qtyBefore - Number(quantite || 0);

    const res = await venteAPI.create({ article_id: articleId, quantite });

    addNotification(
      'vente',
      `Vente enregistrée : ${article?.titre || articleId} (x${quantite})`
    );

    if (qtyBefore > 1 && qtyAfter <= 1) {
      addNotification(
        'alerte',
        `Stock presque épuisé : ${article?.titre || articleId} (${Math.max(qtyAfter, 0)} restant)`
      );
    }

    await loadData();
    return res.data;
  };

  const refreshAlertes = async () => {
    const res = await alerteAPI.getLowStock();
    setAlertes(res.data);
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map((notif) => ({ ...notif, read: true })));
  };

  const value = {
    articles,
    ventes,
    alertes,
    notifications,
    loading,
    addArticle,
    updateArticle,
    deleteArticle,
    getArticleById,
    searchArticles,
    addVente,
    refreshAlertes,
    reloadData: loadData,
    markAllNotificationsAsRead
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => useContext(AppContext);