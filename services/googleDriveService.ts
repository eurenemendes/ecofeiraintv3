
/**
 * Serviço de integração direta com Google Drive REST API v3
 * Utiliza o Access Token obtido via Firebase Auth
 */

const DRIVE_API_URL = 'https://www.googleapis.com/drive/v3/files';
const BACKUP_FILENAME = 'ecofeira_backup_v3.json';

export interface DriveFile {
  id: string;
  name: string;
  modifiedTime?: string;
}

export const googleDriveService = {
  /**
   * Procura pelo arquivo de backup na pasta AppData
   */
  async findBackupFile(accessToken: string): Promise<DriveFile | null> {
    const query = `name = '${BACKUP_FILENAME}' and trashed = false`;
    const response = await fetch(`${DRIVE_API_URL}?q=${encodeURIComponent(query)}&spaces=appDataFolder&fields=files(id, name, modifiedTime)`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    
    if (!response.ok) throw new Error('Erro ao buscar backup no Drive');
    
    const data = await response.json();
    return data.files && data.files.length > 0 ? data.files[0] : null;
  },

  /**
   * Salva ou atualiza o backup na nuvem
   */
  async saveBackup(accessToken: string, content: any): Promise<void> {
    const existingFile = await this.findBackupFile(accessToken);
    const metadata = {
      name: BACKUP_FILENAME,
      mimeType: 'application/json',
      parents: existingFile ? undefined : ['appDataFolder']
    };

    const formData = new FormData();
    formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    formData.append('file', new Blob([JSON.stringify(content)], { type: 'application/json' }));

    let url = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
    let method = 'POST';

    if (existingFile) {
      url = `https://www.googleapis.com/upload/drive/v3/files/${existingFile.id}?uploadType=multipart`;
      method = 'PATCH';
    }

    const response = await fetch(url, {
      method,
      headers: { 'Authorization': `Bearer ${accessToken}` },
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Drive Save Error:', error);
      throw new Error('Falha ao salvar backup no Google Drive');
    }
  },

  /**
   * Baixa o conteúdo do arquivo de backup
   */
  async downloadBackup(accessToken: string, fileId: string): Promise<any> {
    const response = await fetch(`${DRIVE_API_URL}/${fileId}?alt=media`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });

    if (!response.ok) throw new Error('Falha ao baixar backup do Drive');
    return await response.json();
  }
};
