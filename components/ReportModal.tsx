
import React, { useState } from 'react';
import { Product } from '../types';
import { User } from '../services/firebase';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  user: User | null;
}

type ReportReason = 'PRECO_ERRADO' | 'IMAGEM_ERRADA' | 'PRODUTO_FORA_ESTOQUE' | 'DADOS_INCORRETOS' | 'OUTRO';

export const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, product, user }) => {
  const [reason, setReason] = useState<ReportReason | ''>('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) return;

    setIsSubmitting(true);

    // Simulando envio para um serviço de coleta de dados
    const reportData = {
      product: {
        id: product.id,
        name: product.name,
        supermarket: product.supermarket,
      },
      reporter: {
        name: user?.displayName || 'Anônimo',
        uid: user?.uid || 'N/A',
        email: user?.email || 'N/A',
      },
      issue: {
        reason,
        comment,
        timestamp: new Date().toISOString(),
      }
    };

    console.log("🚀 Enviando Reporte:", reportData);

    // Simula latência de rede
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setIsSuccess(true);
  };

  const handleClose = () => {
    setReason('');
    setComment('');
    setIsSuccess(false);
    onClose();
  };

  const fallbackImage = "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=60&w=300";

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-[#0f172a]/90 backdrop-blur-md animate-in fade-in duration-300"
        onClick={handleClose}
      ></div>
      
      <div className="relative bg-white dark:bg-[#1e293b] w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col border border-gray-100 dark:border-gray-800">
        
        {/* Header */}
        <div className="p-6 sm:p-8 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-white/50 dark:bg-[#1e293b]/50 backdrop-blur-xl">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-red-50 dark:bg-red-500/10 rounded-xl flex items-center justify-center text-red-500 border border-red-100 dark:border-red-900/30">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-black text-[#111827] dark:text-white tracking-tighter">Reportar Item</h3>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Colabore com a comunidade</p>
            </div>
          </div>
          <button 
            onClick={handleClose} 
            className="p-3 bg-gray-50 dark:bg-[#0f172a] text-gray-400 hover:text-red-500 rounded-2xl transition-all border border-gray-100 dark:border-gray-800"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 sm:p-8 overflow-y-auto max-h-[70vh] custom-scrollbar">
          {isSuccess ? (
            <div className="py-12 flex flex-col items-center text-center space-y-6 animate-in zoom-in-95 duration-500">
              <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-xl shadow-emerald-500/20 animate-success-pop">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="space-y-2">
                <h4 className="text-3xl font-[1000] text-gray-900 dark:text-white tracking-tighter">Reporte Enviado!</h4>
                <p className="text-gray-500 dark:text-gray-400 font-bold max-w-xs">Obrigado por ajudar a manter o EcoFeira atualizado para todos.</p>
              </div>
              <button 
                onClick={handleClose}
                className="bg-brand text-white font-black px-12 py-5 rounded-2xl shadow-xl shadow-brand/20 hover:scale-105 active:scale-95 transition-all uppercase text-xs tracking-widest"
              >
                Concluir
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Product Preview */}
              <div className="bg-[#f8fafc] dark:bg-[#0f172a]/50 rounded-2xl p-4 flex items-center space-x-4 border border-gray-100 dark:border-gray-800">
                <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-xl p-2 border border-gray-100 dark:border-gray-700 flex-shrink-0">
                  <img src={product.imageUrl || fallbackImage} className="w-full h-full object-contain" alt="" />
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] font-black text-brand uppercase tracking-widest leading-none mb-1">{product.supermarket}</p>
                  <p className="font-extrabold text-gray-900 dark:text-white truncate text-sm">{product.name}</p>
                </div>
              </div>

              <div className="space-y-4">
                <label className="block">
                  <span className="text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest ml-1">Motivo do Reporte</span>
                  <select 
                    required
                    value={reason}
                    onChange={(e) => setReason(e.target.value as ReportReason)}
                    className="mt-2 w-full bg-gray-50 dark:bg-zinc-950 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 text-sm font-bold text-gray-700 dark:text-gray-200 outline-none focus:ring-2 focus:ring-brand/20 transition-all appearance-none cursor-pointer"
                  >
                    <option value="" disabled>Selecione uma opção...</option>
                    <option value="PRECO_ERRADO">O preço está incorreto</option>
                    <option value="IMAGEM_ERRADA">A imagem não corresponde</option>
                    <option value="PRODUTO_FORA_ESTOQUE">Produto está em falta na loja</option>
                    <option value="DADOS_INCORRETOS">Nome ou categoria errados</option>
                    <option value="OUTRO">Outro problema</option>
                  </select>
                </label>

                <label className="block">
                  <span className="text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest ml-1">Detalhes adicionais (Opcional)</span>
                  <textarea 
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Descreva o erro para nos ajudar a corrigir..."
                    className="mt-2 w-full bg-gray-50 dark:bg-zinc-950 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 text-sm font-bold text-gray-700 dark:text-gray-200 outline-none focus:ring-2 focus:ring-brand/20 transition-all min-h-[120px] resize-none"
                  />
                </label>
              </div>

              <button 
                type="submit"
                disabled={isSubmitting || !reason}
                className={`w-full py-6 rounded-[1.5rem] font-black text-sm uppercase tracking-widest transition-all shadow-xl flex items-center justify-center space-x-3 ${isSubmitting ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-brand text-white shadow-brand/20 hover:scale-[1.02] active:scale-95'}`}
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-4 border-gray-300 border-t-brand rounded-full animate-spin"></div>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    <span>Enviar Reporte</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        <div className="p-4 bg-gray-50/50 dark:bg-[#0f172a]/50 text-center border-t border-gray-100 dark:border-gray-800">
          <p className="text-[9px] font-bold text-gray-400 dark:text-zinc-600 uppercase tracking-[2px]">Dados de rastreamento: #{product.id.slice(0, 8)}</p>
        </div>
      </div>
    </div>
  );
};
