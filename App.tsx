
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Routes, Route, useNavigate, useParams, useLocation, Navigate, Link } from 'react-router-dom';
import { Product, Supermarket, MainBanner, GridBanner, ShoppingListItem } from './types.ts';
import { getProducts, getSupermarkets, getMainBanners, getGridBanners, getPopularSuggestions } from './services/googleSheetsService.ts';
import { Layout } from './components/Layout.tsx';
import { ProductCard } from './components/ProductCard.tsx';
import { BannerCarousel } from './components/BannerCarousel.tsx';
import { ProductPagination } from './components/ProductPagination.tsx';
import { ProfileView } from './components/Profile/ProfileView.tsx';
import { BackupView } from './components/Profile/BackupView.tsx';
import { Lojas } from './components/Lojas.tsx';
import { ScannerModal } from './components/ScannerModal.tsx';
import { FavoritesView } from './components/Favorites/FavoritesView.tsx';
import { ConfirmModal } from './components/ui/ConfirmModal.tsx';
import { SearchButton } from './components/ui/SearchButton.tsx';
import { InputClearButton } from './components/ui/InputClearButton.tsx';
import { SearchInput } from './components/ui/SearchInput.tsx';
import { ShoppingListView } from './components/ShoppingList/ShoppingListView.tsx';
import { StoreMarquee } from './components/StoreMarquee.tsx';
import { auth, googleProvider, signInWithPopup, signOut, onAuthStateChanged, User } from './services/firebase.ts';

const ITEMS_PER_PAGE = 30;

const normalizeString = (str: string) => 
  str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
};

const setupDragScroll = (ref: React.RefObject<HTMLDivElement | null>) => {
  const el = ref.current;
  if (!el) return;
  let isDown = false;
  let startX: number;
  let scrollLeft: number;
  const onMouseDown = (e: MouseEvent) => {
    isDown = true;
    el.classList.add('cursor-grabbing');
    startX = e.pageX - el.offsetLeft;
    scrollLeft = el.scrollLeft;
  };
  const onMouseLeave = () => { isDown = false; el.classList.remove('cursor-grabbing'); };
  const onMouseUp = () => { isDown = false; el.classList.remove('cursor-grabbing'); };
  const onMouseMove = (e: MouseEvent) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const walk = (x - startX) * 2;
    el.scrollLeft = scrollLeft - walk;
  };
  el.addEventListener('mousedown', onMouseDown);
  el.addEventListener('mouseleave', onMouseLeave);
  el.addEventListener('mouseup', onMouseUp);
  el.addEventListener('mousemove', onMouseMove);
  return () => {
    el.removeEventListener('mousedown', onMouseDown);
    el.removeEventListener('mouseleave', onMouseLeave);
    el.removeEventListener('mouseup', onMouseUp);
    el.removeEventListener('mousemove', onMouseMove);
  };
};

const NotFoundState = ({ title, message, buttonText, onAction }: { title: string, message: string, buttonText: string, onAction: () => void }) => (
  <div className="flex flex-col items-center justify-center py-20 px-4 text-center animate-in fade-in zoom-in-95 duration-500">
    <div className="w-24 h-24 bg-gray-50 dark:bg-[#1e293b] rounded-[2.5rem] flex items-center justify-center mb-10 shadow-inner">
      <svg className="w-12 h-12 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
    <h2 className="text-3xl font-[1000] text-[#111827] dark:text-white mb-4">{title}</h2>
    <p className="text-gray-500 dark:text-gray-400 font-medium text-lg max-w-md mb-10">{message}</p>
    <button onClick={onAction} className="bg-brand text-white font-black py-5 px-12 rounded-2xl shadow-xl hover:scale-105 transition-all">{buttonText}</button>
  </div>
);

const ProductDetailView = ({ products, stores, favorites, toggleFavorite, addToList }: { 
  products: Product[], stores: Supermarket[], favorites: string[], toggleFavorite: (id: string) => void, addToList: (p: Product) => void
}) => {
  const navigate = useNavigate();
  const { productId } = useParams();
  const product = products.find(p => p.id === productId);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const allImages = useMemo(() => product ? [product.imageUrl, ...(product.additionalImages || [])].filter(Boolean) : [], [product]);

  if (!product) return <NotFoundState title="Produto não encontrado" message="Ops! Esta oferta pode ter expirado." buttonText="Ver ofertas" onAction={() => navigate('/produtos')} />;

  const currentPrice = product.isPromo ? product.promoPrice : product.normalPrice;
  const store = stores.find(s => s.name === product.supermarket);

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <button onClick={() => navigate(-1)} className="flex items-center space-x-2 text-sm font-black text-gray-400 hover:text-brand transition-colors">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
        <span>Voltar</span>
      </button>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-white dark:bg-[#1e293b] rounded-[3rem] p-6 flex items-center justify-center border border-gray-100 dark:border-gray-800 shadow-sm relative h-[400px] sm:h-[600px] overflow-hidden">
          <div className="relative z-10 w-full h-full flex items-center justify-center">
             {allImages.map((img, idx) => (
                <img key={idx} src={img} alt={product.name} className={`absolute inset-0 w-full h-full object-contain p-4 transition-all duration-700 ${idx === activeImageIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`} />
             ))}
          </div>
          {allImages.length > 1 && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-2">
              {allImages.map((_, i) => <button key={i} onClick={() => setActiveImageIndex(i)} className={`h-2 rounded-full transition-all ${i === activeImageIndex ? 'bg-brand w-8' : 'bg-gray-200 dark:bg-gray-700 w-2'}`} />)}
            </div>
          )}
        </div>
        <div className="flex flex-col justify-center space-y-6">
          <h1 className="text-4xl sm:text-6xl font-[1000] text-[#111827] dark:text-white tracking-tighter leading-none">{product.name}</h1>
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-white rounded-2xl p-2 shadow-sm border border-gray-100 flex items-center justify-center"><img src={store?.logo} className="w-full h-full object-contain" /></div>
            <Link to={`/supermercado/${store?.id}`} className="text-xl font-black text-gray-800 dark:text-gray-200 hover:text-brand transition-colors">{product.supermarket}</Link>
          </div>
          <div className="bg-[#f8fafc] dark:bg-[#0f172a] p-10 rounded-[2.5rem] border border-gray-100 dark:border-gray-800">
            <p className="text-5xl sm:text-7xl font-[1000] text-brand tracking-tighter">R$ {currentPrice.toFixed(2).replace('.', ',')}</p>
          </div>
          <div className="flex gap-4">
            <button onClick={() => addToList(product)} className="flex-grow bg-brand text-white font-black py-6 rounded-3xl shadow-2xl hover:scale-105 active:scale-95 transition-all">Adicionar à Lista</button>
            <button onClick={() => toggleFavorite(product.id)} className={`p-6 rounded-3xl border-2 transition-all ${favorites.includes(product.id) ? 'bg-red-500 border-red-600 text-white' : 'text-gray-400'}`}>
              <svg className={`w-6 h-6 ${favorites.includes(product.id) ? 'fill-current' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const StoreDetailView = ({ products, stores, searchQuery, setSearchQuery, selectedCategory, setSelectedCategory, sortBy, setSortBy, favorites, toggleFavorite, addToList, categories, currentPage, setCurrentPage, onOpenScanner, user }: { 
  products: Product[], stores: Supermarket[], searchQuery: string, setSearchQuery: (q: string) => void, selectedCategory: string, setSelectedCategory: (c: string) => void, sortBy: 'none' | 'price-asc' | 'price-desc', setSortBy: (s: 'none' | 'price-asc' | 'price-desc') => void, favorites: string[], toggleFavorite: (id: string) => void, addToList: (p: Product) => void, categories: string[], currentPage: number, setCurrentPage: (n: number) => void, onOpenScanner: () => void, user: User | null 
}) => {
  const navigate = useNavigate();
  const { storeId } = useParams();
  const currentStore = stores.find(s => s.id === storeId);
  
  const storeDetailProducts = useMemo(() => {
    if (!currentStore) return [];
    let result = products.filter(p => p.supermarket === currentStore.name);
    if (searchQuery) result = result.filter(p => normalizeString(p.name).includes(normalizeString(searchQuery)));
    if (selectedCategory !== 'Todas') result = result.filter(p => p.category === selectedCategory);
    if (sortBy === 'price-asc') result.sort((a, b) => (a.isPromo ? a.promoPrice : a.normalPrice) - (b.isPromo ? b.promoPrice : b.normalPrice));
    return result;
  }, [products, currentStore, searchQuery, selectedCategory, sortBy]);

  const paginatedStoreProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return storeDetailProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [storeDetailProducts, currentPage]);

  if (!currentStore) return <NotFoundState title="Supermercado não encontrado" message="Localize nossos parceiros." buttonText="Ver lojas" onAction={() => navigate('/supermercados')} />;

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="bg-white dark:bg-[#1e293b] rounded-[3.5rem] p-12 border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center gap-10">
          <div className="w-44 h-44 bg-gray-50 dark:bg-[#0f172a] rounded-[2.8rem] flex items-center justify-center p-10 shadow-inner"><img src={currentStore.logo} className="w-full h-full object-contain" /></div>
          <div className="text-center sm:text-left">
            <h1 className="text-5xl font-[1000] text-[#111827] dark:text-white tracking-tighter">{currentStore.name}</h1>
            <p className="text-gray-500 dark:text-gray-400 font-bold mt-2">{currentStore.street}, {currentStore.neighborhood}</p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {paginatedStoreProducts.map(p => <ProductCard key={p.id} product={p} onAddToList={addToList} onToggleFavorite={toggleFavorite} isFavorite={favorites.includes(p.id)} storeLogo={currentStore.logo} user={user} />)}
      </div>
      <ProductPagination currentPage={currentPage} totalPages={Math.ceil(storeDetailProducts.length / ITEMS_PER_PAGE)} onPageChange={setCurrentPage} />
    </div>
  );
};

const App: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [stores, setStores] = useState<Supermarket[]>([]);
  const [mainBanners, setMainBanners] = useState<MainBanner[]>([]);
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [favoriteStores, setFavoriteStores] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [user, setUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [sortBy, setSortBy] = useState<'none' | 'price-asc' | 'price-desc'>('none');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isClearFavoritesModalOpen, setIsClearFavoritesModalOpen] = useState(false);
  const [clearFavoritesType, setClearFavoritesType] = useState<'products' | 'stores'>('products');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => { setUser(u); });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [p, s, b] = await Promise.all([getProducts(), getSupermarkets(), getMainBanners()]);
        setProducts(p || []); setStores(s || []); setMainBanners(b || []);
        setFavorites(JSON.parse(localStorage.getItem('ecofeira_favorites') || '[]'));
        setFavoriteStores(JSON.parse(localStorage.getItem('ecofeira_favorite_stores') || '[]'));
        setShoppingList(JSON.parse(localStorage.getItem('ecofeira_shopping_list') || '[]'));
      } catch (e) {}
      setLoading(false);
    };
    load();
  }, []);

  useEffect(() => { if (!loading) localStorage.setItem('ecofeira_favorites', JSON.stringify(favorites)); }, [favorites, loading]);
  useEffect(() => { if (!loading) localStorage.setItem('ecofeira_favorite_stores', JSON.stringify(favoriteStores)); }, [favoriteStores, loading]);
  useEffect(() => { if (!loading) localStorage.setItem('ecofeira_shopping_list', JSON.stringify(shoppingList)); }, [shoppingList, loading]);

  const addToList = (p: Product) => {
    setShoppingList(prev => {
      const exists = prev.find(i => i.productName === p.name);
      if (exists) return prev.map(i => i.productName === p.name ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { id: Date.now().toString(), productName: p.name, quantity: 1, checked: false, originalPrice: p.isPromo ? p.promoPrice : p.normalPrice, originalStore: p.supermarket }];
    });
  };

  const handleSearch = (q: string) => { setSearchQuery(q); navigate('/produtos'); };
  const categoriesList = useMemo(() => ['Todas', ...Array.from(new Set(products.map(p => p.category)))], [products]);
  const filteredProducts = useMemo(() => {
    let res = products.filter(p => !searchQuery || normalizeString(p.name).includes(normalizeString(searchQuery)));
    if (selectedCategory !== 'Todas') res = res.filter(p => p.category === selectedCategory);
    if (sortBy === 'price-asc') res.sort((a, b) => (a.isPromo ? a.promoPrice : a.normalPrice) - (b.isPromo ? b.promoPrice : b.normalPrice));
    return res;
  }, [products, searchQuery, selectedCategory, sortBy]);

  if (loading) return <div className="min-h-screen flex items-center justify-center font-black text-brand text-2xl animate-pulse tracking-tighter">EcoFeira...</div>;

  return (
    <Layout cartCount={shoppingList.length} favoritesCount={favorites.length + favoriteStores.length} user={user}>
      <ScannerModal isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} onScanSuccess={(code) => { handleSearch(code); return true; }} />
      <ConfirmModal 
        isOpen={isClearFavoritesModalOpen} 
        onClose={() => setIsClearFavoritesModalOpen(false)} 
        onConfirm={() => { if (clearFavoritesType === 'products') setFavorites([]); else setFavoriteStores([]); }}
        title="Limpar favoritos?"
        message="Deseja remover todos os itens desta aba?"
      />
      <Routes>
        <Route path="/" element={
          <div className="space-y-12">
            <div className="text-center space-y-8 py-10 px-4">
              <h1 className="text-5xl sm:text-8xl font-[1000] tracking-tighter">Compare e <span className="text-brand">economize</span></h1>
              <div className="max-w-2xl mx-auto"><SearchInput value={searchQuery} onChange={setSearchQuery} onKeyDown={(e) => e.key === 'Enter' && handleSearch(searchQuery)} /></div>
            </div>
            <StoreMarquee stores={stores} />
            {mainBanners.length > 0 && <BannerCarousel banners={mainBanners} />}
          </div>
        } />
        <Route path="/produtos" element={
          <div className="space-y-12">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.slice((currentPage-1)*ITEMS_PER_PAGE, currentPage*ITEMS_PER_PAGE).map(p => (
                <ProductCard key={p.id} product={p} onAddToList={addToList} onToggleFavorite={(id) => setFavorites(prev => prev.includes(id) ? prev.filter(f=>f!==id) : [...prev, id])} isFavorite={favorites.includes(p.id)} user={user} storeLogo={stores.find(s=>s.name===p.supermarket)?.logo} />
              ))}
            </div>
            <ProductPagination currentPage={currentPage} totalPages={Math.ceil(filteredProducts.length/ITEMS_PER_PAGE)} onPageChange={setCurrentPage} />
          </div>
        } />
        <Route path="/supermercados" element={<Lojas stores={stores} onStoreClick={(s) => navigate(`/supermercado/${s.id}`)} favoriteStores={favoriteStores} onToggleFavoriteStore={(id) => setFavoriteStores(prev => prev.includes(id) ? prev.filter(f=>f!==id) : [...prev, id])} />} />
        <Route path="/perfil" element={<ProfileView user={user} favoritesCount={favorites.length} shoppingListCount={shoppingList.length} onLogout={() => signOut(auth)} onLogin={() => signInWithPopup(auth, googleProvider)} />} />
        <Route path="/perfil/backup" element={<BackupView user={user} />} />
        <Route path="/supermercado/:storeId" element={<StoreDetailView products={products} stores={stores} searchQuery={searchQuery} setSearchQuery={setSearchQuery} selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} sortBy={sortBy} setSortBy={setSortBy} favorites={favorites} toggleFavorite={(id) => setFavorites(prev => prev.includes(id) ? prev.filter(f=>f!==id) : [...prev, id])} addToList={addToList} categories={categoriesList} currentPage={currentPage} setCurrentPage={setCurrentPage} onOpenScanner={() => setIsScannerOpen(true)} user={user} />} />
        <Route path="/favoritos" element={<FavoritesView favorites={favorites} favoritedProducts={products.filter(p => favorites.includes(p.id))} favoriteStores={favoriteStores} stores={stores} user={user} onAddToList={addToList} onToggleFavorite={(id) => setFavorites(prev => prev.includes(id) ? prev.filter(f=>f!==id) : [...prev, id])} onToggleFavoriteStore={(id) => setFavoriteStores(prev => prev.includes(id) ? prev.filter(f=>f!==id) : [...prev, id])} onClearClick={(type) => { setClearFavoritesType(type); setIsClearFavoritesModalOpen(true); }} onStoreClick={(s) => navigate(`/supermercado/${s.id}`)} />} />
        <Route path="/lista" element={<ShoppingListView shoppingList={shoppingList} products={products} stores={stores} onUpdateQuantity={(id, delta) => setShoppingList(prev => prev.map(item => item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item))} onRemoveFromList={(id) => setShoppingList(prev => prev.filter(i => i.id !== id))} onClearClick={() => setShoppingList([])} />} />
        <Route path="/:store/:cat/:productId/:name" element={<ProductDetailView products={products} stores={stores} favorites={favorites} toggleFavorite={(id) => setFavorites(prev => prev.includes(id) ? prev.filter(f=>f!==id) : [...prev, id])} addToList={addToList} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
};
export default App;
