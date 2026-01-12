
'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { auth, onAuthStateChanged, User } from '../../services/firebase';
import { getBackupPayload, restoreAppData } from '../../components/Profile/BackupDataManager';

// Componentes de UI internos para consistência visual
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

export default function BackupPage() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isIframeReady, setIsIframeReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const tokenClientRef = useRef<any>(null);

  const CHILD_APP_URL = 'https://drivervault.vercel.app/';
  const GOOGLE_CLIENT_ID = '349676062186-jsle32i8463qpad128u2g7grjtj4td33.apps.googleusercontent.com';

  // Handler para resposta do Google OAuth com logs de auditoria
  const handleTokenResponse = useCallback((response: any) => {
    const iframe = iframeRef.current;
    
    console.group('🔍 EcoFeira [Audit]: Google Identity Response');
    
    if (iframe?.contentWindow) {
      if (response && response.access_token) {
        console.log('✅ Token obtido. Preparando envio via postMessage...');
        console.log('Payload:', { type: 'DRIVE_TOKEN_RESPONSE', token: response.access_token.substring(0, 10) + "..." });
        
        iframe.contentWindow.postMessage({
          type: 'DRIVE_TOKEN_RESPONSE',
          token: response.access_token,
        }, CHILD_APP_URL);
        
        console.log('🚀 Mensagem postada para:', CHILD_APP_URL);
      } else {
        console.error('❌ Erro: Token inválido na resposta.', response);
        iframe.contentWindow.postMessage({
          type: 'DRIVE_TOKEN_ERROR',
          error: 'Não foi possível autorizar o acesso ao Google Drive.',
        }, CHILD_APP_URL);
      }
    } else {
      console.warn('⚠️ Erro: Iframe indisponível para postMessage.');
    }
    console.groupEnd();
  }, []);

  // Monitora o estado de autenticação do Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Inicialização do Google Identity Services (GSI)
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      // @ts-ignore
      if (window.google) {
        console.log('📦 EcoFeira [Audit]: Script GSI carregado. Configurando initTokenClient.');
        // @ts-ignore
        tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.appdata',
          callback: handleTokenResponse,
        });
        
        // Se o iframe sinalizou prontidão antes do script carregar
        if (isIframeReady && user) {
            console.log('⚡ EcoFeira [Audit]: Acionando solicitação automática de token.');
            tokenClientRef.current.requestAccessToken();
        }
      }
    };
    document.body.appendChild(script);
    return () => { if (document.body.contains(script)) document.body.removeChild(script); };
  }, [handleTokenResponse, isIframeReady, user]);

  // Gerenciamento de mensagens do iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const allowedOrigins = [
        'https://drivervault.vercel.app', 
        'https://copyecofeira.vercel.app', 
        'https://ecofeiraintv3.vercel.app'
      ];

      if (!allowedOrigins.includes(event.origin)) return;

      const { type, payload } = event.data;
      console.log(`📩 EcoFeira [Audit]: Mensagem recebida de ${event.origin}: ${type}`);

      if (type === 'ECOFEIRA_BACKUP_READY') {
        setIsIframeReady(true);
        if (tokenClientRef.current && user) {
            console.log('🔑 EcoFeira [Audit]: Iniciando fluxo proativo após sinalização do filho.');
            tokenClientRef.current.requestAccessToken();
        }
      } else if (type === 'ECOFEIRA_RESTORE_DATA') {
        console.log('📥 EcoFeira [Audit]: Restaurando dados...');
        restoreAppData(payload);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [user]);

  // Disparo automático de dados reais ao DriverVault
  useEffect(() => {
    if (isIframeReady && iframeRef.current?.contentWindow && user) {
      console.log('📤 EcoFeira [Audit]: Sincronizando dados reais do usuário com DriverVault.');
      const realDataPayload = getBackupPayload(user);
      iframeRef.current.contentWindow.postMessage(realDataPayload, CHILD_APP_URL);
    }
  }, [isIframeReady, user]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] dark:bg-[#0f172a]">
        <div className="w-12 h-12 border-4 border-brand/20 border-t-brand rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto p-8 max-w-2xl text-center">
        <Card className="p-12">
          <div className="w-20 h-20 bg-gray-50 dark:bg-[#0f172a] rounded-3xl flex items-center justify-center mx-auto mb-8">
            <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-4 tracking-tighter">Acesso Restrito</h2>
          <p className="text-gray-500 font-medium mb-8">Você precisa estar logado para gerenciar seus backups na nuvem.</p>
          <a href="#/perfil" className="inline-block bg-brand text-white font-black px-10 py-4 rounded-2xl shadow-xl shadow-brand/20 hover:scale-105 transition-all">Ir para o Login</a>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-5xl animate-in fade-in slide-in-from-bottom-6 duration-1000">
      <Card>
        <CardHeader>
          <CardTitle>Backup Inteligente</CardTitle>
          <CardDescription>
            Auditando fluxo de sincronização com Google Drive.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative w-full h-[700px] bg-[#f8fafc] dark:bg-[#0f172a] overflow-hidden rounded-b-[2.5rem]">
            <iframe
              ref={iframeRef}
              src={CHILD_APP_URL}
              className="w-full h-full border-none"
              title="DriveVault - Gerenciador de Backup"
              allow="identity-credentials-get; clipboard-write"
            />
            {!isIframeReady && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 dark:bg-[#0f172a]/90 backdrop-blur-sm space-y-4">
                <div className="w-12 h-12 border-4 border-brand/20 border-t-brand rounded-full animate-spin"></div>
                <p className="text-sm font-black text-gray-400 uppercase tracking-widest animate-pulse">Estabelecendo Conexão Segura...</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
