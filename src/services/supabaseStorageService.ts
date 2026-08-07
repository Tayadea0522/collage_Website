import { supabase } from '../supabaseClient';
import { AdmissionApplication } from '../types';

export const BUCKET_NAME = 'admissions';

export const supabaseStorageService = {
  /**
   * Ensure bucket existence check or instructions
   */
  getBucketName: () => BUCKET_NAME,

  /**
   * Upload a single document to private Supabase Storage bucket
   * Path: admissions/{applicationId}/{docType}_{fileName}
   */
  uploadDocument: async (
    applicationId: string,
    docType: string,
    fileOrDataUrl: File | string,
    fileName: string
  ): Promise<{ storagePath: string; publicOrSignedUrl: string; error?: string }> => {
    try {
      const cleanFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
      const filePath = `admissions/${applicationId}/${docType}_${cleanFileName}`;

      let fileBody: File | Blob;
      let contentType = 'application/octet-stream';

      if (typeof fileOrDataUrl === 'string') {
        // Convert Base64 Data URL to Blob
        const parts = fileOrDataUrl.split(';base64,');
        if (parts.length === 2) {
          const match = fileOrDataUrl.match(/data:(.*?);/);
          if (match) contentType = match[1];
          const byteString = atob(parts[1]);
          const ab = new ArrayBuffer(byteString.length);
          const ia = new Uint8Array(ab);
          for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
          }
          fileBody = new Blob([ab], { type: contentType });
        } else {
          fileBody = new Blob([fileOrDataUrl], { type: 'text/plain' });
        }
      } else {
        fileBody = fileOrDataUrl;
        contentType = fileOrDataUrl.type || 'application/octet-stream';
      }

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, fileBody, {
          contentType,
          upsert: true
        });

      if (error) {
        console.warn('Supabase Storage upload warning:', error.message);
        // Return fallback path if Supabase error
        return {
          storagePath: filePath,
          publicOrSignedUrl: typeof fileOrDataUrl === 'string' ? fileOrDataUrl : '',
          error: error.message
        };
      }

      // Try to create a signed URL (expires in 1 hour)
      const { data: signedData } = await supabase.storage
        .from(BUCKET_NAME)
        .createSignedUrl(data.path, 3600);

      const url = signedData?.signedUrl || typeof fileOrDataUrl === 'string' ? (fileOrDataUrl as string) : '';

      return {
        storagePath: data.path,
        publicOrSignedUrl: url
      };
    } catch (err: any) {
      console.error('Error uploading document to Supabase storage:', err);
      return {
        storagePath: `admissions/${applicationId}/${docType}_${fileName}`,
        publicOrSignedUrl: typeof fileOrDataUrl === 'string' ? fileOrDataUrl : '',
        error: err.message || 'Storage upload error'
      };
    }
  },

  /**
   * Get signed URL for a private storage file
   */
  getSignedUrl: async (storagePath: string, fallbackDataUrl?: string): Promise<string> => {
    if (!storagePath) return fallbackDataUrl || '';
    try {
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .createSignedUrl(storagePath, 3600);
      
      if (!error && data?.signedUrl) {
        return data.signedUrl;
      }
    } catch (e) {
      // ignore
    }
    return fallbackDataUrl || '';
  },

  /**
   * Fetch file blob from Supabase Storage or dataUrl fallback
   */
  getFileBlob: async (storagePath?: string, fallbackDataUrl?: string): Promise<Blob | null> => {
    if (storagePath) {
      try {
        const { data, error } = await supabase.storage
          .from(BUCKET_NAME)
          .download(storagePath);
        if (!error && data) {
          return data;
        }
      } catch (e) {
        console.warn('Storage download fallback:', e);
      }
    }

    if (fallbackDataUrl && fallbackDataUrl.startsWith('data:')) {
      const parts = fallbackDataUrl.split(';base64,');
      if (parts.length === 2) {
        const match = fallbackDataUrl.match(/data:(.*?);/);
        const contentType = match ? match[1] : 'application/octet-stream';
        const byteString = atob(parts[1]);
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        return new Blob([ab], { type: contentType });
      }
    }

    return null;
  },

  /**
   * Delete all candidate documents from Supabase Storage
   */
  deleteCandidateDocuments: async (app: AdmissionApplication): Promise<void> => {
    try {
      const pathsToDelete: string[] = [];

      if (app.attachedFiles && app.attachedFiles.length > 0) {
        app.attachedFiles.forEach(f => {
          if (f.storagePath) {
            pathsToDelete.push(f.storagePath);
          }
        });
      }

      // Also list files under admissions/{app.id}/ folder if any
      const { data: listData } = await supabase.storage
        .from(BUCKET_NAME)
        .list(`admissions/${app.id}`);

      if (listData && listData.length > 0) {
        listData.forEach(item => {
          pathsToDelete.push(`admissions/${app.id}/${item.name}`);
        });
      }

      if (pathsToDelete.length > 0) {
        const uniquePaths = Array.from(new Set(pathsToDelete));
        await supabase.storage.from(BUCKET_NAME).remove(uniquePaths);
      }
    } catch (err) {
      console.error('Error deleting candidate documents from Supabase Storage:', err);
    }
  },

  /**
   * Clear all documents in storage for admissions reset
   */
  deleteAllStorageFiles: async (): Promise<void> => {
    try {
      const { data: rootList } = await supabase.storage.from(BUCKET_NAME).list('admissions');
      if (rootList && rootList.length > 0) {
        for (const folder of rootList) {
          const { data: fileList } = await supabase.storage.from(BUCKET_NAME).list(`admissions/${folder.name}`);
          if (fileList && fileList.length > 0) {
            const filesToRemove = fileList.map(f => `admissions/${folder.name}/${f.name}`);
            await supabase.storage.from(BUCKET_NAME).remove(filesToRemove);
          }
        }
      }
    } catch (err) {
      console.error('Error clearing storage bucket:', err);
    }
  }
};
