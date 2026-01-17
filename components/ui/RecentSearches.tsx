
import React from 'react';

interface RecentSearchesProps {
  /** Lista de termos buscados recentemente */
  items: string[];
  /** Função disparada ao clicar em um termo para pesquisar */
  onSelect: (term: string) => void;
  /** Função disparada ao clicar no 'X' para remover um único termo */
  onRemove: (term: string) => void;
  /** Função disparada ao clicar em 'LIMPAR TUDO' */
  onClearAll: () => void;
}

/**
 * Componente RecentSearches
 * 
 * Exibe o histórico de buscas do usuário.
 * Permite navegação rápida, exclusão por unidade ou limpeza total da lista.
 */
export const RecentSearches: React.FC<RecentSearchesProps> = ({
  items,
  onSelect,
  onRemove,
  onClearAll
}) => {
  if (!items || items.length === 0) return null;

  return (
    <div className="animate-in fade-in slide-in-from-top-1 duration-300">
      {/* Cabeçalho da Seção */}
      <div className="p-3 sm:p-5 bg-gray-50/50 dark:bg-zinc-950/30 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest">
            Buscas Recentes
          </span>
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); onClearAll(); }} 
          className="text-[10px] font-black text-brand uppercase tracking-widest hover:text-brand-dark bg-brand/5 dark:bg-brand/10 px-3 py-1.5 rounded-lg transition-colors border border-brand/10"
        >
          LIMPAR TUDO
        </button>
      </div>

      {/* Lista de Itens */}
      <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
        {items.map((term, idx) => (
          <div 
            key={`${term}-${idx}`} 
            className="flex items-center group border-b border-gray-50 dark:border-zinc-800/50 last:border-none"
          >
            {/* Botão de Seleção (Termo) */}
            <button 
              onClick={() => onSelect(term)} 
              className="flex-grow flex items-center p-4 sm:p-5 hover:bg-brand/5 dark:hover:bg-brand/10 group/item text-left transition-colors"
            >
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="p-2 sm:p-2.5 rounded-lg bg-gray-100 dark:bg-zinc-800 text-gray-400 group-hover/item:text-brand group-hover/item:bg-brand/10 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <span className="text-base sm:text-lg font-bold text-gray-700 dark:text-zinc-200 group-hover/item:text-brand truncate max-w-[200px] sm:max-w-xs">
                  {term}
                </span>
              </div>
            </button>

            {/* Botão de Remoção Individual (X) */}
            <button 
              onClick={(e) => { e.stopPropagation(); onRemove(term); }}
              className="p-4 sm:p-6 text-gray-300 dark:text-zinc-600 hover:text-red-500 dark:hover:text-red-400 transition-colors"
              title="Remover termo"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
