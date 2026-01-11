
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../../services/firebase';
import { getBackupPayload, restoreAppData } from './BackupDataManager';

interface BackupViewProps {
  user: User | null;
}

const GOOGLE_CLIENT_ID = '349676062186-jsle32i8463qpad128u2g7grjtj4td33.apps.googleusercontent.com';
const BACKUP_FILENAME = 'ecofeira_backup_v3.json';

export const BackupView: React.FC<BackupViewProps> = ({ user }) => {
  const navigate = useNavigate();
  const [isDriveConnected, setIsDriveConnected] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string, type: 'info' | 'success' | 'error' } | null>(null);
  
  const accessTokenRef = useRef<string | null>(null);
  const tokenClientRef = useRef<any>(null);

  // Carrega o script do Google Identity Services
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      // Fix: cast window to any to access the google object provided by GSI script
      const win = window as any;
      if (win.google) {
        tokenClientRef.current = win.google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.appdata',
          callback: (response: any) => {
            if (response && response.access_token) {
              accessTokenRef.current = response.access_token;
              setIsDriveConnected(true);
              setIsProcessing(false);
              setStatusMessage({ text: 'Conectado ao Google Drive com sucesso!', type: 'success' });
            } else {
              setIsProcessing(false);
              setStatusMessage({ text: 'Falha ao obter permissão do Google Drive.', type: 'error' });
            }
          },
        });
      }
    };
    document.body.appendChild(script);

    return () => {
      const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (existingScript) document.body.removeChild(existingScript);
    };
  }, []);

  const handleDriveConnect = () => {
    if (tokenClientRef.current) {
      setIsProcessing(true);
      tokenClientRef.current.requestAccessToken();
    }
  };

  const findBackupFile = async () => {
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=name='${BACKUP_FILENAME}' and 'appDataFolder' in parents&spaces=appDataFolder`,
      {
        headers: { 'Authorization': `Bearer ${accessTokenRef.current}` }
      }
    );
    const result = await response.json();
    return result.files && result.files.length > 0 ? result.files[0].id : null;
  };

  const handleBackup = async () => {
    if (!accessTokenRef.current || !user) return;
    
    setIsProcessing(true);
    setStatusMessage({ text: 'Preparando backup...', type: 'info' });

    try {
      const fileId = await findBackupFile();
      const payload = getBackupPayload(user);
      const content = JSON.stringify(payload.data);

      if (fileId) {
        // Update existing file
        await fetch(
          `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`,
          {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${accessTokenRef.current}`,
              'Content-Type': 'application/json'
            },
            body: content
          }
        );
      } else {
        // Create new file
        const metadata = {
          name: BACKUP_FILENAME,
          parents: ['appDataFolder'],
          mimeType: 'application/json'
        };

        const formData = new FormData();
        formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
        formData.append('file', new Blob([content], { type: 'application/json' }));

        await fetch(
          'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
          {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${accessTokenRef.current}` },
            body: formData
          }
        );
      }

      setStatusMessage({ text: 'Backup realizado com sucesso!', type: 'success' });
    } catch (error) {
      console.error('Erro no backup:', error);
      setStatusMessage({ text: 'Erro ao realizar backup. Tente novamente.', type: 'error' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRestore = async () => {
    if (!accessTokenRef.current) return;

    setIsProcessing(true);
    setStatusMessage({ text: 'Buscando backup...', type: 'info' });

    try {
      const fileId = await findBackupFile();
      if (!fileId) {
        setStatusMessage({ text: 'Nenhum arquivo de backup encontrado no seu Google Drive.', type: 'error' });
        return;
      }

      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
        {
          headers: { 'Authorization': `Bearer ${accessTokenRef.current}` }
        }
      );
      
      const data = await response.json();
      restoreAppData(data); // Isso recarregará a página em caso de sucesso
      setStatusMessage({ text: 'Dados restaurados! Recarregando...', type: 'success' });
    } catch (error) {
      console.error('Erro na restauração:', error);
      setStatusMessage({ text: 'Erro ao restaurar dados. O arquivo pode estar corrompido.', type: 'error' });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!user) {
    navigate('/perfil');
    return null;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <button 
        onClick={() => navigate('/perfil')} 
        className="flex items-center space-x-2 text-sm font-black text-gray-400 hover:text-brand transition-colors group"
      >
        <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" />
        </svg>
        <span>Voltar ao Perfil</span>
      </button>

      <div className="bg-white dark:bg-[#1e293b] rounded-[3rem] p-8 sm:p-12 border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        
        <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-10 relative z-10">
          <div className="w-20 h-20 bg-blue-50 dark:bg-blue-500/10 rounded-3xl flex items-center justify-center text-blue-500 border border-blue-100 dark:border-blue-900/30 shadow-xl">
            <svg className="w-12 h-12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7.71,3.5L1.15,15L4.58,21L11.13,9.5L7.71,3.5M9.73,15L6.3,21H19.42L22.85,15H9.73M15,3.5L11.58,9.5L18.13,21L21.56,15L15,3.5Z" />
            </svg>
          </div>
          <div className="text-center sm:text-left">
            <h1 className="text-3xl sm:text-4xl font-[1000] text-[#111827] dark:text-white tracking-tighter leading-tight">Backup em Nuvem</h1>
            <p className="text-gray-500 dark:text-gray-400 font-bold mt-2">Sincronize seus favoritos e listas entre dispositivos de forma privada.</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1e293b] rounded-[3rem] p-8 sm:p-12 border border-gray-100 dark:border-gray-800 shadow-xl space-y-10">
        {!isDriveConnected ? (
          <div className="text-center py-10 space-y-8">
            <div className="max-w-md mx-auto">
              <p className="text-gray-500 dark:text-gray-400 font-medium mb-8">
                Para começar, conecte sua conta Google. Seus dados serão salvos em uma pasta oculta no seu Drive, acessível apenas por este aplicativo.
              </p>
              <button 
                onClick={handleDriveConnect}
                disabled={isProcessing}
                className="w-full flex items-center justify-center space-x-4 bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 hover:border-brand dark:hover:border-brand p-6 rounded-3xl shadow-lg transition-all active:scale-95 disabled:opacity-50"
              >
                <img src="https://www.gstatic.com/images/branding/product/1x/drive_2020q4_48dp.png" className="w-8 h-8" alt="Google Drive" />
                <span className="text-xl font-black text-gray-700 dark:text-gray-100">Conectar Google Drive</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex items-center justify-between p-6 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
              <div className="flex items-center space-x-4">
                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]"></div>
                <span className="font-black text-emerald-600 dark:text-emerald-400 uppercase text-xs tracking-widest">Sincronização Ativa</span>
              </div>
              <button onClick={() => { accessTokenRef.current = null; setIsDriveConnected(false); }} className="text-[10px] font-black text-gray-400 uppercase hover:text-red-500 transition-colors">Desconectar</button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <button 
                onClick={handleBackup}
                disabled={isProcessing}
                className="group relative flex flex-col items-center p-10 bg-brand text-white rounded-[2.5rem] shadow-2xl shadow-brand/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 transition-transform group-hover:scale-110">
                  <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/></svg>
                </div>
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                  </div>
                  <span className="text-xl font-black">Fazer Backup</span>
                  <span className="text-[10px] font-bold opacity-80 uppercase tracking-widest mt-2">Enviar dados para nuvem</span>
                </div>
              </button>

              <button 
                onClick={handleRestore}
                disabled={isProcessing}
                className="group relative flex flex-col items-center p-10 bg-[#0f172a] text-white rounded-[2.5rem] shadow-2xl shadow-black/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 overflow-hidden border border-gray-800"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 transition-transform group-hover:scale-110">
                  <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
                </div>
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-4">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l4 4m-4-4h12" /></svg>
                  </div>
                  <span className="text-xl font-black">Restaurar</span>
                  <span className="text-[10px] font-bold opacity-80 uppercase tracking-widest mt-2">Baixar dados da nuvem</span>
                </div>
              </button>
            </div>
          </div>
        )}

        {statusMessage && (
          <div className={`p-6 rounded-2xl border flex items-center space-x-4 animate-in slide-in-from-top-4 duration-300 ${
            statusMessage.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400' :
            statusMessage.type === 'error' ? 'bg-red-50 border-red-100 text-red-800 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400' :
            'bg-blue-50 border-blue-100 text-blue-800 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400'
          }`}>
            <div className={`p-2 rounded-lg ${
              statusMessage.type === 'success' ? 'bg-emerald-500 text-white' :
              statusMessage.type === 'error' ? 'bg-red-500 text-white' :
              'bg-blue-500 text-white'
            }`}>
              {isProcessing ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {statusMessage.type === 'success' ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /> :
                   statusMessage.type === 'error' ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /> :
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />}
                </svg>
              )}
            </div>
            <span className="font-bold">{statusMessage.text}</span>
          </div>
        )}
      </div>

      <div className="bg-blue-50/50 dark:bg-blue-500/5 p-8 rounded-[2.5rem] border border-blue-100/50 dark:border-blue-900/20 flex items-start space-x-6">
        <div className="p-3 bg-blue-500 text-white rounded-2xl shadow-lg shadow-blue-500/20 flex-shrink-0">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <div className="space-y-2">
          <h4 className="font-black text-blue-900 dark:text-blue-300 uppercase text-xs tracking-widest">Dica de Segurança</h4>
          <p className="text-sm text-blue-800/70 dark:text-blue-400/70 font-medium leading-relaxed">
            Seus dados são criptografados pelo Google e armazenados em sua própria conta. O EcoFeira não tem acesso à sua senha ou outros arquivos pessoais. Você pode revogar o acesso a qualquer momento nas configurações da sua conta Google.
          </p>
        </div>
      </div>
    </div>
  );
};
