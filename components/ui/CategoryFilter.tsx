
import React from 'react';

interface CategoryFilterProps {
  /** Lista de categorias a serem exibidas */
  categories: string[];
  /** Categoria atualmente selecionada */
  selectedCategory: string;
  /** Função chamada ao trocar de categoria */
  onCategoryChange: (category: string) => void;
  /** Título opcional exibido acima do filtro (ex: CATEGORIAS:) */
  title?: string;
  /** Referência para o container (usado para o script de drag-to-scroll no App.tsx) */
  containerRef?: React.RefObject<HTMLDivElement | null>;
  /** Função opcional para filtrar quais categorias devem aparecer (ex: checar disponibilidade em estoque) */
  categoryFilterFn?: (category: string) => boolean;
}

/**
 * Componente de Filtro de Categorias (Pills)
 * Estilizado para ocupar os extremos da tela (edge-to-edge) usando margens negativas 
 * que anulam o padding do container pai, mantendo o alinhamento interno.
 */
export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onCategoryChange,
  title,
  containerRef,
  categoryFilterFn
}) => {
  return (
    <div className="relative">
      {/* Label superior - Mantém o alinhamento padrão do container */}
      {title && (
        <span className="text-[10px] font-[900] text-gray-400 dark:text-zinc-500 uppercase tracking-[1.5px] mb-4 block px-0">
          {title}
        </span>
      )}

      {/* 
        Container de Scroll:
        - Margens negativas (-mx-*) fazem ele encostar nas bordas da tela.
        - Padding (px-*) interno garante que o conteúdo comece alinhado com o resto do app.
        - mask-image cria o efeito "infinito" de fade-out nas laterais.
      */}
      <div 
        className="relative -mx-4 sm:-mx-6 lg:-mx-8 overflow-hidden"
        style={{
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)',
          maskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)'
        }}
      >
        <div 
          ref={containerRef} 
          className="flex items-center gap-2 sm:gap-4 overflow-x-auto no-scrollbar pb-4 pt-2 px-4 sm:px-6 lg:px-8 cursor-grab select-none active:cursor-grabbing"
        >
          {categories.map((cat) => {
            if (categoryFilterFn && !categoryFilterFn(cat)) return null;

            const isSelected = selectedCategory === cat;

            return (
              <button
                key={cat}
                onClick={() => onCategoryChange(cat)}
                className={`
                  flex-shrink-0 px-8 sm:px-12 py-3 sm:py-5 rounded-xl sm:rounded-[1.8rem] 
                  text-xs sm:text-[15px] font-[800] transition-all
                  ${isSelected 
                    ? 'bg-brand text-white shadow-md shadow-brand/20 scale-105 z-10' 
                    : 'bg-white dark:bg-zinc-900 text-gray-600 dark:text-zinc-300 border border-gray-100 dark:border-zinc-800 hover:border-brand shadow-sm'
                  }
                `}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
