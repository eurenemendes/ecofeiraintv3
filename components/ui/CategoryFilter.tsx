
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
 * Estilizado para scroll horizontal e estados visuais claros de seleção.
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
    <div className="overflow-hidden">
      {/* Label superior em caixa alta com estilo minimalista */}
      {title && (
        <span className="text-[10px] font-[900] text-gray-400 dark:text-zinc-500 uppercase tracking-[1.5px] mb-4 block">
          {title}
        </span>
      )}

      {/* Container de scroll horizontal com suporte a arrastar (se o ref estiver configurado no pai) */}
      <div 
        ref={containerRef} 
        className="flex items-center gap-2 sm:gap-4 overflow-x-auto no-scrollbar pb-2 cursor-grab select-none active:cursor-grabbing"
      >
        {categories.map((cat) => {
          // Se houver uma função de filtro (ex: só mostrar categorias com produtos na loja atual)
          if (categoryFilterFn && !categoryFilterFn(cat)) return null;

          const isSelected = selectedCategory === cat;

          return (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              className={`
                flex-shrink-0 px-8 sm:px-12 py-3 sm:py-5 rounded-xl sm:rounded-[1.8rem] 
                text-xs sm:text-[15px] font-[800] transition-all shadow-sm
                ${isSelected 
                  ? 'bg-brand text-white shadow-xl shadow-brand/30 scale-105' // Estilo Ativo
                  : 'bg-white dark:bg-zinc-900 text-gray-600 dark:text-zinc-300 border border-gray-100 dark:border-zinc-800 hover:border-brand' // Estilo Inativo
                }
              `}
            >
              {cat}
            </button>
          );
        })}
      </div>
    </div>
  );
};
