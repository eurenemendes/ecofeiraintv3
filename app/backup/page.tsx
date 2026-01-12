'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';

// Componentes de UI internos baseados em Tailwind para garantir funcionamento imediato
const Card = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-white dark:bg-[#1e293b] rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-2xl overflow-hidden ${className}`}>{children}</div>
);
const CardHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="p-8 sm:p-10 border-b border-gray-50 dark:border-gray-800/50 bg-gray-50/30 dark:bg-[#0f172a]/30">{children}</div>
);
const CardTitle = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <h3 className={`text-2xl sm:text-3xl font-black text-[#111827] dark:text-white tracking-tighter ${className}`}>{children}</h3>
);
const CardDescription = ({ children }: { children: React.ReactNode }) => (
  <p className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-2">{children}</p>
);
const CardContent = ({ children }: { children: React.ReactNode }) => (
  <div className="p-0 sm:p-2">{children}</div>
);

// --- DADOS DE EXEMPLO (MOCK) ---
const mockUser = {
  uid: 'mock_user_12345',
  displayName: 'Usuário EcoFeira',
  email: 'usuario@ecofeira.com',
  photoURL: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwzfHxwZXJzb24lMjBwb3J0cmFpdHxlbnwwfHx8fDE3NjgwMDU1OTV8MA&ixlib=rb-4.1.0&q=80&w=1080',
};
const mockAppData = {
  favorites: ['Tomate Orgânico', 'Alface Crespa', 'Ovos Caipira (Dúzia)'],
  shoppingList: [{ item: 'Cenoura', quantity: 5 }, { item: 'Batata Doce', quantity: 3 }],
  scannedHistory: ['prod_123_tomate', 'prod_456_alface'],
  recentSearches: ['maçã fuji', 'banana prata'],
};

export default function BackupPage() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isIframeReady, setIsIframeReady] = useState(false);
  const tokenClientRef = useRef<any>(null);

  const CHILD_APP_URL = 'https://drivervault.vercel.app/';
  const GOOGLE_CLIENT_ID = '349676062186-jsle32i8463qpad128u2g7grjtj4td33.apps.googleusercontent.com';

  // Função para lidar com a resposta do token do Google
  const handleTokenResponse = useCallback((response: any) => {
    const iframe = iframeRef.current;
    if (iframe?.contentWindow) {
      if (response && response.access_token) {
        console.log('EcoFeira: Token de acesso obtido, enviando para o módulo de backup...');
        iframe.contentWindow.postMessage({
          type: 'DRIVE_TOKEN_RESPONSE',
          token: response.access_token,
        }, CHILD_APP_URL);
      } else {
        console.error('EcoFeira: Falha ao obter token de acesso.');
        iframe.contentWindow.postMessage({
          type: 'DRIVE_TOKEN_ERROR',
          error: 'Falha na autenticação do Google Drive.',
        }, CHILD_APP_URL);
      }
    }
  }, []);

  // Efeito para carregar e inicializar o Google Identity Services (GSI)
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      // @ts-ignore
      if (window.google) {
        // @ts-ignore
        tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.appdata',
          callback: handleTokenResponse,
        });
        
        // Se o iframe já estiver pronto quando o GSI carregar, inicia a autenticação proativamente
        if (isIframeReady) {
            console.log('EcoFeira: GSI carregado e iframe pronto, solicitando token...');
            tokenClientRef.current.requestAccessToken();
        }
      }
    };
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [handleTokenResponse, isIframeReady]);

  // Efeito para gerenciar a comunicação com o iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const allowedOrigins = [
        'https://drivervault.vercel.app', 
        'https://copyecofeira.vercel.app', 
        'https://ecofeiraintv3.vercel.app'
      ];

      if (!allowedOrigins.includes(event.origin)) {
        return;
      }

      const { type, payload } = event.data;

      if (type === 'ECOFEIRA_BACKUP_READY') {
        console.log('EcoFeira: Site filho de backup está pronto.');
        setIsIframeReady(true);
        // Se o GSI client já foi inicializado, pede o token proativamente
        if (tokenClientRef.current) {
            console.log('EcoFeira: Filho pronto e GSI já carregado, iniciando fluxo de autorização...');
            tokenClientRef.current.requestAccessToken();
        }
      } else if (type === 'ECOFEIRA_RESTORE_DATA') {
        console.log('EcoFeira: Dados de restauração recebidos:', payload);
        alert('Dados restaurados com sucesso! Verifique o console para detalhes.');
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  // Efeito para enviar os dados iniciais assim que o filho estiver pronto
  useEffect(() => {
    if (isIframeReady && iframeRef.current?.contentWindow) {
      console.log('EcoFeira: Enviando dados de inicialização (MOCK) para o site filho...');
      iframeRef.current.contentWindow.postMessage({
        type: 'ECOFEIRA_BACKUP_INIT',
        user: mockUser,
        data: mockAppData,
      }, CHILD_APP_URL);
    }
  }, [isIframeReady]);

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-5xl animate-in fade-in slide-in-from-bottom-6 duration-1000">
      <Card>
        <CardHeader>
          <CardTitle>Gerenciamento de Backup</CardTitle>
          <CardDescription>
            Sincronização automática iniciada com o Google Drive para sua conta EcoFeira.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative w-full h-[700px] bg-[#f8fafc] dark:bg-[#0f172a] overflow-hidden rounded-b-[2.5rem]">
            <iframe
              ref={iframeRef}
              src={CHILD_APP_URL}
              className="w-full h-full border-none"
              title="DriveVault - Gerenciador de Backup do EcoFeira"
              allow="identity-credentials-get; clipboard-write"
            />
            {!isIframeReady && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 dark:bg-[#0f172a]/90 backdrop-blur-sm space-y-4">
                <div className="w-12 h-12 border-4 border-brand/20 border-t-brand rounded-full animate-spin"></div>
                <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Iniciando Sincronização Segura...</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-500/10 rounded-[2rem] border border-blue-100 dark:border-blue-900/30">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-blue-500 text-white rounded-xl shadow-lg">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h4 className="text-blue-900 dark:text-blue-100 font-black tracking-tight">Login Único Ativado</h4>
            <p className="text-blue-700/80 dark:text-blue-300/80 text-sm font-medium mt-1">
              Suas permissões do Google Drive são solicitadas apenas uma vez para garantir que sua lista de compras e favoritos estejam sempre protegidos na nuvem.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
