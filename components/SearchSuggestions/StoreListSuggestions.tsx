
import React from 'react';
import { Supermarket } from '../../types';

interface StoreListSuggestionsProps {
  suggestions: Supermarket[];
  onSelect: (store: Supermarket) => void;
}

export const StoreListSuggestions: React.FC<StoreListSuggestionsProps> = ({
  suggestions,
  onSelect
}) => {
  return (
    <div className="absolute top-full left-0 right-0 mt-4 bg-white dark:bg-[#1e293b] rounded-xl sm:rounded-[2rem] shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden z-[200]">
      <div className="p-3 bg-gray-50 dark:bg-[#0f172a] border-b border-gray-100 dark:border-gray-800">
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sugestões de Lojas</span>
      </div>
      {suggestions.map((s) => (
        <button 
          key={s.id} 
          onClick={() => onSelect(s)} 
          className="w-full flex items-center space-x-4 p-4 hover:bg-brand/5 border-b border-gray-50 dark:border-gray-800 last:border-none group text-left transition-colors"
        >
          <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center p-1.5 shadow-sm border border-gray-100 dark:border-gray-700 group-hover:scale-105 transition-transform">
            <img src={s.logo} alt={s.name} className="w-full h-full object-contain" />
          </div>
          <div>
            <p className="text-base font-black text-gray-900 dark:text-white leading-none">{s.name}</p>
            <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-wider">{s.neighborhood}</p>
          </div>
        </button>
      ))}
    </div>
  );
};
