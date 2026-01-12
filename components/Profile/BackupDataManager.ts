
import { User } from '../../services/firebase';

export interface BackupPayload {
  type: 'ECOFEIRA_BACKUP_INIT';
  user: {
    uid: string;
    displayName: string | null;
    email: string | null;
    photoURL: string | null;
  };
  timestamp: string;
  data: {
    favorites: string[];
    favoriteStores: string[];
    shoppingList: any[];
    scannedHistory: string[];
    recentSearches: string[];
  };
}

/**
 * Coleta todos os dados relevantes do usuário e estado local da aplicação
 * para serem enviados ao sistema de backup.
 */
export const getBackupPayload = (user: User): BackupPayload => {
  const payload: BackupPayload = {
    type: 'ECOFEIRA_BACKUP_INIT',
    user: {
      uid: user.uid,
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
    },
    timestamp: new Date().toISOString(),
    data: {
      favorites: JSON.parse(localStorage.getItem('ecofeira_favorites') || '[]'),
      favoriteStores: JSON.parse(localStorage.getItem('ecofeira_favorite_stores') || '[]'),
      shoppingList: JSON.parse(localStorage.getItem('ecofeira_shopping_list') || '[]'),
      scannedHistory: JSON.parse(localStorage.getItem('ecofeira_scanned_history') || '[]'),
      recentSearches: JSON.parse(localStorage.getItem('ecofeira_recent_searches') || '[]'),
    }
  };

  console.log("🛠️ EcoFeira [Audit]: Payload de backup gerado a partir do localStorage.", payload.data);
  return payload;
};

/**
 * Processa dados recebidos do sistema de backup e restaura no localStorage
 * do site pai.
 */
export const restoreAppData = (payload: any) => {
  if (!payload || typeof payload !== 'object') {
    console.error("❌ EcoFeira [Audit]: Payload de restauração inválido ou vazio.");
    return;
  }

  const { favorites, favoriteStores, shoppingList, scannedHistory, recentSearches } = payload;

  console.group("📥 EcoFeira [Audit]: Restaurando Dados da Nuvem");
  
  if (Array.isArray(favorites)) {
    localStorage.setItem('ecofeira_favorites', JSON.stringify(favorites));
    console.log("- Favoritos restaurados");
  }

  if (Array.isArray(favoriteStores)) {
    localStorage.setItem('ecofeira_favorite_stores', JSON.stringify(favoriteStores));
    console.log("- Lojas favoritas restauradas");
  }
  
  if (Array.isArray(shoppingList)) {
    localStorage.setItem('ecofeira_shopping_list', JSON.stringify(shoppingList));
    console.log("- Lista de compras restaurada");
  }
  
  if (Array.isArray(scannedHistory)) {
    localStorage.setItem('ecofeira_scanned_history', JSON.stringify(scannedHistory));
    console.log("- Histórico de scan restaurado");
  }
  
  if (Array.isArray(recentSearches)) {
    localStorage.setItem('ecofeira_recent_searches', JSON.stringify(recentSearches));
    console.log("- Pesquisas recentes restauradas");
  }

  console.groupEnd();

  // Notifica o sistema de que os dados foram aplicados com sucesso
  console.log("✅ EcoFeira [Audit]: Dados aplicados com sucesso. Recarregando página para sincronizar UI...");
  
  // Recarrega a aplicação para que o estado do React seja atualizado com os novos dados do localStorage
  setTimeout(() => {
    window.location.reload();
  }, 1000);
};
