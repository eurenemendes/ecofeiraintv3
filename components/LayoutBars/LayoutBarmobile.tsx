
import React from 'react';
import { User } from '../../services/firebase';

interface LayoutBarmobileProps {
  user: User | null;
  favoritesCount: number;
  cartCount: number;
  isActive: (path: string) => boolean;
  handleNav: (path: string) => void;
  toggleMenu: () => void;
}

export const LayoutBarmobile: React.FC<LayoutBarmobileProps> = ({
  user,
  favoritesCount,
  cartCount,
  isActive,
  handleNav,
  toggleMenu
}) => {
  // Função auxiliar para navegar e rolar para o topo
  const onAction = (action: () => void) => {
    action();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Lógica de verificação para o ícone de perfil
  const isVerified = user?.emailVerified;
  
  const profileBorderClass = user 
    ? (isVerified 
        ? 'border-2 border-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' 
        : 'border-2 border-red-500')
    : 'border-2 border-transparent';

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-[150] bg-white/95 dark:bg-black/95 backdrop-blur-md flex justify-around items-center px-2 py-2 transition-all duration-500 border-t border-gray-100 dark:border-zinc-900">
      {/* Início */}
      <button 
        onClick={() => onAction(() => handleNav('/'))} 
        className={`flex flex-col items-center py-2 px-1 rounded-2xl flex-1 transition-all duration-300 ${isActive('/') ? 'text-brand bg-brand/10' : 'text-gray-400'}`}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
        <span className="text-[10px] font-black uppercase mt-1 tracking-tighter">Início</span>
      </button>
      
      {/* Ofertas */}
      <button 
        onClick={() => onAction(() => handleNav('/produtos'))} 
        className={`flex flex-col items-center py-2 px-1 rounded-2xl flex-1 transition-all duration-300 ${isActive('/produtos') ? 'text-brand bg-brand/10' : 'text-gray-400'}`}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
        <span className="text-[10px] font-black uppercase mt-1 tracking-tighter">Ofertas</span>
      </button>
      
      {/* Lojas */}
      <button 
        onClick={() => onAction(() => handleNav('/supermercados'))} 
        className={`flex flex-col items-center py-2 px-1 rounded-2xl flex-1 transition-all duration-300 ${isActive('/supermercados') || isActive('/supermercado/') ? 'text-brand bg-brand/10' : 'text-gray-400'}`}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
        <span className="text-[10px] font-black uppercase mt-1 tracking-tighter">Lojas</span>
      </button>

      {/* Lista */}
      <button 
        onClick={() => onAction(() => handleNav('/lista'))} 
        className={`flex flex-col items-center py-2 px-1 rounded-2xl flex-1 relative transition-all duration-300 ${isActive('/lista') ? 'text-brand bg-brand/10' : 'text-gray-400'}`}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
        <span className="text-[10px] font-black uppercase mt-1 tracking-tighter">Lista</span>
        {cartCount > 0 && (
          <span className="absolute top-1 right-3 bg-brand text-white text-[8px] font-black rounded-full h-4 w-4 flex items-center justify-center border-2 border-white dark:border-black shadow-lg">
            {cartCount}
          </span>
        )}
      </button>
      
      {/* Perfil */}
      <button 
        onClick={() => onAction(() => handleNav('/perfil'))} 
        className={`flex flex-col items-center py-2 px-1 rounded-2xl flex-1 transition-all duration-300 ${isActive('/perfil') || isActive('/favoritos') ? 'text-brand bg-brand/10' : 'text-gray-400'}`}
      >
        {user && user.photoURL ? (
          <img src={user.photoURL} alt="" className={`w-6 h-6 rounded-full object-cover ${profileBorderClass}`} />
        ) : (
          <div className={`rounded-full ${profileBorderClass}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          </div>
        )}
        <span className="text-[10px] font-black uppercase mt-1 tracking-tighter">Perfil</span>
      </button>

      {/* Menu Lateral (Drawer) */}
      <button 
        onClick={() => onAction(toggleMenu)} 
        className="flex flex-col items-center py-2 px-1 rounded-2xl flex-1 text-gray-400 hover:text-brand hover:bg-gray-50 dark:hover:bg-zinc-900 transition-all duration-300"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" /></svg>
        <span className="text-[10px] font-black uppercase mt-1 tracking-tighter">Menu</span>
      </button>
    </nav>
  );
};
