
import React, { useState } from 'react';

interface TooltipProps {
  /** O texto ou elemento que será exibido dentro do tooltip */
  content: React.ReactNode;
  /** O elemento que ativará o tooltip ao passar o mouse */
  children: React.ReactNode;
  /** Posição do tooltip em relação ao elemento pai */
  position?: 'top' | 'bottom' | 'bottom-left' | 'left' | 'right';
  /** Delay opcional antes de mostrar (ms) */
  delay?: number;
}

/**
 * Componente Tooltip
 * 
 * Atualizado com z-[9999] para garantir que fique acima de qualquer elemento da interface
 * e ajustes de espaçamento para evitar colisões com bordas de containers.
 */
export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  delay = 0
}) => {
  const [isVisible, setIsVisible] = useState(false);
  let timeout: number;

  const showTooltip = () => {
    timeout = window.setTimeout(() => setIsVisible(true), delay);
  };

  const hideTooltip = () => {
    window.clearTimeout(timeout);
    setIsVisible(false);
  };

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-3',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-3',
    'bottom-left': 'top-full right-0 mt-3',
    left: 'right-full top-1/2 -translate-y-1/2 mr-3',
    right: 'left-full top-1/2 -translate-y-1/2 ml-3'
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-zinc-900 dark:border-t-white',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-zinc-900 dark:border-b-white',
    'bottom-left': 'bottom-full right-3 border-b-zinc-900 dark:border-b-white',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-zinc-900 dark:border-l-white',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-zinc-900 dark:border-r-white'
  };

  return (
    <div 
      className="relative inline-block group"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}
      
      {isVisible && (
        <div 
          className={`
            absolute z-[9999] pointer-events-none
            px-3 py-1.5 
            bg-zinc-900 dark:bg-white
            text-white dark:text-zinc-900
            text-[10px] sm:text-[11px] font-black uppercase tracking-widest
            rounded-lg shadow-2xl
            animate-in fade-in zoom-in-95 duration-200
            whitespace-nowrap
            ${positionClasses[position]}
          `}
          role="tooltip"
        >
          {content}
          
          {/* Seta do Tooltip */}
          <div 
            className={`
              absolute border-[6px] border-transparent
              ${arrowClasses[position]}
            `}
          />
        </div>
      )}
    </div>
  );
};
