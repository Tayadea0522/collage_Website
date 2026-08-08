import { supabase } from '../supabaseClient';
import { AdmissionApplication } from '../types';

export const BUCKET_NAME = 'admissions';

const sanitizeFileName = (fileName: string): string => {
  const extension = fileName.includes('.')
    ? fileName.substring(fileName.lastIndexOf('.')).toLowerCase()
    : '';

  const baseName = fileName
    .substring(0, fileName.lastIndexOf('.') || fileName.length)
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');

  return `${baseName || 'document'}${extension}`;
};

export const supabaseStorageService = {
  /**
   * Ensure bucket existence check or instructions
   */
  getBucketName: () => BUCKET_NAME,

  /**
   * Upload a single document directly to Supabase Storage bucket
   * Path: {applicationId}/{docType}_{uniqueId}_{safeFileName}
   */
  uploadDocument: async (
    applicationId: string,
    docType: string,
    fileOrDataUrl: File | Blob | string,
    fileName: string
  ): Promise<{ storagePath: string; error?: string }> => {
    try {
      const uniqueId = typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : Math.random().toString(36).substring(2, 10);

      const safeFileName = sanitizeFileName(fileName);
      const filePath = `${applicationId}/${docType}_${uniqueId}_${safeFileName}`;

      let fileBody: File | Blob;
      let contentType = 'application/octet-stream';

      if (typeof fileOrDataUrl === 'string') {
        if (!fileOrDataUrl.startsWith('data:')) {
          return { storagePath: filePath };
        }
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
          return { storagePath: '', error: 'Invalid document file format' };
        }
      } else {
        fileBody = fileOrDataUrl;
        contentType = fileOrDataUrl.type || 'application/octet-stream';
      }

      // Upload directly to Supabase Storage
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, fileBody, {
          contentType,
          upsert: false
        });

      if (error) {
        console.error('Supabase Storage upload error:', error.message);
        return {
          storagePath: '',
          error: error.message
        };
      }

      if (!data?.path) {
        return {
          storagePath: '',
          error: 'Upload finished but no storage path was returned'
        };
      }

      return {
        storagePath: data.path
      };
    } catch (err: any) {
      console.error('Error uploading document to Supabase storage:', err);
      return {
        storagePath: '',
        error: err.message || 'Storage upload error'
      };
    }
  },

  /**
   * Upload image (File or Base64 dataUrl) to Supabase Storage bucket and return public/signed URL or dataUrl fallback
   */
  uploadImage: async (
    fileOrDataUrl: File | string,
    folder: string = 'gallery'
  ): Promise<string> => {
    try {
      let fileBody: File | Blob;
      let contentType = 'image/jpeg';
      let fileName = `img_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.jpg`;

      if (typeof fileOrDataUrl === 'string') {
        if (!fileOrDataUrl.startsWith('data:')) {
          // Already an HTTP or HTTPS URL
          return fileOrDataUrl;
        }
        const parts = fileOrDataUrl.split(';base64,');
        if (parts.length === 2) {
          const match = fileOrDataUrl.match(/data:(.*?);/);
          if (match) contentType = match[1];
          const ext = contentType.split('/')[1] || 'jpg';
          fileName = `img_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;
          const byteString = atob(parts[1]);
          const ab = new ArrayBuffer(byteString.length);
          const ia = new Uint8Array(ab);
          for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
          }
          fileBody = new Blob([ab], { type: contentType });
        } else {
          return fileOrDataUrl;
        }
      } else {
        fileBody = fileOrDataUrl;
        contentType = fileOrDataUrl.type || 'image/jpeg';
        const ext = contentType.split('/')[1] || 'jpg';
        fileName = `img_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;
      }

      const filePath = `public_assets/${folder}/${fileName}`;

      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, fileBody, {
          contentType,
          upsert: true
        });

      if (!error && data?.path) {
        const { data: pubData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(data.path);
        if (pubData?.publicUrl) {
          return pubData.publicUrl;
        }
        const { data: signedData } = await supabase.storage.from(BUCKET_NAME).createSignedUrl(data.path, 315360000);
        if (signedData?.signedUrl) {
          return signedData.signedUrl;
        }
      } else if (error) {
        console.warn('Supabase storage image upload warning:', error.message);
      }
    } catch (err: any) {
      console.warn('Supabase storage image upload exception:', err);
    }

    return typeof fileOrDataUrl === 'string' ? fileOrDataUrl : '';
  },

  /**
   * Get public URL for a storage file path
   */
  getFileUrl: (storagePath: string): string => {
    if (!storagePath) return '';
    const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(storagePath);
    return data?.publicUrl || '';
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
   * Delete uploaded files directly by array of storage paths (used for cleanup when DB insert fails)
   */
  deleteUploadedFiles: async (paths: string[]): Promise<void> => {
    if (!paths || paths.length === 0) return;
    try {
      const validPaths = paths.filter(Boolean);
      const uniquePaths = Array.from(new Set(validPaths));
      if (uniquePaths.length > 0) {
        const { error } = await supabase.storage.from(BUCKET_NAME).remove(uniquePaths);
        if (error) {
          console.error('Error cleaning up uploaded files from storage:', error.message);
        }
      }
    } catch (err) {
      console.error('Exception during storage file cleanup:', err);
    }
  },

  deleteFilesByPaths: async (paths: string[]): Promise<void> => {
    return supabaseStorageService.deleteUploadedFiles(paths);
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
