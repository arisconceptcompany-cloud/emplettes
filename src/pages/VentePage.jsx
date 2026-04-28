import { useState, useRef, useEffect } from 'react';
import { Search, ShoppingCart, User, Phone, MapPin, CreditCard, Truck, Check, Package, Receipt } from 'lucide-react';
import { useApp } from '../context/AppContext';

function formatPhoneNumber(value) {
  let digits = value.replace(/\D/g, '');
  if (digits.startsWith('261')) {
    digits = digits.slice(3);
  } else if (digits.startsWith('0')) {
    digits = digits.slice(1);
  }
  digits = digits.slice(0, 9);
  if (digits.length === 0) return '';
  if (digits.length <= 1) return `+261 ${digits}`;
  if (digits.length <= 3) return `+261 ${digits.slice(0, 2)} ${digits.slice(2)}`;
  if (digits.length <= 5) return `+261 ${digits.slice(0, 2)} ${digits.slice(2, 4)} ${digits.slice(4)}`;
  if (digits.length <= 7) return `+261 ${digits.slice(0, 2)} ${digits.slice(2, 4)} ${digits.slice(4, 6)} ${digits.slice(6)}`;
  return `+261 ${digits.slice(0, 2)} ${digits.slice(2, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
}

function VentePage() {
  const { articles, getArticleById, addVente } = useApp();
  const [searchRef, setSearchRef] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [venteData, setVenteData] = useState({
    nomClient: '',
    contactClient: '',
    adresseLivraison: '',
    quantite: 1,
    prixVente: '',
    fraisLivraison: 0,
    dateLivraison: '',
    nomLivreur: '',
    contactLivreur: '',
    paiement: 'espece',
    contactMobile: '',
    nomMobile: ''
  });
  const [success, setSuccess] = useState(false);
  const searchContainerRef = useRef(null);

  // Fermer suggestions si clic dehors
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchInput = (e) => {
    const value = e.target.value;
    setSearchRef(value);

    if (value.trim().length === 0) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const query = value.toLowerCase();
    const filtered = articles.filter(a =>
      a.id?.toLowerCase().includes(query) ||
      a.titre?.toLowerCase().includes(query) ||
      a.caracteristiques?.toLowerCase().includes(query) ||
      a.couleur?.toLowerCase().includes(query)
    );

    setSuggestions(filtered);
    setShowSuggestions(filtered.length > 0);
  };

  const handleSelectSuggestion = (article) => {
    setSelectedArticle(article);
    setSearchRef(article.id);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const handleSearch = () => {
    const article = getArticleById(searchRef.toUpperCase());
    setSelectedArticle(article || null);
    setShowSuggestions(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'contactClient' || name === 'contactMobile' || name === 'contactLivreur') {
      setVenteData(prev => ({ ...prev, [name]: formatPhoneNumber(value) }));
    } else {
      setVenteData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedArticle) return;
    if (venteData.quantite > selectedArticle.quantite) {
      alert('Quantité insuffisante en stock');
      return;
    }
    addVente(selectedArticle.id, venteData.quantite);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setSelectedArticle(null);
      setSearchRef('');
      setSuggestions([]);
      setVenteData({
        nomClient: '',
        contactClient: '',
        adresseLivraison: '',
        quantite: 1,
        prixVente: '',
        fraisLivraison: 0,
        dateLivraison: '',
        nomLivreur: '',
        contactLivreur: '',
        paiement: 'espece',
        contactMobile: '',
        nomMobile: ''
      });
    }, 3000);
  };

  const sousTotal = parseFloat(venteData.prixVente || 0) * Number(venteData.quantite);
  const totalVente = sousTotal + parseFloat(venteData.fraisLivraison || 0);

  // Highlight le texte correspondant à la recherche
  const highlight = (text, query) => {
    if (!query || !text) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part)
        ? <mark key={i} className="bg-amber-200 text-amber-900 rounded px-0.5">{part}</mark>
        : part
    );
  };

  return (
    <div className="px-2 sm:px-0">
      {/* Header */}
      <div className="mb-6 sm:mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shrink-0">
            <Receipt className="text-white" size={18} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">
              <span className="logo-text text-slate-800">Nouvelle </span>
              <span className="logo-text-emphase">Vente</span>
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm">Enregistrez une transaction avec élégance</p>
          </div>
        </div>
      </div>

      {/* Success banner */}
      {success && (
        <div className="glass-card rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 border border-emerald-200 bg-emerald-50">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 floating">
              <Check className="text-emerald-600" size={28} />
            </div>
            <div>
              <h3 className="text-base sm:text-xl font-bold text-slate-800">Vente enregistrée avec succès !</h3>
              <p className="text-emerald-600 text-sm">La transaction a été sauvegardée et le stock mis à jour.</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
        {/* Colonne gauche */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6 relative z-20">
          {/* Recherche article */}
          <div className="glass-card rounded-2xl p-4 sm:p-6 search-layer">
            <h2 className="text-base sm:text-lg font-semibold text-slate-800 mb-4 sm:mb-6 flex items-center gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                <Package className="text-amber-600" size={18} />
              </div>
              Recherche d'Article
            </h2>

            <div className="space-y-4">
              {/* Search input + suggestions */}
              <div ref={searchContainerRef} className="relative">
                <div className="flex gap-2 sm:gap-3">
                  <div className="relative flex-1">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Référence ou nom d'article..."
                      value={searchRef}
                      onChange={handleSearchInput}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                      className="w-full pl-9 pr-3 py-2.5 sm:py-3 rounded-xl input-luxury text-sm"
                      autoComplete="off"
                    />
                  </div>
                  <button
                    onClick={handleSearch}
                    className="btn-gold px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl flex items-center justify-center shrink-0"
                  >
                    <Search size={17} />
                  </button>
                </div>

                {/* Dropdown suggestions */}
                {showSuggestions && (
                  <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl shadow-slate-200/80 border border-slate-100 overflow-hidden search-dropdown">
                    <div className="px-3 py-2 bg-slate-50 border-b border-slate-100">
                      <p className="text-xs text-slate-400 font-medium">
                        {suggestions.length} résultat{suggestions.length > 1 ? 's' : ''} trouvé{suggestions.length > 1 ? 's' : ''}
                      </p>
                    </div>
                    <ul className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                      {suggestions.map((article) => (
                        <li key={article.id}>
                          <button
                            type="button"
                            onClick={() => handleSelectSuggestion(article)}
                            className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-amber-50 transition-colors text-left group"
                          >
                            <img
                              src={article.photos || article.photo_urlpath || `/images/${article.id}.jpg`}
                              alt={article.titre}
                              className="w-10 h-10 rounded-lg object-cover shrink-0 border border-slate-100"
                              onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=80'}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-mono text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded group-hover:bg-amber-100 transition-colors shrink-0">
                                  {highlight(article.id, searchRef)}
                                </span>
                                <span className={`text-xs font-medium shrink-0 ${
                                  article.quantite > 2 ? 'text-emerald-600' :
                                  article.quantite === 0 ? 'text-red-500' : 'text-orange-500'
                                }`}>
                                  Stock: {article.quantite}
                                </span>
                              </div>
                              <p className="text-sm font-semibold text-slate-800 truncate mt-0.5">
                                {highlight(article.titre, searchRef)}
                              </p>
                              {article.caracteristiques && (
                                <p className="text-xs text-slate-400 truncate">
                                  {highlight(article.caracteristiques, searchRef)}
                                </p>
                              )}
                            </div>
                            <div className="shrink-0 text-right">
                              <p className="text-sm font-bold text-amber-600">
                                {parseFloat(article.prix_vente).toLocaleString()} Ar
                              </p>
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Article sélectionné */}
              {selectedArticle && (
                <div className="rounded-xl p-3 sm:p-4 bg-amber-50/80 border border-amber-200">
                  <div className="flex gap-3 sm:gap-4">
                    <img
                      src={selectedArticle.photos || selectedArticle.photo_urlpath || `/images/${selectedArticle.id}.jpg`}
                      alt={selectedArticle.titre}
                      className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl shrink-0"
                      onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200'}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-amber-600 font-mono">{selectedArticle.id}</p>
                      <h3 className="font-bold text-sm sm:text-base text-slate-800 mb-1 truncate">{selectedArticle.titre}</h3>
                      {selectedArticle.caracteristiques && (
                        <p className="text-xs text-slate-500 mb-1 truncate">{selectedArticle.caracteristiques}</p>
                      )}
                      {selectedArticle.couleur && (
                        <p className="text-xs text-slate-500 mb-1">Couleur : {selectedArticle.couleur}</p>
                      )}
                      <p className="text-lg sm:text-xl font-bold gold-gradient mb-1">
                        {parseFloat(selectedArticle.prix_vente).toLocaleString()} Ar
                      </p>
                      <p className={`text-xs font-medium ${
                        selectedArticle.quantite > 2 ? 'text-emerald-600' :
                        selectedArticle.quantite === 0 ? 'text-red-500' : 'text-orange-500'
                      }`}>
                        Stock : {selectedArticle.quantite}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {searchRef && !selectedArticle && !showSuggestions && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                  Article non trouvé dans la collection
                </div>
              )}
            </div>
          </div>

          {/* Récapitulatif */}
          {selectedArticle && (
            <div className="glass-card rounded-2xl p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold text-slate-800 mb-4 sm:mb-6 flex items-center gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                  <Receipt className="text-emerald-600" size={18} />
                </div>
                Récapitulatif
              </h2>
              <div className="space-y-2.5 text-sm sm:text-base">
                <div className="flex justify-between text-slate-600">
                  <span>Prix unitaire</span>
                  <span className="text-slate-800 font-semibold">{parseFloat(venteData.prixVente || 0).toLocaleString()} Ar</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Quantité</span>
                  <span className="text-slate-800 font-semibold">x{venteData.quantite}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Sous-total</span>
                  <span className="text-slate-800 font-semibold">{sousTotal.toLocaleString()} Ar</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Frais de livraison</span>
                  <span className="text-slate-800 font-semibold">{parseFloat(venteData.fraisLivraison || 0).toLocaleString()} Ar</span>
                </div>
                <div className="h-px bg-slate-200 my-2"></div>
                <div className="flex justify-between items-center">
                  <span className="text-base sm:text-lg font-bold text-slate-800">Total</span>
                  <span className="text-lg sm:text-2xl font-bold gold-gradient">{totalVente.toLocaleString()} Ar</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Colonne droite — formulaire */}
        <div className="lg:col-span-3 relative z-10">
          <div className="glass-card rounded-2xl p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-slate-800 mb-4 sm:mb-6 flex items-center gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
                <User className="text-purple-600" size={18} />
              </div>
              Informations Client
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm text-slate-600 mb-1.5">
                    <User size={12} className="inline mr-1" />
                    Nom du client *
                  </label>
                  <input
                    type="text"
                    name="nomClient"
                    value={venteData.nomClient}
                    onChange={handleChange}
                    required
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl input-luxury text-sm"
                    placeholder="Ex: Rakoto Jean"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm text-slate-600 mb-1.5">
                    <Phone size={12} className="inline mr-1" />
                    Contact *
                  </label>
                  <input
                    type="tel"
                    name="contactClient"
                    value={venteData.contactClient}
                    onChange={handleChange}
                    required
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl input-luxury text-sm"
                    placeholder="+261 3X XX XXX XX"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm text-slate-600 mb-1.5">
                  <MapPin size={12} className="inline mr-1" />
                  Adresse de livraison
                </label>
                <input
                  type="text"
                  name="adresseLivraison"
                  value={venteData.adresseLivraison}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl input-luxury text-sm"
                  placeholder="Ville, Quartier, Rue..."
                />
              </div>

              <div className="h-px bg-slate-200"></div>

              <h3 className="text-sm sm:text-base font-semibold text-slate-800 flex items-center gap-2">
                <CreditCard size={18} className="text-amber-600 shrink-0" />
                Détails de la Transaction
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm text-slate-600 mb-1.5">Quantité *</label>
                  <input
                    type="number"
                    name="quantite"
                    value={venteData.quantite}
                    onChange={handleChange}
                    min="1"
                    max={selectedArticle?.quantite || 1}
                    required
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl input-luxury text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm text-slate-600 mb-1.5">Prix de vente *</label>
                  <input
                    type="number"
                    name="prixVente"
                    value={venteData.prixVente}
                    onChange={handleChange}
                    required
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl input-luxury text-sm"
                    placeholder="Prix en Ariary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm text-slate-600 mb-1.5">Frais de livraison</label>
                <input
                  type="number"
                  name="fraisLivraison"
                  value={venteData.fraisLivraison}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl input-luxury text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm text-slate-600 mb-1.5">Date de livraison</label>
                  <input
                    type="date"
                    name="dateLivraison"
                    value={venteData.dateLivraison}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl input-luxury text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm text-slate-600 mb-1.5">Mode de paiement *</label>
                  <select
                    name="paiement"
                    value={venteData.paiement}
                    onChange={handleChange}
                    required
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl input-luxury bg-white text-sm"
                  >
                    <option value="espece">Espèces</option>
                    <option value="mobile_money">Mobile Money</option>
                  </select>
                </div>
              </div>

              {venteData.paiement === 'mobile_money' && (
                <div className="glass-card rounded-xl p-3 sm:p-5 bg-gradient-to-br from-green-50 to-transparent border border-green-200">
                  <h4 className="text-xs sm:text-sm font-semibold text-emerald-600 mb-3">Informations Mobile Money</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm text-slate-600 mb-1.5">N° Mobile Money</label>
                      <input
                        type="tel"
                        name="contactMobile"
                        value={venteData.contactMobile}
                        onChange={handleChange}
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl input-luxury text-sm"
                        placeholder="+261 3X XX XXX XX"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm text-slate-600 mb-1.5">Nom client Mobile</label>
                      <input
                        type="text"
                        name="nomMobile"
                        value={venteData.nomMobile}
                        onChange={handleChange}
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl input-luxury text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="h-px bg-slate-200"></div>

              <h3 className="text-sm sm:text-base font-semibold text-slate-800 flex items-center gap-2">
                <Truck size={18} className="text-purple-600 shrink-0" />
                Informations Livreur
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm text-slate-600 mb-1.5">Nom du livreur</label>
                  <input
                    type="text"
                    name="nomLivreur"
                    value={venteData.nomLivreur}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl input-luxury text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm text-slate-600 mb-1.5">Contact livreur</label>
                  <input
                    type="tel"
                    name="contactLivreur"
                    value={venteData.contactLivreur}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl input-luxury text-sm"
                    placeholder="+261 3X XX XXX XX"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={!selectedArticle}
                className="w-full btn-gold py-3 sm:py-4 rounded-xl flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart size={18} />
                {selectedArticle ? 'Finaliser la Vente' : 'Sélectionnez un article'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VentePage;