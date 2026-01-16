
import React from 'react';
import { Supermarket } from '../../types';

interface StoreFilterProps {
  /** Lista de nomes de supermercados (ex: ['Todos', 'Supermercados BH', ...]) */
  supermarketNames: string[];
  /** Lista completa de objetos Supermarket para extração de logos */
  stores: Supermarket[];
  /** Nome do supermercado selecionado */
  selectedSupermarket: string;
  /** Função chamada ao trocar a loja */
  onSupermarketChange: (store: string) => void;
  /** Título superior */
  title?: string;
  /** Referência para o container de scroll (drag-to-scroll) */
  containerRef?: React.RefObject<HTMLDivElement | null>;
}

/**
 * Componente de Filtro de Lojas (Pills com Logo)
 * Implementa o efeito visual de "rolagem infinita" chegando aos extremos da tela.
 */
export const StoreFilter: React.FC<StoreFilterProps> = ({
  supermarketNames,
  stores,
  selectedSupermarket,
  onSupermarketChange,
  title,
  containerRef
}) => {
  // Helper local para normalização de string (garante busca correta do logo)
  const normalize = (str: string) => 
    str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  return (
    <div className="relative">
      {/* Label - Mantém alinhamento padrão */}
      {title && (
        <span className="text-[10px] font-[900] text-gray-400 dark:text-zinc-500 uppercase tracking-[1px] mb-3 block">
          {title}
        </span>
      )}

      {/* 
        Container Edge-to-Edge:
        - Margens negativas (-mx-*) anulam o padding do pai para encostar na tela.
        - MaskImage cria o efeito de fade lateral.
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
          {supermarketNames.map(storeName => {
            const storeData = stores.find(s => normalize(s.name) === normalize(storeName));
            const isSelected = selectedSupermarket === storeName;

            return (
              <button 
                key={storeName} 
                onClick={() => onSupermarketChange(storeName)} 
                className={`
                  flex-shrink-0 px-6 py-3 rounded-xl sm:rounded-[1.5rem] 
                  text-xs sm:text-[15px] font-[800] transition-all 
                  flex items-center space-x-3
                  ${isSelected 
                    ? 'bg-brand text-white shadow-md shadow-brand/20 scale-105 z-10' 
                    : 'bg-white dark:bg-zinc-900 text-gray-600 dark:text-zinc-300 border border-gray-100 dark:border-zinc-800 hover:border-brand shadow-sm'
                  }
                `}
              >
                {/* Exibe o logo se não for a opção 'Todos' e o dado existir */}
                {storeName !== 'Todos' && storeData?.logo && (
                  <div className="w-5 h-5 sm:w-7 sm:h-7 bg-white rounded-lg p-0.5 flex-shrink-0 flex items-center justify-center shadow-sm">
                    <img src={storeData.logo} className="w-full h-full object-contain" alt="" />
                  </div>
                )}
                <span>{storeName}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
