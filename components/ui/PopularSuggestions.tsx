import React from 'react';

/**
 * Interface que define as propriedades aceitas pelo componente.
 */
interface PopularSuggestionsProps {
  /** Lista de termos que serão exibidos como sugestões */
  suggestions: string[];
  /** Função que será executada quando o usuário clicar em um termo */
  onSelect: (term: string) => void;
}

/**
 * Componente PopularSuggestions
 * 
 * Exibe uma lista de termos de busca sugeridos em formato de botões (pills).
 * Corrigido: Adicionado padding vertical (py-2) no container para evitar que o efeito 
 * de escala (hover:scale-105) seja cortado pelas bordas do overflow.
 */
export const PopularSuggestions: React.FC<PopularSuggestionsProps> = ({ 
  suggestions, 
  onSelect 
}) => {
  // Se não houver sugestões, o componente não renderiza nada
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div className="w-full space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Cabeçalho do grupo de sugestões */}
      <div className="flex items-center justify-center sm:justify-start space-x-2">
        <svg className="w-3.5 h-3.5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
        <span className="text-[10px] font-[900] text-gray-400 dark:text-zinc-500 uppercase tracking-[2px]">
          Sugestões Populares
        </span>
      </div>

      {/* 
        Container de rolagem/ajuste:
        - Adicionado 'py-2' para dar respiro ao efeito de escala.
        - 'relative' e 'z-0' para controle de profundidade.
      */}
      <div className="relative flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3 overflow-x-auto no-scrollbar py-2">
        {suggestions.map((tag) => (
          <button
            key={tag}
            onClick={() => onSelect(tag)}
            className="
              flex-shrink-0 
              bg-white dark:bg-zinc-900 
              border border-gray-100 dark:border-zinc-800 
              px-5 py-2.5 
              rounded-xl 
              text-[13px] sm:text-[14px] 
              font-[800] 
              text-gray-700 dark:text-zinc-300 
              hover:border-brand hover:text-brand 
              hover:bg-brand/5 dark:hover:bg-brand/10
              hover:scale-105 active:scale-95 
              transition-all duration-300 
              shadow-sm hover:shadow-md
              hover:z-10 relative
            "
          >
            {/* Ícone de hashtag sutil antes do texto */}
            <span className="text-brand/40 mr-1.5 font-black">#</span>
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
};