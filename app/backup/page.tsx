'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { auth, onAuthStateChanged, User } from '../../services/firebase';
import { getBackupPayload, restoreAppData } from '../../components/Profile/BackupDataManager';

const Card = ({ children, className = "" }: { children?: React.ReactNode, className?: string }) => (
  <div className={`bg-white dark:bg-[#1e293b] rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-2xl overflow-hidden ${className}`}>{children}</div>
);
const CardHeader = ({ children }: { children?: React.ReactNode }) => (
  <div className="p-8 sm:p-10 border-b border-gray-50 dark:border-gray-800/50 bg-gray-50/30 dark:bg-[#0f172a]/30">{children}</div>
);
const CardTitle = ({ children, className = "" }: { children?: React.ReactNode, className?: string }) => (
  <h3 className={`text-2xl sm:text-3xl font-black text-[#111827] dark:text-white tracking-tighter ${className}`}>{children}</h3>
);
const CardDescription = ({ children }: { children?: React.ReactNode }) => (
  <p className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-2">{children}</p>
);
const CardContent = ({ children }: { children?: React.ReactNode }) => (
  <div className="p-0 sm:p-2">{children}</div>
);

export default function BackupPage() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isIframeReady, setIsIframeReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const tokenClientRef = useRef<any>(null);

  const CHILD_APP_URL = 'https://drivervault.vercel.app/';
  const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '349676062186-jsle32i8463qpad128u2g7grjtj4td33.apps.googleusercontent.com';

  /**
   * FLUXO OTIMIZADO:
   * Envia o token e os dados reais do aplicativo em uma sequência garantida.
   */
  const handleTokenResponseAndSendData = useCallback((response: any) => {
    const iframe = iframeRef.current;
    
    console.group('🔍 EcoFeira [Audit]: Google Identity Response & Sync');
    
    if (iframe?.contentWindow) {
      if (response && response.access_token) {
        console.log('✅ EcoFeira: Token obtido. Iniciando sequência de sincronização...');
        
        // 1. Enviar o token de acesso para o DriverVault
        iframe.contentWindow.postMessage({
          type: 'DRIVE_TOKEN_RESPONSE',
          token: response.access_token,
        }, CHILD_APP_URL);
        console.log('🚀 EcoFeira: DRIVE_TOKEN_RESPONSE enviado.');

        // 2. Enviar os dados reais do usuário imediatamente após o token
        if (user) {
          const realDataPayload = getBackupPayload(user);
          iframe.contentWindow.postMessage(realDataPayload, CHILD_APP_URL);
          console.log('📤 EcoFeira: ECOFEIRA_BACKUP_INIT enviado com dados reais.');
        } else {
          console.warn('⚠️ EcoFeira: Dados não enviados - Usuário não autenticado no Firebase.');
        }
      } else {
        console.error('❌ EcoFeira: Resposta do Google inválida ou cancelada.', response);
        iframe.contentWindow.postMessage({
          type: 'DRIVE_TOKEN_ERROR',
          error: 'Não foi possível autorizar o acesso ao Google Drive.',
        }, CHILD_APP_URL);
      }
    } else {
      console.warn('⚠️ EcoFeira: Iframe não disponível para comunicação.');
    }
    console.groupEnd();
  }, [user]);

  // Monitora autenticação
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Inicialização do Google GSI
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      // @ts-ignore
      if (window.google) {
        console.log('📦 EcoFeira: Script Google GSI carregado.');
        // @ts-ignore
        tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.appdata',
          callback: handleTokenResponseAndSendData,
        });
        
        if (isIframeReady && user) {
            console.log('⚡ EcoFeira: GSI pronto. Acionando autorização...');
            tokenClientRef.current.requestAccessToken();
        }
      }
    };
    document.body.appendChild(script);
    return () => { if (document.body.contains(script)) document.body.removeChild(script); };
  }, [handleTokenResponseAndSendData, isIframeReady, user, GOOGLE_CLIENT_ID]);

  // Listener para mensagens do Iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const allowedOrigins = [
        'https://drivervault.vercel.app', 
        'https://copyecofeira.vercel.app', 
        'https://ecofeiraintv3.vercel.app'
      ];

      if (!allowedOrigins.includes(event.origin)) return;

      const { type, payload } = event.data;
      console.log(`📩 EcoFeira: Mensagem recebida de ${event.origin}: ${type}`);

      if (type === 'ECOFEIRA_BACKUP_READY') {
        setIsIframeReady(true);
        console.log('✅ EcoFeira: DriverVault sinalizou ECOFEIRA_BACKUP_READY.');
        
        // Ao receber prontidão do iframe, solicita o token se the usuário existir
        if (tokenClientRef.current && user) {
            console.log('🔑 EcoFeira: Solicitando token de acesso proativamente...');
            tokenClientRef.current.requestAccessToken();
        }
      } else if (type === 'ECOFEIRA_RESTORE_DATA') {
        console.log('📥 EcoFeira: Restaurando dados recebidos da nuvem...');
        restoreAppData(payload);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [user]);

  if (authLoading) return <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0f172a] transition-colors"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div></div>;

  if (!user) return (
    <div className="container mx-auto p-8 max-w-2xl text-center">
      <Card className="p-12">
        <h2 className="text-3xl font-black mb-4">Login Necessário</h2>
        <p className="mb-8 text-gray-500">Faça login para gerenciar seus backups com segurança no Google Drive.</p>
        <button onClick={() => window.location.hash = '/perfil'} className="bg-brand text-white font-black px-10 py-4 rounded-2xl shadow-xl shadow-brand/20 hover:scale-105 active:scale-95 transition-all">Ir para Login</button>
      </Card>
    </div>
  );

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-5xl animate-in fade-in duration-700">
      <Card>
        <CardHeader>
          <CardTitle>Sincronização Cloud</CardTitle>
          <CardDescription>Gerenciamento automático de dados via DriverVault e Google Drive.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative w-full h-[700px] bg-slate-50 dark:bg-slate-900 overflow-hidden rounded-b-[2.5rem]">
            <iframe
              ref={iframeRef}
              src={CHILD_APP_URL}
              className="w-full h-full border-none"
              title="DriveVault"
              allow="identity-credentials-get; clipboard-write"
            />
            {!isIframeReady && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm z-50">
                <div className="w-10 h-10 border-4 border-brand/20 border-t-brand rounded-full animate-spin mb-4"></div>
                <p className="text-xs font-black uppercase tracking-widest text-gray-400">Estabelecendo Conexão Segura...</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}