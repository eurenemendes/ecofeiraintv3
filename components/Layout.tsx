
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFFFF] dark:bg-[#000000] transition-colors duration-300">
      {/* Menu Lateral (Drawer) */}
      <div 
        className={`fixed inset-0 z-[200] transition-opacity duration-300 ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)}></div>
        <aside 
          className={`absolute right-0 top-0 bottom-0 w-[280px] bg-white dark:bg-[#0a0a0a] border-l border-gray-100 dark:border-zinc-800 shadow-2xl transition-transform duration-300 ease-out transform ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
          <div className="p-6 h-full flex flex-col">
            {/* Header do Menu */}
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center cursor-pointer" onClick={() => handleNav('/')}>
                <div className="bg-brand p-2 rounded-xl mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <span className="text-xl font-black text-gray-900 dark:text-white tracking-tighter">EcoFeira</span>
              </div>
              <button onClick={() => setIsMenuOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Links de Navegação */}
            <nav className="flex-grow space-y-2">
              <button onClick={() => handleNav('/perfil')} className={`w-full flex items-center justify-between p-4 rounded-2xl font-bold transition-all ${isActive('/perfil') ? 'bg-brand/10 text-brand' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-900'}`}>
                <div className="flex items-center space-x-4">
                  {user && user.photoURL ? (
                    <img src={user.photoURL} alt="" className="w-6 h-6 rounded-full border border-brand/20 object-cover" />
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  )}
                  <span>Meu Perfil</span>
                </div>
              </button>

              <button onClick={() => handleNav('/')} className={`w-full flex items-center space-x-4 p-4 rounded-2xl font-bold transition-all ${isActive('/') ? 'bg-brand/10 text-brand' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-900'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                <span>Início</span>
              </button>
              <button onClick={() => handleNav('/produtos')} className={`w-full flex items-center space-x-4 p-4 rounded-2xl font-bold transition-all ${isActive('/produtos') ? 'bg-brand/10 text-brand' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-900'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                <span>Promoções</span>
              </button>
              <button onClick={() => handleNav('/supermercados')} className={`w-full flex items-center space-x-4 p-4 rounded-2xl font-bold transition-all ${isActive('/supermercados') ? 'bg-brand/10 text-brand' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-900'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                <span>Supermercados</span>
              </button>
            </nav>

            {/* Alternador de Modo Noturno no Rodapé do Menu */}
            <div className="pt-6 mt-6 border-t border-gray-100 dark:border-zinc-800">
              <button 
                onClick={toggleDarkMode}
                className="w-full flex items-center justify-between p-4 rounded-2xl font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-900 transition-all group"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-2 rounded-lg bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-gray-400 group-hover:text-brand transition-colors">
                    {isDarkMode ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 5a7 7 0 100 14 7 7 0 000-14z" /></svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                    )}
                  </div>
                  <span>{isDarkMode ? 'Modo Claro' : 'Modo Noturno'}</span>
                </div>
                <div className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${isDarkMode ? 'bg-brand' : 'bg-gray-200 dark:bg-zinc-700'}`}>
                  <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${isDarkMode ? 'translate-x-4' : 'translate-x-0'}`}></div>
                </div>
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* Barra de Navegação Desktop / Geral Topo */}
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

      {/* Barra de Navegação Mobile Inferior */}
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
