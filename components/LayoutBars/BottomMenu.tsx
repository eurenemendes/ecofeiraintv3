
import React from 'react';
import { User } from '../../services/firebase';

interface BottomMenuProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  favoritesCount: number;
  cartCount: number;
  isActive: (path: string) => boolean;
  handleNav: (path: string) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export const BottomMenu: React.FC<BottomMenuProps> = ({
  isOpen,
  onClose,
  user,
  favoritesCount,
  cartCount,
  isActive,
  handleNav,
  isDarkMode,
  toggleDarkMode
}) => {
  // Definição dos itens do menu para a grade
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
    <div className={`lg:hidden fixed inset-0 z-[200] transition-opacity duration-500 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
      {/* Overlay translúcido com clique para fechar */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onClose}></div>
      
      {/* Bandeja de Menu (Bottom Sheet) com Efeito de Vidro */}
      <aside 
        className={`absolute bottom-0 left-0 right-0 bg-white/80 dark:bg-black/80 backdrop-blur-2xl border-t border-white/20 dark:border-zinc-800/50 shadow-[0_-15px_60px_rgba(0,0,0,0.3)] rounded-t-[3.5rem] transition-transform duration-500 ease-out transform ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
      >
        <div className="p-8 pb-14 flex flex-col relative">
          {/* Alça Visual centralizada */}
          <div className="w-16 h-1.5 bg-gray-300/50 dark:bg-zinc-700/50 rounded-full mx-auto mb-10"></div>

          {/* Botão Fechar (X Vermelho) proeminente */}
          <button 
            onClick={onClose} 
            className="absolute -top-6 right-8 bg-red-500 text-white p-4 rounded-2xl shadow-xl shadow-red-500/40 border-2 border-white/50 dark:border-zinc-900 active:scale-95 transition-all z-[210]"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.5" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>

          {/* Grade de Ícones: 3 colunas verticais */}
          <nav className="grid grid-cols-3 gap-y-10 gap-x-4">
            {menuItems.map(item => (
              <button 
                key={item.path} 
                onClick={() => handleNav(item.path)} 
                className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all relative ${isActive(item.path) ? 'text-brand' : 'text-gray-500 dark:text-zinc-400'}`}
              >
                <div className={`p-4 rounded-3xl mb-3 transition-all ${isActive(item.path) ? 'bg-brand/20 shadow-lg shadow-brand/10' : 'bg-white/40 dark:bg-zinc-900/40 shadow-sm'}`}>
                  {item.icon}
                </div>
                <span className={`text-[11px] font-black uppercase tracking-wider text-center ${isActive(item.path) ? 'text-brand' : 'text-gray-600 dark:text-zinc-300'}`}>
                  {item.label}
                </span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute top-1 right-2 bg-brand text-white text-[9px] font-black px-1.5 py-0.5 rounded-full border-2 border-white/50 dark:border-zinc-900 shadow-md">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}

            {/* Item do Tema (DarkMode) na Grade */}
            <button 
              onClick={toggleDarkMode} 
              className="flex flex-col items-center justify-center p-2 rounded-2xl text-gray-500 dark:text-zinc-400"
            >
              <div className="p-4 rounded-3xl mb-3 bg-white/40 dark:bg-zinc-900/40 shadow-sm">
                {isDarkMode ? (
                  <svg className="w-7 h-7 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 5a7 7 0 100 14 7 7 0 000-14z" /></svg>
                ) : (
                  <svg className="w-7 h-7 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                )}
              </div>
              <span className="text-[11px] font-black uppercase tracking-wider text-gray-600 dark:text-zinc-300">
                {isDarkMode ? 'Claro' : 'Escuro'}
              </span>
            </button>
          </nav>
        </div>
      </aside>
    </div>
  );
};
