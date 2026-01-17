
import React from 'react';

interface StoreDetailSuggestionsProps {
  storeName: string;
  suggestions: { label: string; type: string }[];
  onSelect: (term: string) => void;
}

export const StoreDetailSuggestions: React.FC<StoreDetailSuggestionsProps> = ({
  storeName,
  suggestions,
  onSelect
}) => {
  return (
    <div className="absolute top-full left-0 right-0 mt-4 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md rounded-2xl sm:rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-zinc-800 overflow-hidden z-[200]">
      <div className="p-3 sm:p-5 bg-gray-50/50 dark:bg-zinc-950/30 border-b border-gray-100 dark:border-zinc-800">
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ofertas no {storeName}</span>
      </div>
      {suggestions.map((s, idx) => (
        <button 
          key={idx} 
          onClick={() => onSelect(s.label)} 
          className="w-full flex items-center justify-between p-4 sm:p-6 hover:bg-brand/5 transition-colors border-b border-gray-50 dark:border-zinc-800/50 last:border-none group text-left"
        >
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className={`p-2 rounded-lg sm:p-2.5 sm:rounded-xl bg-brand/10 text-brand`}>
              <svg className="w-4 h-4 sm:w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
            </div>
            <span className="text-base sm:text-lg font-bold text-gray-700 dark:text-zinc-200 group-hover:text-brand">{s.label}</span>
          </div>
          <span className="text-[10px] font-black text-gray-400 uppercase">{s.type}</span>
        </button>
      ))}
    </div>
  );
};
