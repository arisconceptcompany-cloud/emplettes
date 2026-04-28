import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Package, ShoppingCart, AlertTriangle, Plus, Menu, X, Search, Bell } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import logoImage from '../assets/logo-a-vos-emplettes.png';

function Layout() {
  const { alertes, articles, ventes, notifications, markAllNotificationsAsRead } = useApp();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const lowStock = alertes;
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const searchContainerRef = useRef(null);
  const notificationsRef = useRef(null);
  const unreadCount = notifications.filter((notif) => !notif.read).length;

  const navItems = [
    { path: '/', icon: Package, label: 'Collection', sublabel: 'Gérer le stock' },
    { path: '/vente', icon: ShoppingCart, label: 'Ventes', sublabel: 'Nouveaux achats' },
    { path: '/alertes', icon: AlertTriangle, label: 'Alertes', sublabel: `${lowStock.length} article(s)`, badge: lowStock.length }
  ];

  const suggestions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];
    return articles
      .filter((article) =>
        article.id?.toLowerCase().includes(query) ||
        article.titre?.toLowerCase().includes(query) ||
        article.caracteristiques?.toLowerCase().includes(query) ||
        article.couleur?.toLowerCase().includes(query)
      );
  }, [articles, searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleNotifications = () => {
    const nextState = !showNotifications;
    setShowNotifications(nextState);
    if (nextState && unreadCount > 0) {
      markAllNotificationsAsRead();
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowSuggestions(false);
    }
  };

  const handleSelectSuggestion = (article) => {
    setSearchQuery(article.id);
    setShowSuggestions(false);
    navigate(`/?search=${encodeURIComponent(article.id)}`);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* NAVBAR */}
      <nav className="glass-nav sticky top-0 z-50 shadow-sm flex-shrink-0">
        <div className=" px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                {sidebarOpen ? <X size={20} className="text-slate-700" /> : <Menu size={20} className="text-slate-700" />}
              </button>

              <NavLink to="/" className="flex items-center">
                <img
                  src={logoImage}
                  alt="A vos emplettes"
                  className="h-10 w-auto object-contain hidden sm:block"
                />
                <img
                  src={logoImage}
                  alt="A vos emplettes"
                  className="h-8 w-auto object-contain sm:hidden"
                />
              </NavLink>
            </div>

            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
              <div ref={searchContainerRef} className="relative w-full search-layer">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Rechercher un article..."
                  value={searchQuery}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSearchQuery(value);
                    setShowSuggestions(value.trim().length > 0);
                  }}
                  onFocus={() => setShowSuggestions(searchQuery.trim().length > 0 && suggestions.length > 0)}
                  className="w-full pl-10 pr-4 py-2 rounded-full bg-white/80 border border-slate-200/80 focus:ring-2 focus:ring-blue-600/30 focus:border-blue-500 focus:bg-white transition-all text-sm"
                />
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-2 rounded-2xl border border-slate-200/80 bg-white shadow-xl overflow-hidden search-dropdown">
                    <ul className="divide-y divide-slate-100">
                      {suggestions.map((article) => (
                        <li key={article.id}>
                          <button
                            type="button"
                            onClick={() => handleSelectSuggestion(article)}
                            className="w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors"
                          >
                            <p className="text-xs font-mono text-blue-700">{article.id}</p>
                            <p className="text-sm font-semibold text-slate-800 truncate">{article.titre}</p>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </form>

            <div className="flex items-center gap-2">
              <div ref={notificationsRef} className="relative">
              <button
                onClick={handleToggleNotifications}
                className="relative p-2 rounded-full hover:bg-slate-100 transition-colors"
              >
                <Bell size={20} className="text-slate-600" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </button>
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-auto rounded-2xl border border-slate-200/80 bg-white shadow-xl z-50">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-sm font-semibold text-slate-800">Notifications</p>
                    <p className="text-xs text-slate-500">Ajout stock, ventes et stock presque épuisé</p>
                  </div>
                  {notifications.length === 0 ? (
                    <p className="px-4 py-6 text-sm text-slate-500 text-center">Aucune notification</p>
                  ) : (
                    <ul className="divide-y divide-slate-100">
                      {notifications.map((notif) => (
                        <li key={notif.id} className="px-4 py-3">
                          <p className="text-sm text-slate-700">{notif.message}</p>
                          <p className="text-xs text-slate-400 mt-1">
                            {new Date(notif.createdAt).toLocaleString('fr-FR')}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
              </div>

              <NavLink
                to="/stock/new"
                className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500  text-white font-semibold text-sm shadow-lg shadow-blue-600/25 hover:shadow-red-600/30 hover:-translate-y-px transition-all"
              >
                <Plus size={16} />
                <span>Nouvel Article</span>
              </NavLink>
              <NavLink
                to="/stock/new"
                className="sm:hidden p-2 rounded-full bg-gradient-to-r from-blue-600 to-red-600 text-white shadow-lg shadow-blue-600/30"
              >
                <Plus size={18} />
              </NavLink>
            </div>
          </div>
        </div>
      </nav>

      {/* BODY */}
      <div className="flex flex-1 overflow-hidden">

        {/* SIDEBAR */}
        <aside className={`
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
          lg:translate-x-0
          w-72 bg-white/75 backdrop-blur-xl
          fixed lg:sticky top-16 left-0 z-40
          h-[calc(100vh-4rem)]
          border-r border-slate-200/50
          overflow-y-auto
          transition-transform duration-300 ease-in-out
          flex-shrink-0
        `}>
          <div className="p-4 space-y-2">
            <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Menu</p>

            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${isActive
                    ? 'bg-gradient-to-r from-blue-600/15 to-transparent border-l-4 border-blue-600'
                    : 'hover:bg-slate-100'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isActive ? 'bg-blue-600 text-white' : 'bg-slate-100 text-blue-700'}`}>
                      <item.icon size={20} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-slate-700">{item.label}</span>
                        {item.badge > 0 && (
                          <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">{item.sublabel}</p>
                    </div>
                  </>
                )}
              </NavLink>
            ))}

            <div className="pt-4 mt-4 border-t border-slate-200">
              <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Statistiques</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gradient-to-br from-slate-100 to-slate-50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold number-gold">{articles.length}</p>
                  <p className="text-xs text-slate-500">Articles</p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-red-50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold number-gold">{ventes.length}</p>
                  <p className="text-xs text-slate-500">Ventes</p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* OVERLAY mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-slate-600/30 backdrop-blur-sm z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* MAIN CONTENT */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto h-full">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>

      </div>
    </div>
  );
}

export default Layout;