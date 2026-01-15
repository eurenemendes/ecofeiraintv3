
import React from 'react';
import { User } from '../../services/firebase';

interface LayoutBarwebProps {
  user: User | null;
  favoritesCount: number;
  cartCount: number;
  isActive: (path: string) => boolean;
  handleNav: (path: string) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  toggleMenu: () => void;
}

export const LayoutBarweb: React.FC<LayoutBarwebProps> = ({
  user,
  favoritesCount,
  cartCount,
  isActive,
  handleNav,
  isDarkMode,
  toggleDarkMode,
  toggleMenu
}) => {
  // Lógica de verificação para a foto de perfil
  const isVerified = user?.emailVerified;
  
  const profileBorderClass = user 
    ? (isVerified 
        ? 'border-2 border-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]' 
        : 'border-2 border-red-500')
    : 'border-2 border-transparent';

  return (
    <header className="hidden lg:block bg-white/95 dark:bg-black/95 backdrop-blur-md sticky top-0 z-[100] transition-all duration-500 border-b border-gray-100 dark:border-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex items-center cursor-pointer" onClick={() => handleNav('/')}>
            <div className="bg-brand p-2.5 rounded-2xl mr-3 shadow-lg shadow-brand/20 transition-transform hover:scale-105 active:scale-95">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <span className="text-2xl font-[900] text-[#111827] dark:text-white tracking-tighter">EcoFeira</span>
          </div>
          
          <nav className="flex items-center space-x-12">
            <button 
              onClick={() => handleNav('/produtos')} 
              className={`text-[15px] font-extrabold transition-all hover:scale-105 ${isActive('/produtos') ? 'text-brand' : 'text-gray-500 dark:text-gray-400 hover:text-brand'}`}
            >
              Promoções
            </button>
            <button 
              onClick={() => handleNav('/supermercados')} 
              className={`text-[15px] font-extrabold transition-all hover:scale-105 ${isActive('/supermercados') ? 'text-brand' : 'text-gray-500 dark:text-gray-400 hover:text-brand'}`}
            >
              Supermercados
            </button>
          </nav>

          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Favoritos */}
            <button 
              onClick={() => handleNav('/favoritos')} 
              className={`relative p-3 rounded-full transition-all border border-gray-100 dark:border-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-900 group ${isActive('/favoritos') ? 'text-red-500 border-red-100 dark:border-red-900/30 bg-red-50 dark:bg-red-500/10' : 'text-gray-500 dark:text-gray-400'}`}
              aria-label="Favoritos"
            >
              <svg className={`w-5 h-5 ${isActive('/favoritos') ? 'fill-current' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {favoritesCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-black rounded-full h-4 w-4 flex items-center justify-center border-2 border-white dark:border-black shadow-lg">
                  {favoritesCount}
                </span>
              )}
            </button>

            {/* Lista/Carrinho */}
            <button 
              onClick={() => handleNav('/lista')} 
              className={`relative p-3 rounded-full transition-all border border-gray-100 dark:border-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-900 group ${isActive('/lista') ? 'text-brand border-brand/20 bg-brand/10' : 'text-gray-500 dark:text-gray-400'}`}
              aria-label="Lista de Compras"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand text-white text-[8px] font-black rounded-full h-4 w-4 flex items-center justify-center border-2 border-white dark:border-black shadow-lg">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Perfil */}
            <button 
              onClick={() => handleNav('/perfil')} 
              className={`p-1 rounded-full transition-all ${profileBorderClass} ${isActive('/perfil') ? 'bg-brand/10' : ''}`}
              aria-label="Perfil"
            >
              {user && user.photoURL ? (
                <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <div className={`p-2 ${isActive('/perfil') ? 'text-brand' : 'text-gray-500 dark:text-gray-400'}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </div>
              )}
            </button>

            <div className="h-8 w-px bg-gray-100 dark:bg-zinc-800 mx-1"></div>

            <button 
              onClick={toggleDarkMode} 
              className="p-3 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-900 rounded-full transition-all border border-gray-100 dark:border-zinc-800"
              aria-label="Alternar tema"
            >
              {isDarkMode ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 5a7 7 0 100 14 7 7 0 000-14z" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
              )}
            </button>
            
            <button 
              onClick={toggleMenu} 
              className="p-3 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-900 rounded-2xl transition-all border border-gray-100 dark:border-zinc-800"
              aria-label="Abrir menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
