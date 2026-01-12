
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const [error, setError] = useState<string | null>(null);

  const getAccessToken = async () => {
    // Tenta pegar o token do sessionStorage primeiro (salvo no login do App.tsx)
    let token = sessionStorage.getItem('ecofeira_google_access_token');
    
    // Se não houver token ou estiver expirado, precisamos re-autenticar com os escopos
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
    const token = await getAccessToken();
    if (!token) return;

    try {
      const file = await googleDriveService.findBackupFile(token);
      setLastBackup(file);
    } catch (err) {
      console.error("Erro ao verificar backup remoto:", err);
    }
  }, []);

  useEffect(() => {
    if (!user) {
      navigate('/perfil');
      return;
    }
    checkRemoteBackup();
  }, [user, navigate, checkRemoteBackup]);

  const handleCreateBackup = async () => {
    setLoading(true);
    setStatus('syncing');
    setError(null);

    try {
      const token = await getAccessToken();
      if (!token) throw new Error("Não foi possível autorizar o acesso ao Drive.");

      const payload = getBackupPayload(user!);
      await googleDriveService.saveBackup(token, payload.data);
      
      await checkRemoteBackup();
      setStatus('success');
      setTimeout(() => setStatus('idle'), 3000);
    } catch (err: any) {
      setError(err.message || "Erro desconhecido ao salvar.");
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreBackup = async () => {
    if (!lastBackup) return;
    
    setLoading(true);
    setStatus('syncing');
    setError(null);

    try {
      const token = await getAccessToken();
      if (!token) throw new Error("Não foi possível autorizar o acesso ao Drive.");

      const data = await googleDriveService.downloadBackup(token, lastBackup.id);
      restoreAppData(data);
      // restoreAppData já recarrega a página
    } catch (err: any) {
      setError(err.message || "Erro ao restaurar dados.");
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

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

      <div className="bg-white dark:bg-[#1e293b] rounded-[3rem] p-8 sm:p-16 border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        
        <div className="relative z-10 space-y-10">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-blue-50 dark:bg-blue-500/10 rounded-3xl flex items-center justify-center text-blue-500 border border-blue-100 dark:border-blue-900/30 shadow-xl">
              <svg className="w-10 h-10" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7.71,3.5L1.15,15L4.58,21L11.13,9.5L7.71,3.5M9.73,15L6.3,21H19.42L22.85,15H9.73M15,3.5L11.58,9.5L18.13,21L21.56,15L15,3.5Z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl sm:text-5xl font-black text-[#111827] dark:text-white tracking-tighter">Backup Cloud</h1>
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mt-1">Sincronização Nativa via Google Drive</p>
            </div>
          </div>

          <div className="bg-[#f8fafc] dark:bg-[#0f172a]/50 rounded-[2rem] p-8 border border-gray-100 dark:border-gray-800 space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-black text-gray-400 uppercase tracking-widest">Status da Nuvem</span>
              {lastBackup ? (
                <span className="bg-emerald-500/10 text-emerald-500 text-[10px] font-black px-3 py-1 rounded-full border border-emerald-500/20 uppercase">Arquivo Localizado</span>
              ) : (
                <span className="bg-gray-100 dark:bg-gray-800 text-gray-400 text-[10px] font-black px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700 uppercase">Nenhum Backup</span>
              )}
            </div>
            
            <div className="space-y-2">
              <p className="text-gray-500 dark:text-gray-400 font-bold">Última sincronização:</p>
              <p className="text-xl font-black text-gray-900 dark:text-white">
                {lastBackup?.modifiedTime ? new Date(lastBackup.modifiedTime).toLocaleString('pt-BR') : 'Nunca sincronizado'}
              </p>
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
              disabled={loading || !lastBackup}
              className="flex items-center justify-center space-x-3 p-6 rounded-[2rem] font-black text-sm uppercase tracking-wider bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-2 border-gray-100 dark:border-gray-700 hover:border-blue-500 hover:text-blue-500 transition-all shadow-sm hover:scale-105 active:scale-95 disabled:opacity-30"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>
              <span>Restaurar Dados</span>
            </button>
          </div>

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-900/30 rounded-2xl text-red-500 text-xs font-bold text-center">
              {error}
            </div>
          )}

          <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-[2px] text-center leading-relaxed">
              Os dados são armazenados de forma criptografada na pasta oculta do seu Google Drive vinculada ao EcoFeira.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
