import { supabase } from '../supabaseClient';
import { AdmissionApplication } from '../types';

export const BUCKET_NAME = 'admissions';
export const PUBLIC_BUCKET_NAME = 'website_documents';

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

      // Helper to convert File to base64 Data URL as foolproof fallback
      const fileToDataUrl = (file: File): Promise<string> => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => resolve('');
          reader.readAsDataURL(file);
        });
      };

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

      // Candidates for buckets: 'popup-banners' if folder === 'banners', otherwise BUCKET_NAME ('admissions')
      const targetBuckets = folder === 'banners' ? ['popup-banners', BUCKET_NAME] : [BUCKET_NAME, 'popup-banners'];

      for (const bucket of targetBuckets) {
        try {
          const { data, error } = await supabase.storage
            .from(bucket)
            .upload(filePath, fileBody, {
              contentType,
              upsert: true
            });

          if (!error && data?.path) {
            const { data: pubData } = supabase.storage.from(bucket).getPublicUrl(data.path);
            if (pubData?.publicUrl) {
              return pubData.publicUrl;
            }
            const { data: signedData } = await supabase.storage.from(bucket).createSignedUrl(data.path, 315360000);
            if (signedData?.signedUrl) {
              return signedData.signedUrl;
            }
          }
        } catch (e) {
          // try next bucket
        }
      }

      if (typeof fileOrDataUrl !== 'string') {
        const fallbackUrl = await fileToDataUrl(fileOrDataUrl);
        if (fallbackUrl) return fallbackUrl;
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
  },

  /**
   * Upload a public website document (PDF for Downloads or Notice Attachments) to website_documents bucket
   */
  uploadWebsiteDocument: async (
    folder: 'downloads' | 'notices',
    file: File,
    onProgress?: (percent: number) => void
  ): Promise<{ storagePath: string; publicUrl: string; fileName: string; fileSize: string; error?: string }> => {
    try {
      if (!file) {
        return { storagePath: '', publicUrl: '', fileName: '', fileSize: '', error: 'No file provided' };
      }

      // Check max size: 10 MB
      const maxBytes = 10 * 1024 * 1024;
      if (file.size > maxBytes) {
        return {
          storagePath: '',
          publicUrl: '',
          fileName: file.name,
          fileSize: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
          error: 'File size exceeds maximum allowed limit of 10 MB'
        };
      }

      // Check allowed type: PDF
      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        return {
          storagePath: '',
          publicUrl: '',
          fileName: file.name,
          fileSize: (file.size / 1024).toFixed(0) + ' KB',
          error: 'Only PDF documents (.pdf) are allowed'
        };
      }

      const uniqueId = typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID().substring(0, 8)
        : Math.random().toString(36).substring(2, 10);

      const safeFileName = sanitizeFileName(file.name);
      const filePath = `${folder}/${Date.now()}_${uniqueId}_${safeFileName}`;
      const fileSizeStr = file.size > 1024 * 1024 
        ? (file.size / (1024 * 1024)).toFixed(1) + ' MB'
        : (file.size / 1024).toFixed(0) + ' KB';

      if (onProgress) onProgress(30);

      // Attempt upload to website_documents bucket first, fallback to admissions if bucket not provisioned
      let uploadBucket = PUBLIC_BUCKET_NAME;
      let { data, error } = await supabase.storage
        .from(uploadBucket)
        .upload(filePath, file, {
          contentType: 'application/pdf',
          upsert: true
        });

      if (error && (error.message?.includes('bucket not found') || error.message?.includes('not found'))) {
        console.warn('website_documents bucket not found, attempting fallback to public_assets in admissions bucket');
        uploadBucket = BUCKET_NAME;
        const fallbackPath = `website_public/${filePath}`;
        const fallbackRes = await supabase.storage
          .from(uploadBucket)
          .upload(fallbackPath, file, {
            contentType: 'application/pdf',
            upsert: true
          });
        data = fallbackRes.data;
        error = fallbackRes.error;
      }

      if (onProgress) onProgress(80);

      if (error) {
        console.error('Website document upload error:', error.message);
        return {
          storagePath: '',
          publicUrl: '',
          fileName: file.name,
          fileSize: fileSizeStr,
          error: error.message
        };
      }

      const path = data?.path || filePath;
      const { data: pubData } = supabase.storage.from(uploadBucket).getPublicUrl(path);
      let publicUrl = pubData?.publicUrl || '';

      if (!publicUrl) {
        const { data: signedData } = await supabase.storage.from(uploadBucket).createSignedUrl(path, 315360000);
        publicUrl = signedData?.signedUrl || '';
      }

      if (onProgress) onProgress(100);

      return {
        storagePath: `${uploadBucket}:${path}`,
        publicUrl,
        fileName: file.name,
        fileSize: fileSizeStr
      };
    } catch (err: any) {
      console.error('Exception in uploadWebsiteDocument:', err);
      return {
        storagePath: '',
        publicUrl: '',
        fileName: file.name,
        fileSize: '',
        error: err.message || 'Failed to upload PDF file'
      };
    }
  },

  /**
   * Delete a website document from storage
   */
  deleteWebsiteDocument: async (storagePath: string): Promise<void> => {
    if (!storagePath) return;
    try {
      let bucket = PUBLIC_BUCKET_NAME;
      let path = storagePath;
      if (storagePath.includes(':')) {
        const parts = storagePath.split(':');
        bucket = parts[0];
        path = parts[1];
      }
      await supabase.storage.from(bucket).remove([path]);
    } catch (err) {
      console.error('Error deleting website document from storage:', err);
    }
  },

  /**
   * Get public download or view URL for a website document
   */
  getWebsiteDocumentUrl: (storagePath?: string, fallbackUrl?: string): string => {
    if (fallbackUrl) return fallbackUrl;
    if (!storagePath) return '';
    if (storagePath.startsWith('http://') || storagePath.startsWith('https://')) return storagePath;

    let bucket = PUBLIC_BUCKET_NAME;
    let path = storagePath;
    if (storagePath.includes(':')) {
      const parts = storagePath.split(':');
      bucket = parts[0];
      path = parts[1];
    }
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data?.publicUrl || '';
  }
};
