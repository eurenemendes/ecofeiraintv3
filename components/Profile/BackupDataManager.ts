
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

  console.log("🛠️ EcoFeira [Native Sync]: Payload preparado para Drive API.", payload.data);
  return payload;
};

export const restoreAppData = (payload: any) => {
  if (!payload || typeof payload !== 'object') {
    console.error("❌ EcoFeira [Native Sync]: Payload inválido.");
    return;
  }

  const { favorites, favoriteStores, shoppingList, scannedHistory, recentSearches } = payload;

  console.group("📥 EcoFeira [Native Sync]: Restaurando do Drive");
  
  if (Array.isArray(favorites)) localStorage.setItem('ecofeira_favorites', JSON.stringify(favorites));
  if (Array.isArray(favoriteStores)) localStorage.setItem('ecofeira_favorite_stores', JSON.stringify(favoriteStores));
  if (Array.isArray(shoppingList)) localStorage.setItem('ecofeira_shopping_list', JSON.stringify(shoppingList));
  if (Array.isArray(scannedHistory)) localStorage.setItem('ecofeira_scanned_history', JSON.stringify(scannedHistory));
  if (Array.isArray(recentSearches)) localStorage.setItem('ecofeira_recent_searches', JSON.stringify(recentSearches));

  console.groupEnd();

  console.log("✅ EcoFeira: Dados aplicados. Reiniciando...");
  
  setTimeout(() => {
    window.location.reload();
  }, 500);
};
