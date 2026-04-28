import { BrowserRouter, Routes, Route, useParams, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Layout from './components/Layout';
import StockPage from './pages/StockPage';
import ArticleForm from './pages/ArticleForm';
import VentePage from './pages/VentePage';
import AlertesPage from './pages/AlertesPage';

function EditArticleWrapper() {
  const { id } = useParams();
  const { getArticleById } = useApp();
  const article = getArticleById(id);
  
  if (!article) {
    return <Navigate to="/" replace />;
  }
  
  return <ArticleForm article={article} />;
}

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<StockPage />} />
            <Route path="stock/new" element={<ArticleForm />} />
            <Route path="stock/edit/:id" element={<EditArticleWrapper />} />
            <Route path="vente" element={<VentePage />} />
            <Route path="alertes" element={<AlertesPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
