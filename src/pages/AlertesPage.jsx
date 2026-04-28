import { AlertTriangle, CheckCircle, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Link } from 'react-router-dom';

function AlertesPage() {
  const { alertes, refreshAlertes } = useApp();

  const ruptureStock = alertes.filter(a => a.quantite === 0);
  const stockFaible = alertes.filter(a => a.quantite === 1);

  return (
    <div>
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-400 to-orange-500 flex items-center justify-center">
            <AlertTriangle className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-3xl font-bold">
              <span className="logo-text text-slate-800">Alertes de </span>
              <span className="logo-text-emphase">Stock</span>
            </h1>
            <p className="text-slate-500 text-sm">Surveillez les articles à approvisionner</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="glass-card rounded-2xl p-5 border border-red-200">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center">
              <span className="text-2xl font-bold text-red-500">{ruptureStock.length}</span>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider">Rupture</p>
              <p className="text-slate-800 font-semibold">Stock épuisé</p>
            </div>
          </div>
        </div>
        
        <div className="glass-card rounded-2xl p-5 border border-orange-200">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-orange-100 flex items-center justify-center">
              <span className="text-2xl font-bold text-orange-500">{stockFaible.length}</span>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider">Stock Faible</p>
              <p className="text-slate-800 font-semibold">{stockFaible.length} article(s)</p>
            </div>
          </div>
        </div>
        
        <div className="glass-card rounded-2xl p-5 border border-yellow-200">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-yellow-100 flex items-center justify-center">
              <span className="text-2xl font-bold text-yellow-600">{alertes.length}</span>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider">Total Alertes</p>
              <p className="text-slate-800 font-semibold">À approvisionner</p>
            </div>
          </div>
        </div>
      </div>

      {alertes.length === 0 ? (
        <div className="glass-card rounded-2xl p-16 text-center">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-50 mx-auto mb-8 flex items-center justify-center floating">
            <CheckCircle className="text-emerald-500" size={64} />
          </div>
          <h3 className="text-3xl font-bold text-slate-800 mb-4">Tout est en ordre !</h3>
          <p className="text-slate-500 text-lg mb-8 max-w-md mx-auto">
            Aucun article n'est en dessous du seuil d'alerte. Votre stock est bien approvisionné.
          </p>
          <Link
            to="/stock/new"
            className="btn-gold px-8 py-4 rounded-xl inline-flex items-center gap-3"
          >
            Ajouter un nouvel article
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-800">
                Articles à approvisionner ({alertes.length})
              </h2>
            </div>
            
            <div className="divide-y divide-slate-100">
              {alertes.map((article) => (
                <div
                  key={article.id}
                  className="p-6 flex items-center gap-6 hover:bg-slate-50 transition-colors"
                >
                  <img
                    src={article.photos || article.photo_urlpath || `/images/${article.id}.jpg`}
                    alt={article.titre}
                    className="w-20 h-20 object-cover rounded-2xl"
                    onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100'}
                  />
                    
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-xs text-amber-600 font-mono bg-amber-100 px-2 py-0.5 rounded">
                        {article.id}
                      </span>
                      {article.couleur && (
                        <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded">
                          {article.couleur}
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-xl text-slate-800 mb-1">{article.titre}</h3>
                    {article.caracteristiques && (
                      <p className="text-sm text-slate-500 mb-1">{article.caracteristiques}</p>
                    )}
                    <p className="text-2xl font-bold gold-gradient">
                      {parseFloat(article.prix_vente).toLocaleString()} Ar
                    </p>
                  </div>

                  <div className="text-center px-8">
                    <div className={`text-5xl font-bold mb-2 ${
                      article.quantite === 0 ? 'text-red-500' :
                      article.quantite === 1 ? 'text-orange-500' : 'text-yellow-600'
                    }`}>
                      {article.quantite}
                    </div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider">En stock</p>
                  </div>

                  <div className="flex flex-col gap-2">
                    {article.quantite === 0 && (
                      <span className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-red-500/30">
                        RUPTURE
                      </span>
                    )}
                    {article.quantite === 1 && (
                      <span className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-orange-500/30">
                        DERNIER ARTICLE
                      </span>
                    )}
                    <Link
                      to={`/stock/edit/${article.id}`}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-xl text-center transition-colors"
                    >
                      Modifier le stock
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Link
            to="/stock/new"
            className="block glass-card rounded-2xl p-6 text-center hover:border-amber-300 transition-colors"
          >
            <div className="flex items-center justify-center gap-3">
              
              <span className="text-lg font-semibold text-slate-800">Réapprovisionner les articles</span>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}

export default AlertesPage;