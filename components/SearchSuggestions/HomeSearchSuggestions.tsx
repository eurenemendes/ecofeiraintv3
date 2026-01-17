
import React from 'react';

interface HomeSearchSuggestionsProps {
  searchQuery: string;
  recentSearches: string[];
  scannedHistory: string[];
  suggestions: { label: string; type: string }[];
  onSelect: (term: string) => void;
  onClearScanned: () => void;
  onClearRecent: () => void;
}

export const HomeSearchSuggestions: React.FC<HomeSearchSuggestionsProps> = ({
  searchQuery,
  recentSearches,
  scannedHistory,
  suggestions,
  onSelect,
  onClearScanned,
  onClearRecent
}) => {
  return (
    <div className="absolute top-full left-0 right-0 mt-4 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md rounded-2xl sm:rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-zinc-800 overflow-hidden z-[200]">
      {searchQuery.length === 0 && (recentSearches.length > 0 || scannedHistory.length > 0) && (
        <div className="animate-in fade-in duration-300">
          {scannedHistory.length > 0 && (
            <>
              <div className="p-3 sm:p-5 bg-gray-50/50 dark:bg-zinc-950/30 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Códigos Escaneados</span>
                <button onClick={(e) => { e.stopPropagation(); onClearScanned(); }} className="text-[10px] font-black text-brand uppercase tracking-widest hover:text-brand-dark">Limpar</button>
              </div>
              {scannedHistory.map((code, idx) => (
                <button key={`scan-${idx}`} onClick={() => onSelect(code)} className="w-full flex items-center justify-between p-4 sm:p-6 hover:bg-brand/5 border-b border-gray-50 dark:border-zinc-800/50 group text-left">
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className="p-2 sm:p-2.5 rounded-lg bg-brand/5 text-brand"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v1l-3 3h6l-3-3V4zM4 10h16v10H4V10z" /></svg></div>
                    <span className="text-base sm:text-lg font-bold text-gray-700 dark:text-zinc-200 group-hover:text-brand">{code}</span>
                  </div>
                  <span className="text-[10px] font-black text-gray-400 uppercase">Código</span>
                </button>
              ))}
            </>
          )}
          {recentSearches.length > 0 && (
            <>
              <div className="p-3 sm:p-5 bg-gray-50/50 dark:bg-zinc-950/30 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Buscas Recentes</span>
                <button onClick={(e) => { e.stopPropagation(); onClearRecent(); }} className="text-[10px] font-black text-brand uppercase tracking-widest hover:text-brand-dark">Limpar</button>
              </div>
              {recentSearches.map((term, idx) => (
                <button key={`recent-${idx}`} onClick={() => onSelect(term)} className="w-full flex items-center justify-between p-4 sm:p-6 hover:bg-brand/5 border-b border-gray-50 dark:border-zinc-800/50 group text-left">
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className="p-2 sm:p-2.5 rounded-lg bg-gray-100 dark:bg-zinc-800 text-gray-400"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
                    <span className="text-base sm:text-lg font-bold text-gray-700 dark:text-zinc-200 group-hover:text-brand">{term}</span>
                  </div>
                  <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </button>
              ))}
            </>
          )}
        </div>
      )}
      {suggestions.length > 0 && (
        <div className="animate-in fade-in duration-300">
          <div className="p-3 sm:p-5 bg-gray-50/50 dark:bg-zinc-950/30 border-b border-gray-100 dark:border-zinc-800">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sugestões EcoFeira</span>
          </div>
          {suggestions.map((s, idx) => (
            <button key={`sugg-${idx}`} onClick={() => onSelect(s.label)} className="w-full flex items-center justify-between p-4 sm:p-6 hover:bg-brand/5 border-b border-gray-50 dark:border-zinc-800/50 last:border-none group text-left text-gray-700 dark:text-zinc-200 transition-colors">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className={`p-2 rounded-lg ${s.type === 'categoria' ? 'bg-zinc-100 dark:bg-zinc-800 text-brand' : 'bg-brand/10 text-brand'}`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                </div>
                <span className="text-base sm:text-lg font-bold group-hover:text-brand">{s.label}</span>
              </div>
              <span className="text-[10px] font-black uppercase text-gray-400">{s.type}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
