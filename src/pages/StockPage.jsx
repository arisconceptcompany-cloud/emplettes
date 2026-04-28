import { useEffect, useMemo, useRef, useState } from 'react';
import { Search, Package, Sparkles, Crown } from 'lucide-react';
import { useApp } from '../context/AppContext';
import ArticleCard from '../components/ArticleCard';
import { useNavigate, useSearchParams } from 'react-router-dom';

function StockPage() {
  const { articles, searchArticles, deleteArticle, alertes } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [displayedArticles, setDisplayedArticles] = useState(articles);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  const suggestions = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return [];
    return articles
      .filter((article) =>
        article.id?.toLowerCase().includes(query) ||
        article.titre?.toLowerCase().includes(query) ||
        article.caracteristiques?.toLowerCase().includes(query) ||
        article.couleur?.toLowerCase().includes(query)
      );
  }, [articles, searchTerm]);

  useEffect(() => {
    const queryFromUrl = searchParams.get('search') || '';
    setSearchTerm(queryFromUrl);
    if (queryFromUrl.trim()) {
      setDisplayedArticles(searchArticles(queryFromUrl));
    } else {
      setDisplayedArticles(articles);
    }
  }, [articles, searchArticles, searchParams]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchInput = (e) => {
    const term = e.target.value;
    setSearchTerm(term);

    if (term.trim()) {
      setDisplayedArticles(searchArticles(term));
      setSearchParams({ search: term });
      setShowSuggestions(true);
    } else {
      setDisplayedArticles(articles);
      setSearchParams({});
      setShowSuggestions(false);
    }
  };

  const handleSelectSuggestion = (article) => {
    setSearchTerm(article.id);
    setDisplayedArticles(searchArticles(article.id));
    setSearchParams({ search: article.id });
    setShowSuggestions(false);
  };

  const handleDelete = (id) => {
    if (confirm('Voulez-vous vraiment supprimer cet article ?')) {
      deleteArticle(id);
    }
  };

  const totalValue = articles.reduce((acc, a) => acc + (parseFloat(a.prix_vente) * a.quantite), 0);
  const outOfStock = articles.filter(a => a.quantite === 0).length;

  return (
    <div>
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
            <Crown className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-3xl font-bold">
              <span className="logo-text text-slate-800">Ma </span>
              <span className="logo-text-emphase">Collection</span>
            </h1>
            <p className="text-slate-500 text-sm">Gérez votre inventaire avec élégance</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="glass-card rounded-2xl p-5">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Articles</p>
          <p className="text-3xl font-bold text-slate-800">{articles.length}</p>
        </div>
        <div className="glass-card rounded-2xl p-5">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">En stock</p>
          <p className="text-3xl font-bold text-emerald-600">
            {articles.reduce((acc, a) => acc + a.quantite, 0)}
          </p>
        </div>
        <div className="glass-card rounded-2xl p-5">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Valeur totale</p>
          <p className="text-2xl font-bold gold-gradient">
            {totalValue.toLocaleString()} Ar
          </p>
        </div>
        <div className="glass-card rounded-2xl p-5">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Alertes</p>
          <p className="text-3xl font-bold text-red-500">{alertes.length}</p>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-4 mb-8 search-layer">
        <div ref={searchRef} className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500/60" size={22} />
          <input
            type="text"
            placeholder="Rechercher un article par référence ou nom..."
            value={searchTerm}
            onChange={handleSearchInput}
            onFocus={() => setShowSuggestions(searchTerm.trim().length > 0 && suggestions.length > 0)}
            className="w-full pl-12 pr-4 py-4 bg-white/50 rounded-xl input-luxury text-lg text-slate-800"
          />
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-2 rounded-2xl border border-slate-200/80 bg-white shadow-xl overflow-hidden search-dropdown">
              <ul className="max-h-80 overflow-auto divide-y divide-slate-100">
                {suggestions.map((article) => (
                  <li key={article.id}>
                    <button
                      type="button"
                      onClick={() => handleSelectSuggestion(article)}
                      className="w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors"
                    >
                      <p className="text-xs font-mono text-amber-600">{article.id}</p>
                      <p className="text-sm font-semibold text-slate-800 truncate">{article.titre}</p>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {displayedArticles.length === 0 ? (
        <div className="glass-card rounded-2xl p-16 text-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-slate-100 to-slate-50 mx-auto mb-6 flex items-center justify-center floating">
            <Package className="text-amber-500/50" size={48} />
          </div>
          <h3 className="text-2xl font-bold text-slate-800 mb-3">
            {searchTerm ? 'Aucun résultat trouvé' : 'Votre collection est vide'}
          </h3>
          <p className="text-slate-500 mb-8 max-w-md mx-auto">
            {searchTerm 
              ? 'Essayez avec d\'autres mots-clés pour trouver vos articles.'
              : 'Commencez par ajouter vos premiers articles pour constituer votre collection.'}
          </p>
          <button
            onClick={() => navigate('/stock/new')}
            className="btn-gold px-8 py-4 rounded-xl inline-flex items-center gap-3 text-lg"
          >
            
            Ajouter mon premier article
          </button>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-6">
            <p className="text-slate-500">
              <span className="text-slate-800 font-semibold">{displayedArticles.length}</span> article(s) trouvé(s)
            </p>
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setDisplayedArticles(articles);
                  setSearchParams({});
                  setShowSuggestions(false);
                }}
                className="text-amber-600 hover:text-amber-700 text-sm"
              >
                Effacer la recherche
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayedArticles.map((article) => (
              <ArticleCard 
                key={article.id} 
                article={article} 
                onDelete={handleDelete}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default StockPage;
