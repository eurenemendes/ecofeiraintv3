
import React, { useState, useEffect } from 'react';
// Fix: Use namespace import for react-router-dom to resolve "no exported member" errors
import * as ReactRouterDOM from 'react-router-dom';
const { useNavigate, useLocation } = ReactRouterDOM;
import { User } from '../services/firebase';
import { LayoutBarweb } from './LayoutBars/LayoutBarweb';
import { LayoutBarmobile } from './LayoutBars/LayoutBarmobile';

interface LayoutProps {
  children: React.ReactNode;
  cartCount: number;
  favoritesCount: number;
  user: User | null;
}

export const Layout: React.FC<LayoutProps> = ({ children, cartCount, favoritesCount, user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);
  const toggleMenu = () => setIsMenuOpen(prev => !prev);

  const handleNav = (path: string) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  const isActive = (path: string) => currentPath === path;

  // Itens do Menu Mobile
  const menuItems = [
    { label: 'Início', path: '/', icon: <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
    { label: 'Ofertas', path: '/produtos', icon: <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg> },
    { label: 'Lojas', path: '/supermercados', icon: <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg> },
    { label: 'Lista', path: '/lista', icon: <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>, badge: cartCount },
    { label: 'Favoritos', path: '/favoritos', icon: <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>, badge: favoritesCount },
    { label: 'Perfil', path: '/perfil', icon: user && user.photoURL ? <img src={user.photoURL} className="w-7 h-7 rounded-full object-cover border border-brand/20" /> : <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> },
    { label: 'Backup', path: '/perfil/backup', icon: <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg> },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFFFF] dark:bg-[#000000] transition-colors duration-300">
      {/* Overlay do Menu com Blur conforme solicitado */}
      <div 
        className={`fixed inset-0 z-[200] transition-opacity duration-500 ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[4px]" onClick={() => setIsMenuOpen(false)}></div>
        
        {/* Menu Desktop: Drawer Lateral Direito */}
        <aside 
          className={`hidden lg:block absolute right-0 top-0 bottom-0 w-[300px] bg-white dark:bg-[#0a0a0a] border-l border-gray-100 dark:border-zinc-800 shadow-2xl transition-transform duration-500 ease-out transform ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
          <div className="p-8 h-full flex flex-col">
            <div className="flex items-center justify-between mb-10">
              <span className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter">Menu</span>
              <button onClick={() => setIsMenuOpen(false)} className="p-2 text-gray-400 hover:text-brand transition-colors">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <nav className="space-y-4">
              {menuItems.map(item => (
                <button 
                  key={item.path} 
                  onClick={() => handleNav(item.path)} 
                  className={`w-full flex items-center space-x-4 p-4 rounded-2xl font-bold transition-all ${isActive(item.path) ? 'bg-brand/10 text-brand' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-900'}`}
                >
                  <div className="w-6 h-6 flex items-center justify-center">{item.icon}</div>
                  <span className="text-lg">{item.label}</span>
                </button>
              ))}
            </nav>
            <div className="mt-auto pt-6 border-t border-gray-100 dark:border-zinc-800">
              <button onClick={toggleDarkMode} className="w-full flex items-center justify-between p-4 rounded-2xl font-bold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-zinc-900/50">
                <span>{isDarkMode ? 'Modo Claro' : 'Modo Noturno'}</span>
                {isDarkMode ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 5a7 7 0 100 14 7 7 0 000-14z" /></svg> : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>}
              </button>
            </div>
          </div>
        </aside>

        {/* Menu Mobile: Bandeja de Ícones (Bottom Sheet) conforme solicitado */}
        <aside 
          className={`lg:hidden absolute bottom-0 left-0 right-0 bg-white dark:bg-[#0a0a0a] border-t border-gray-100 dark:border-zinc-800 shadow-[0_-15px_50px_rgba(0,0,0,0.2)] rounded-t-[3.5rem] transition-transform duration-500 ease-out transform ${isMenuOpen ? 'translate-y-0' : 'translate-y-full'}`}
        >
          <div className="p-8 pb-14 flex flex-col relative">
            {/* Alça Visual no topo da bandeja */}
            <div className="w-16 h-1.5 bg-gray-200 dark:bg-zinc-800 rounded-full mx-auto mb-10"></div>

            {/* Botão Fechar (X Vermelho) proeminente conforme a imagem */}
            <button 
              onClick={() => setIsMenuOpen(false)} 
              className="absolute -top-6 right-8 bg-red-500 text-white p-4 rounded-2xl shadow-xl shadow-red-500/40 border-2 border-white dark:border-zinc-900 active:scale-95 transition-all z-[210]"
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.5" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            {/* Bandeja de Ícones em Grade */}
            <nav className="grid grid-cols-3 gap-y-10 gap-x-4">
              {menuItems.map(item => (
                <button 
                  key={item.path} 
                  onClick={() => handleNav(item.path)} 
                  className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all relative ${isActive(item.path) ? 'text-brand' : 'text-gray-400 dark:text-zinc-500'}`}
                >
                  <div className={`p-4 rounded-3xl mb-3 transition-all ${isActive(item.path) ? 'bg-brand/10' : 'bg-gray-50 dark:bg-zinc-900'}`}>
                    {item.icon}
                  </div>
                  <span className={`text-xs font-black uppercase tracking-widest text-center ${isActive(item.path) ? 'text-brand' : 'text-gray-500 dark:text-zinc-400'}`}>
                    {item.label}
                  </span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute top-1 right-2 bg-brand text-white text-[9px] font-black px-1.5 py-0.5 rounded-full border-2 border-white dark:border-zinc-900 shadow-md">{item.badge}</span>
                  )}
                </button>
              ))}

              {/* Botão de Tema na Grade */}
              <button 
                onClick={toggleDarkMode} 
                className="flex flex-col items-center justify-center p-2 rounded-2xl text-gray-400 dark:text-zinc-500"
              >
                <div className="p-4 rounded-3xl mb-3 bg-gray-50 dark:bg-zinc-900">
                  {isDarkMode ? (
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 5a7 7 0 100 14 7 7 0 000-14z" /></svg>
                  ) : (
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                  )}
                </div>
                <span className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-zinc-400">
                  {isDarkMode ? 'Claro' : 'Escuro'}
                </span>
              </button>
            </nav>
          </div>
        </aside>
      </div>

      <LayoutBarweb 
        user={user}
        favoritesCount={favoritesCount}
        cartCount={cartCount}
        isActive={isActive}
        handleNav={handleNav}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        toggleMenu={toggleMenu}
      />

      <LayoutBarmobile 
        user={user}
        favoritesCount={favoritesCount}
        cartCount={cartCount}
        isActive={isActive}
        handleNav={handleNav}
        toggleMenu={toggleMenu}
      />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 relative pb-28 lg:pb-10">
        {children}
      </main>

      <footer className="hidden lg:block bg-white dark:bg-black border-t border-gray-100 dark:border-zinc-900 py-16 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center">
          <div className="flex items-center mb-8">
            <div className="bg-brand/10 p-2.5 rounded-2xl mr-3"><svg className="w-6 h-6 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg></div>
            <span className="text-2xl font-[900] text-[#111827] dark:text-white tracking-tighter">EcoFeira</span>
          </div>
          <p className="text-gray-400 dark:text-zinc-500 text-sm font-bold tracking-tight">© 2024 EcoFeira. Dados integrados para sua economia.</p>
        </div>
      </footer>

      <button 
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`fixed bottom-24 lg:bottom-6 right-6 bg-brand/90 dark:bg-brand text-white p-2.5 rounded-xl shadow-2xl shadow-brand/40 hover:scale-110 active:scale-95 transition-all duration-500 z-[110] group border border-white/20 dark:border-brand/30 ${showScrollTop ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}`}
      >
        <svg className="w-5 h-5 transition-transform group-hover:-translate-y-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.5" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
      </button>
    </div>
  );
};
