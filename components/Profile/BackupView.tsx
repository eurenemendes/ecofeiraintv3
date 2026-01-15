
import React, { useEffect, useState, useCallback } from 'react';
// Fix: Use namespace import for react-router-dom to resolve "no exported member" errors
import * as ReactRouterDOM from 'react-router-dom';
const { useNavigate } = ReactRouterDOM;
import { User, auth, GoogleAuthProvider, signInWithPopup, googleProvider } from '../../services/firebase';
import { getBackupPayload, restoreAppData } from './BackupDataManager';
import { googleDriveService, DriveFile } from '../../services/googleDriveService';

interface BackupViewProps {
  user: User | null;
}

export const BackupView: React.FC<BackupViewProps> = ({ user }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [lastBackup, setLastBackup] = useState<DriveFile | null>(null);
  const [localLastSync, setLocalLastSync] = useState<string | null>(localStorage.getItem('ecofeira_last_sync_time'));
  const [error, setError] = useState<string | null>(null);

  const getAccessToken = async () => {
    let token = sessionStorage.getItem('ecofeira_google_access_token');
    if (!token) {
      try {
        const result = await signInWithPopup(auth, googleProvider);
        const credential = GoogleAuthProvider.credentialFromResult(result);
        token = credential?.accessToken || null;
        if (token) sessionStorage.setItem('ecofeira_google_access_token', token);
      } catch (err) {
        console.error("Erro ao obter token:", err);
        return null;
      }
    }
    return token;
  };

  const checkRemoteBackup = useCallback(async () => {
    const token = sessionStorage.getItem('ecofeira_google_access_token');
    if (!token) return;
    try {
      const file = await googleDriveService.findBackupFile(token);
      setLastBackup(file);
      if (file?.modifiedTime) {
          localStorage.setItem('ecofeira_last_sync_time', file.modifiedTime);
          setLocalLastSync(file.modifiedTime);
      }
    } catch (err: any) {
      if (err.message?.includes('401')) {
          console.warn("☁️ Chave do Drive expirada. Exibindo dados locais de sincronização.");
      } else {
          console.error("Erro ao verificar backup remoto:", err);
      }
    }
  }, []);

  useEffect(() => {
    if (!user) { navigate('/perfil'); return; }
    checkRemoteBackup();
  }, [user, navigate, checkRemoteBackup]);

  const handleCreateBackup = async () => {
    setLoading(true); setStatus('syncing'); setError(null);
    try {
      const token = await getAccessToken();
      if (!token) throw new Error("Não foi possível autorizar o acesso ao Drive.");
      const payload = getBackupPayload(user!);
      await googleDriveService.saveBackup(token, payload.data);
      
      const now = new Date().toISOString();
      localStorage.setItem('ecofeira_last_sync_time', now);
      setLocalLastSync(now);
      
      await checkRemoteBackup();
      setStatus('success');
      setTimeout(() => setStatus('idle'), 3000);
    } catch (err: any) {
      setError(err.message || "Erro desconhecido ao salvar.");
      setStatus('error');
    } finally { setLoading(false); }
  };

  const handleRestoreBackup = async () => {
    setLoading(true); setStatus('syncing'); setError(null);
    try {
      const token = await getAccessToken();
      if (!token) throw new Error("Não foi possível autorizar o acesso ao Drive.");
      
      const file = await googleDriveService.findBackupFile(token);
      if (!file) throw new Error("Nenhum backup encontrado para restaurar.");
      
      const data = await googleDriveService.downloadBackup(token, file.id);
      restoreAppData(data);
    } catch (err: any) {
      setError(err.message || "Erro ao restaurar dados.");
      setStatus('error');
    } finally { setLoading(false); }
  };

  if (!user) return null;

  const hasActiveToken = !!sessionStorage.getItem('ecofeira_google_access_token');

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <button 
        onClick={() => navigate('/perfil')} 
        className="flex items-center space-x-2 text-sm font-black text-gray-400 hover:text-brand transition-colors group"
      >
        <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
        <span>Voltar ao Perfil</span>
      </button>

      <div className="bg-white dark:bg-zinc-900 rounded-[3rem] p-8 sm:p-16 border border-gray-100 dark:border-zinc-800 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        
        <div className="relative z-10 space-y-10">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-white dark:bg-zinc-800 rounded-3xl flex items-center justify-center border border-gray-100 dark:border-zinc-700 shadow-xl overflow-hidden">
              <img 
                src="https://lh3.googleusercontent.com/pw/AP1GczM9bwcmJa6-bqvODBn5shs5yt8ryC3_W2kJSad-baPqqGcxhlC_X8M6mIfT4t3KYKKJWNbUV15p18E7BdzhSkm5XtCnDqvbufDcyxTDOlJ6un-4SGi_6ZwQl8SlbrN4Wx4phuVHWExlgrETEH6MNiim=w60-h60" 
                alt="Google Drive" 
                className="w-12 h-12 object-contain"
              />
            </div>
            <div>
              <h1 className="text-3xl sm:text-5xl font-black text-[#111827] dark:text-white tracking-tighter">Backup Cloud</h1>
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mt-1">Sincronização Nativa via Google Drive</p>
            </div>
          </div>

          <div className="bg-zinc-50 dark:bg-zinc-950 rounded-[2rem] p-8 border border-gray-100 dark:border-zinc-800 space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-black text-gray-400 uppercase tracking-widest">Status da Nuvem</span>
              {localLastSync ? (
                <span className="bg-emerald-500/10 text-emerald-500 text-[10px] font-black px-3 py-1 rounded-full border border-emerald-500/20 uppercase tracking-tighter">Backup Disponível</span>
              ) : (
                <span className="bg-gray-100 dark:bg-zinc-800 text-gray-400 text-[10px] font-black px-3 py-1 rounded-full border border-gray-200 dark:border-zinc-700 uppercase tracking-tighter">Nenhum Backup</span>
              )}
            </div>
            
            <div className="space-y-2">
              <p className="text-gray-500 dark:text-zinc-500 font-bold">Última sincronização confirmada:</p>
              <p className="text-xl font-black text-gray-900 dark:text-white">
                {localLastSync ? new Date(localLastSync).toLocaleString('pt-BR') : 'Nunca sincronizado'}
              </p>
              
              {!hasActiveToken && (
                <div className="mt-4 p-4 bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-900/30 rounded-2xl animate-in slide-in-from-top-2">
                    <p className="text-[10px] text-orange-600 dark:text-orange-400 font-black uppercase flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        Acesso ao Drive Expirado
                    </p>
                    <p className="text-xs font-bold text-orange-500/80 dark:text-orange-400/80 mt-1 leading-relaxed">
                        Por segurança, o Google encerrou sua chave de acesso temporária. Clique em <b>Criar Backup</b> para reconectar sua conta.
                    </p>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button 
              onClick={handleCreateBackup}
              disabled={loading}
              className={`flex items-center justify-center space-x-3 p-6 rounded-[2rem] font-black text-sm uppercase tracking-wider transition-all shadow-xl ${status === 'success' ? 'bg-emerald-500 text-white' : 'bg-brand text-white shadow-brand/20 hover:scale-105 active:scale-95'} disabled:opacity-50`}
            >
              {loading && status === 'syncing' ? (
                <div className="w-5 h-5 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : status === 'success' ? (
                <><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg><span>Salvo!</span></>
              ) : (
                <><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg><span>Criar Backup</span></>
              )}
            </button>

            <button 
              onClick={handleRestoreBackup}
              disabled={loading || !localLastSync}
              className="flex items-center justify-center space-x-3 p-6 rounded-[2rem] font-black text-sm uppercase tracking-wider bg-white dark:bg-zinc-800 text-gray-700 dark:text-zinc-200 border-2 border-gray-100 dark:border-zinc-700 hover:border-brand hover:text-brand transition-all shadow-sm hover:scale-105 active:scale-95 disabled:opacity-30"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>
              <span>Restaurar Dados</span>
            </button>
          </div>

          <div className="pt-6 border-t border-gray-100 dark:border-zinc-800">
            <p className="text-[10px] font-bold text-gray-400 dark:text-zinc-600 uppercase tracking-[2px] text-center leading-relaxed">
              Os dados são armazenados de forma segura na pasta oculta do seu Google Drive.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};