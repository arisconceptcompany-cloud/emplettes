import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Gem } from 'lucide-react';
import { useApp } from '../context/AppContext';

function ArticleForm({ article = null }) {
  const navigate = useNavigate();
  const { addArticle, updateArticle, getArticleById, articles } = useApp();
  
  const [formData, setFormData] = useState({
    id: article?.id || '',
    titre: article?.titre || '',
    prix_vente: article?.prix_vente || '',
    quantite: article?.quantite || '',
    caracteristiques: article?.caracteristiques || '',
    couleur: article?.couleur || '',
    contenance: article?.contenance || '',
    dimension: article?.dimension || '',
    taille: article?.taille || '',
    photos: article?.photos || '',
    photo_urlpath: article?.photo_urlpath || '',
    cadeau: Boolean(article?.cadeau)
  });

  const nextInternalId = useMemo(() => {
    if (article?.internal_id) return article.internal_id;
    const maxId = articles.reduce((max, current) => {
      const value = Number(current.internal_id || 0);
      return value > max ? value : max;
    }, 0);
    return maxId + 1;
  }, [article, articles]);
  
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    setError('');
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Veuillez sélectionner une image valide');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFormData(prev => ({ ...prev, photos: reader.result }));
      setError('');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    if (!formData.id || !formData.titre || !formData.prix_vente || !formData.quantite) {
      setError('Veuillez remplir tous les champs obligatoires');
      setIsSubmitting(false);
      return;
    }

    if (!article) {
      const existing = getArticleById(formData.id);
      if (existing) {
        setError('Cet ID existe déjà');
        setIsSubmitting(false);
        return;
      }
    }

    const articleData = {
      ...formData,
      prix_vente: parseFloat(formData.prix_vente),
      quantite: parseInt(formData.quantite)
    };

    if (article) {
      await updateArticle(article.id, articleData);
    } else {
      await addArticle(articleData);
    }
    
    setTimeout(() => {
      navigate('/');
    }, 500);
  };

  return (
    <div>
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-6 transition-colors"
      >
        <ArrowLeft size={20} />
        Retour à ma collection
      </button>

      <div className="max-w-3xl mx-auto">
        <div className="glass-card rounded-2xl p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 mx-auto mb-4 flex items-center justify-center shadow-lg shadow-amber-500/30">
              <Gem className="text-white" size={40} />
            </div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">
              {article ? (
                <><span className="logo-text">Modifier l'</span><span className="logo-text-emphase">Article</span></>
              ) : (
                <><span className="logo-text">Nouvel </span><span className="logo-text-emphase">Article</span></>
              )}
            </h1>
            <p className="text-slate-500">
              {article ? 'Mettez à jour les informations' : 'Ajoutez un nouveau produit à votre collection'}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  ID auto
                </label>
                <input
                  type="text"
                  value={nextInternalId}
                  className="w-full px-4 py-3 rounded-xl input-luxury bg-slate-100"
                  disabled
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  Référence de l'article *
                </label>
                <input
                  type="text"
                  name="id"
                  value={formData.id}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl input-luxury"
                  placeholder="Ex: MU0001"
                  required
                  disabled={article}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  Titre *
                </label>
                <input
                  type="text"
                  name="titre"
                  value={formData.titre}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl input-luxury"
                  placeholder="Ex: Sac Ma Pharmacie"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  Prix de vente (Ar) *
                </label>
                <input
                  type="number"
                  name="prix_vente"
                  value={formData.prix_vente}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl input-luxury"
                  placeholder="30000"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  Quantité *
                </label>
                <input
                  type="number"
                  name="quantite"
                  value={formData.quantite}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl input-luxury"
                  placeholder="10"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  Caractéristiques
                </label>
                <input
                  type="text"
                  name="caracteristiques"
                  value={formData.caracteristiques}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl input-luxury"
                  placeholder="Toile, Polyester..."
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  URL path photo
                </label>
                <input
                  type="text"
                  name="photo_urlpath"
                  value={formData.photo_urlpath}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl input-luxury"
                  placeholder="/images/mon-article.jpg"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  Couleur
                </label>
                <input
                  type="text"
                  name="couleur"
                  value={formData.couleur}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl input-luxury"
                  placeholder="Blanc, Noir..."
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  Contenance
                </label>
                <input
                  type="text"
                  name="contenance"
                  value={formData.contenance}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl input-luxury"
                  placeholder="500ml, 1L..."
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  Dimension
                </label>
                <input
                  type="text"
                  name="dimension"
                  value={formData.dimension}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl input-luxury"
                  placeholder="30x20x10cm"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  Taille
                </label>
                <input
                  type="text"
                  name="taille"
                  value={formData.taille}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl input-luxury"
                  placeholder="S, M, L..."
                />
              </div>

              <div className="space-y-2 flex items-end">
                <label className="inline-flex items-center gap-3 text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    name="cadeau"
                    checked={formData.cadeau}
                    onChange={handleChange}
                    className="h-4 w-4"
                  />
                  Article cadeau (oui/non)
                </label>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="block text-sm font-medium text-slate-700">
                  Photo de l'article
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="w-full px-4 py-3 rounded-xl input-luxury"
                />
                {formData.photos && (
                  <div className="mt-3">
                    <img
                      src={formData.photos}
                      alt="Aperçu de l'article"
                      className="w-32 h-32 object-cover rounded-xl border border-slate-200"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="h-px bg-slate-200"></div>

            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-3 border border-slate-300 text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-gold px-8 py-3 rounded-xl flex items-center gap-3"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    {article ? 'Mettre à jour' : 'Ajouter à la collection'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ArticleForm;