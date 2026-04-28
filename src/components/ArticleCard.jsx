import { Edit2, Trash2, Gift, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

function ArticleCard({ article, onDelete }) {
  const navigate = useNavigate();
  const [touched, setTouched] = useState(false);
  const isLowStock = article.quantite <= 2;
  const isOutOfStock = article.quantite === 0;
  const imageSrc = article.photos || article.photo_urlpath || `/images/${article.id}.jpg`;

  const getStockBadge = () => {
    if (isOutOfStock) {
      return (
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/40 to-transparent flex items-end justify-center pb-4">
          <span className="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold">
            Rupture de stock
          </span>
        </div>
      );
    }
    if (article.quantite === 1) {
      return (
        <div className="absolute top-3 left-3 bg-gradient-to-r from-red-600 to-red-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg shadow-red-600/30">
          Dernier article !
        </div>
      );
    }
    if (isLowStock) {
      return (
        <div className="absolute top-3 left-3 bg-gradient-to-r from-blue-600 to-red-500 text-black px-3 py-1.5 rounded-full text-xs font-bold shadow-lg shadow-blue-600/30">
          Stock faible: {article.quantite}
        </div>
      );
    }
    return null;
  };

  // Boutons partagés (utilisés sur desktop dans l'overlay et sur mobile en bas de carte)
  const ActionButtons = () => (
    <div className="flex gap-2">
      <button
        onClick={() => navigate(`/stock/edit/${article.id}`)}
        className="flex-1 bg-white/90 backdrop-blur-md text-slate-800 py-2.5 rounded-xl font-medium hover:bg-white transition-colors flex items-center justify-center gap-2"
      >
        <Edit2 size={16} />
        Modifier
      </button>
      <button
        onClick={() => onDelete(article.id)}
        className="w-12 bg-red-100 text-red-600 py-2.5 rounded-xl hover:bg-red-200 transition-colors flex items-center justify-center"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );

  return (
    <div
      className="glass-card glass-card-hover rounded-2xl overflow-hidden group transition-all duration-500"
      onTouchStart={() => setTouched(true)}
    >
      <div className="relative aspect-[3/4] overflow-hidden">
        <img
          src={imageSrc}
          alt={article.titre}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400';
          }}
        />

        {/* Overlay foncé au hover (desktop uniquement) */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {getStockBadge()}

        {/* Boutons dans l'image — visibles au hover sur desktop, cachés sur mobile */}
        <div className="hidden sm:block absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <ActionButtons />
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <p className="text-xs text-blue-700 font-mono bg-blue-100 px-2 py-1 rounded">{article.id}</p>
          <div className="flex items-center gap-1 text-slate-400">
            <Package size={14} />
            <span className="text-xs number-gold">{article.quantite}</span>
          </div>
        </div>

        <h3 className="font-bold text-xl text-slate-800 mb-2 leading-tight">{article.titre}</h3>

        <p className="text-3xl font-bold number-gold mb-4">
          {parseFloat(article.prix_vente).toLocaleString()} Ar
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {Boolean(article.cadeau) && (
            <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg border border-blue-200 inline-flex items-center gap-1">
              <Gift size={12} />
              Article cadeau
            </span>
          )}
          {article.couleur && (
            <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg border border-slate-200">
              {article.couleur}
            </span>
          )}
          {article.dimension && (
            <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg border border-slate-200">
              {article.dimension}
            </span>
          )}
        </div>

        {article.caracteristiques && (
          <p className="text-sm text-slate-500 line-clamp-2 mb-4">
            {article.caracteristiques}
          </p>
        )}

        <div className={`flex items-center gap-2 pt-4 border-t border-slate-200 ${
          isOutOfStock ? 'text-red-500' : isLowStock ? 'text-red-500' : 'text-blue-700'
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            isOutOfStock ? 'bg-red-500' : isLowStock ? 'bg-red-500' : 'bg-blue-600'
          }`} />
          <span className="text-sm font-medium">
            {isOutOfStock ? 'Rupture de stock' : `${article.quantite} article(s) disponible(s)`}
          </span>
        </div>

        {/* Boutons toujours visibles sur mobile (sm:hidden = caché à partir de sm) */}
        <div className="sm:hidden mt-4 pt-4 border-t border-slate-100">
          <ActionButtons />
        </div>
      </div>
    </div>
  );
}

export default ArticleCard;