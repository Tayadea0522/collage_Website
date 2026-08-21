import React, { useState, useRef } from 'react';
import { Facility, FacilityPhoto } from '../../../types';
import { storageService } from '../../../services/storageService';
import { supabaseStorageService } from '../../../services/supabaseStorageService';
import { 
  Building2, 
  Factory, 
  Microscope, 
  BookOpen, 
  Home, 
  Trophy, 
  Upload, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Eye, 
  EyeOff, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  RefreshCw, 
  Image as ImageIcon,
  Plus,
  Edit3,
  Layers,
  X,
  Maximize2
} from 'lucide-react';

interface FacilitiesCmsManagerProps {
  facilities: Facility[];
  onRefreshAll: () => void;
  onNavigateTab?: (tab: string) => void;
}

interface CategoryConfig {
  id: string;
  defaultTitle: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  description: string;
}

const CORE_CATEGORIES: CategoryConfig[] = [
  {
    id: 'fac-overview',
    defaultTitle: 'All Infrastructure Overview',
    category: 'Overview',
    icon: Building2,
    description: 'High-level campus shots, aerial views, master plan and overall architecture photos.'
  },
  {
    id: 'fac-plant',
    defaultTitle: 'Experimental Dairy Plant',
    category: 'Plant',
    icon: Factory,
    badge: '10K LPD',
    description: 'Pilot pasteurization line, homogenizers, ghee kettles, packaging & processing units.'
  },
  {
    id: 'fac-lab',
    defaultTitle: 'Quality Control Labs',
    category: 'Laboratories',
    icon: Microscope,
    description: 'FTIR spectroscopy, chemical titration benches, microbiology & research equipment.'
  },
  {
    id: 'fac-lib',
    defaultTitle: 'Central Library & E-Resource',
    category: 'Library',
    icon: BookOpen,
    description: 'Reference reading hall, e-resource terminals, journals and academic study zones.'
  },
  {
    id: 'fac-hostel',
    defaultTitle: 'Hostel & Mess Facilities',
    category: 'Hostel',
    icon: Home,
    description: 'Student residence blocks, dining mess, recreation lounges and security setups.'
  },
  {
    id: 'fac-sports',
    defaultTitle: 'Sports Complex & Gym',
    category: 'Sports',
    icon: Trophy,
    description: 'Outdoor sports grounds, indoor badminton arena, gym equipment and athletic facilities.'
  }
];

export const FacilitiesCmsManager: React.FC<FacilitiesCmsManagerProps> = ({
  facilities: initialFacilitiesProp,
  onRefreshAll,
  onNavigateTab
}) => {
  const [facilities, setFacilities] = useState<Facility[]>(() => {
    return (initialFacilitiesProp || []).map(f => {
      let photos = Array.isArray(f.photos) ? [...f.photos] : [];
      if (photos.length === 0 && f.image) {
        photos = [
          {
            id: `p-${f.id}-1`,
            url: f.image,
            title: f.title,
            caption: f.description || f.title,
            displayOrder: 1,
            isActive: true
          }
        ];
      }
      return {
        ...f,
        photos
      };
    });
  });

  const [activeCategoryId, setActiveCategoryId] = useState<string>('fac-overview');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [previewModalPhoto, setPreviewModalPhoto] = useState<FacilityPhoto | null>(null);
  const [replacingPhotoId, setReplacingPhotoId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceFileInputRef = useRef<HTMLInputElement>(null);

  // Sync state if initialFacilitiesProp changes from server refresh
  React.useEffect(() => {
    if (initialFacilitiesProp && initialFacilitiesProp.length > 0) {
      setFacilities(prev => {
        return initialFacilitiesProp.map(f => {
          let photos = Array.isArray(f.photos) ? [...f.photos] : [];
          if (photos.length === 0 && f.image) {
            photos = [
              {
                id: `p-${f.id}-1`,
                url: f.image,
                title: f.title,
                caption: f.description || f.title,
                displayOrder: 1,
                isActive: true
              }
            ];
          }
          return {
            ...f,
            photos
          };
        });
      });
    }
  }, [initialFacilitiesProp]);

  // Current active facility object
  const currentFacility = facilities.find(f => f.id === activeCategoryId) || {
    id: activeCategoryId,
    title: CORE_CATEGORIES.find(c => c.id === activeCategoryId)?.defaultTitle || 'Facility',
    category: CORE_CATEGORIES.find(c => c.id === activeCategoryId)?.category || 'Infrastructure',
    description: '',
    features: [],
    image: '',
    photos: []
  };

  const currentPhotos = (currentFacility.photos || []).sort((a, b) => (a.displayOrder || 1) - (b.displayOrder || 1));

  // Helper to update current facility
  const updateCurrentFacility = (updater: (prev: Facility) => Facility) => {
    setFacilities(prev => {
      const idx = prev.findIndex(f => f.id === activeCategoryId);
      if (idx >= 0) {
        const updated = updater(prev[idx]);
        const copy = [...prev];
        copy[idx] = updated;
        return copy;
      } else {
        const newFac = updater({
          id: activeCategoryId,
          title: CORE_CATEGORIES.find(c => c.id === activeCategoryId)?.defaultTitle || 'Infrastructure',
          category: CORE_CATEGORIES.find(c => c.id === activeCategoryId)?.category || 'Overview',
          description: '',
          features: [],
          image: '',
          photos: []
        });
        return [...prev, newFac];
      }
    });
  };

  // Upload Multiple Photos Handler
  const handleUploadFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const validFiles: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      // Validate file format
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type) && !file.name.match(/\.(jpg|jpeg|png|webp)$/i)) {
        setStatusMessage({
          type: 'error',
          text: `File "${file.name}" is not a valid format. Accepted formats: JPG, JPEG, PNG, WEBP.`
        });
        continue;
      }

      // Max size: 10MB
      if (file.size > 10 * 1024 * 1024) {
        setStatusMessage({
          type: 'error',
          text: `File "${file.name}" exceeds the 10MB size limit (${(file.size / (1024 * 1024)).toFixed(1)}MB).`
        });
        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    setIsUploading(true);
    setStatusMessage(null);

    try {
      const newUploadedPhotos: FacilityPhoto[] = [];
      const startOrder = currentPhotos.length;

      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i];
        setUploadProgress(`Uploading photo ${i + 1} of ${validFiles.length}: ${file.name}...`);

        const cloudUrl = await supabaseStorageService.uploadImage(file, 'facilities');
        if (!cloudUrl) {
          throw new Error(`Failed to upload ${file.name} to cloud storage.`);
        }

        const photoTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        newUploadedPhotos.push({
          id: `photo-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          url: cloudUrl,
          title: photoTitle,
          caption: `${currentFacility.title} - ${photoTitle}`,
          displayOrder: startOrder + i + 1,
          isActive: true,
          createdAt: new Date().toISOString()
        });
      }

      updateCurrentFacility(prev => {
        const existing = prev.photos || [];
        const combined = [...existing, ...newUploadedPhotos];
        const firstActive = combined.find(p => p.isActive !== false);
        return {
          ...prev,
          image: prev.image || (firstActive ? firstActive.url : ''),
          photos: combined
        };
      });

      setStatusMessage({
        type: 'success',
        text: `Successfully uploaded ${newUploadedPhotos.length} photo(s). Click "Save Changes" to publish to live database.`
      });
    } catch (err: any) {
      console.error('Photo upload error:', err);
      setStatusMessage({
        type: 'error',
        text: err.message || 'Error occurred while uploading photos to Supabase Storage.'
      });
    } finally {
      setIsUploading(false);
      setUploadProgress('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Replace Single Photo Handler
  const handleReplacePhoto = async (photoId: string, file: File) => {
    // Validate
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(jpg|jpeg|png|webp)$/i)) {
      setStatusMessage({
        type: 'error',
        text: `File "${file.name}" is not a valid format. Accepted formats: JPG, JPEG, PNG, WEBP.`
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setStatusMessage({
        type: 'error',
        text: `File exceeds 10MB limit (${(file.size / (1024 * 1024)).toFixed(1)}MB).`
      });
      return;
    }

    setIsUploading(true);
    setStatusMessage(null);
    setUploadProgress(`Replacing photo with ${file.name}...`);

    try {
      const cloudUrl = await supabaseStorageService.uploadImage(file, 'facilities');
      if (!cloudUrl) throw new Error('Cloud upload failed');

      updateCurrentFacility(prev => {
        const updated = (prev.photos || []).map(p => {
          if (p.id === photoId) {
            return {
              ...p,
              url: cloudUrl
            };
          }
          return p;
        });

        // Also update cover image if this photo was the cover
        let cover = prev.image;
        const targetPhoto = (prev.photos || []).find(p => p.id === photoId);
        if (targetPhoto && targetPhoto.url === prev.image) {
          cover = cloudUrl;
        }

        return {
          ...prev,
          image: cover,
          photos: updated
        };
      });

      setStatusMessage({
        type: 'success',
        text: `Photo replaced successfully. Click "Save Changes" to publish.`
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Failed to replace photo.'
      });
    } finally {
      setIsUploading(false);
      setUploadProgress('');
      setReplacingPhotoId(null);
      if (replaceFileInputRef.current) {
        replaceFileInputRef.current.value = '';
      }
    }
  };

  // Reorder Photo (Up or Down)
  const handleMovePhoto = (photoId: string, direction: 'up' | 'down') => {
    const list = [...currentPhotos];
    const index = list.findIndex(p => p.id === photoId);
    if (index < 0) return;

    if (direction === 'up' && index > 0) {
      const temp = list[index];
      list[index] = list[index - 1];
      list[index - 1] = temp;
    } else if (direction === 'down' && index < list.length - 1) {
      const temp = list[index];
      list[index] = list[index + 1];
      list[index + 1] = temp;
    }

    // Re-assign displayOrder sequentially
    const updated = list.map((p, idx) => ({ ...p, displayOrder: idx + 1 }));

    updateCurrentFacility(prev => {
      const firstActive = updated.find(p => p.isActive !== false);
      return {
        ...prev,
        image: firstActive ? firstActive.url : prev.image,
        photos: updated
      };
    });
  };

  // Toggle Photo Active / Inactive
  const handleToggleActive = (photoId: string) => {
    updateCurrentFacility(prev => {
      const updated = (prev.photos || []).map(p => {
        if (p.id === photoId) {
          return { ...p, isActive: p.isActive === false };
        }
        return p;
      });
      const firstActive = updated.find(p => p.isActive !== false);
      return {
        ...prev,
        image: firstActive ? firstActive.url : prev.image,
        photos: updated
      };
    });
  };

  // Delete Photo
  const handleDeletePhoto = (photoId: string) => {
    if (!window.confirm('Are you sure you want to delete this photo from this infrastructure category?')) {
      return;
    }

    updateCurrentFacility(prev => {
      const remaining = (prev.photos || []).filter(p => p.id !== photoId);
      const reindexed = remaining.map((p, idx) => ({ ...p, displayOrder: idx + 1 }));
      const firstActive = reindexed.find(p => p.isActive !== false);
      return {
        ...prev,
        image: firstActive ? firstActive.url : (reindexed.length > 0 ? reindexed[0].url : ''),
        photos: reindexed
      };
    });

    setStatusMessage({
      type: 'success',
      text: 'Photo removed. Remember to click "Save Changes" to commit changes to Supabase.'
    });
  };

  // Set as Main Cover Photo
  const handleSetAsCover = (photo: FacilityPhoto) => {
    updateCurrentFacility(prev => {
      const list = (prev.photos || []).filter(p => p.id !== photo.id);
      const reordered = [
        { ...photo, displayOrder: 1, isActive: true },
        ...list.map((p, idx) => ({ ...p, displayOrder: idx + 2 }))
      ];
      return {
        ...prev,
        image: photo.url,
        photos: reordered
      };
    });

    setStatusMessage({
      type: 'success',
      text: 'Photo set as primary cover! Click "Save Changes" to commit.'
    });
  };

  // Update Photo Title / Caption text
  const handleUpdatePhotoField = (photoId: string, field: 'title' | 'caption', value: string) => {
    updateCurrentFacility(prev => ({
      ...prev,
      photos: (prev.photos || []).map(p => {
        if (p.id === photoId) {
          return { ...p, [field]: value };
        }
        return p;
      })
    }));
  };

  // Save All Changes to Supabase Database
  const handleSaveAll = async () => {
    setIsSaving(true);
    setStatusMessage(null);

    try {
      // Ensure all facilities have their photos cleaned and synced
      const cleanFacilities = facilities.map(f => {
        const sortedPhotos = (f.photos || [])
          .map((p, idx) => ({
            ...p,
            displayOrder: typeof p.displayOrder === 'number' ? p.displayOrder : (idx + 1),
            isActive: p.isActive !== false
          }))
          .sort((a, b) => (a.displayOrder || 1) - (b.displayOrder || 1));

        const firstActive = sortedPhotos.find(p => p.isActive !== false);
        return {
          ...f,
          image: firstActive ? firstActive.url : (sortedPhotos.length > 0 ? sortedPhotos[0].url : f.image),
          photos: sortedPhotos
        };
      });

      const saved = await storageService.saveFacilities(cleanFacilities);
      setFacilities(saved);
      onRefreshAll();

      setStatusMessage({
        type: 'success',
        text: 'All Infrastructure & Facilities photos have been saved to Supabase! The public website is now dynamically updated.'
      });
    } catch (err: any) {
      console.error('Failed to save facilities:', err);
      setStatusMessage({
        type: 'error',
        text: err.message || 'Failed to save facilities to Supabase database.'
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hidden File Input for Replace */}
      <input
        type="file"
        ref={replaceFileInputRef}
        className="hidden"
        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
        onChange={(e) => {
          if (replacingPhotoId && e.target.files && e.target.files[0]) {
            handleReplacePhoto(replacingPhotoId, e.target.files[0]);
          }
        }}
      />

      {/* Main Header & Save Action */}
      <div className="bg-gradient-to-r from-[#0A2342] via-[#071931] to-[#0A2342] text-white p-6 sm:p-8 rounded-2xl shadow-lg border border-amber-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-400/30 flex items-center gap-1.5">
              <Building2 className="w-3 h-3 text-amber-400" /> Infrastructure CMS
            </span>
            <span className="text-xs text-slate-300 font-mono">
              Live Supabase Integration
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-serif text-white">
            Infrastructure & Facilities Photo Manager
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
            Upload, arrange, caption, replace, and manage high-resolution photos for each campus infrastructure category. All uploads are stored directly in Supabase Storage with permanent public URLs.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {onNavigateTab && (
            <button
              onClick={() => onNavigateTab('facilities')}
              className="bg-white/10 hover:bg-white/20 text-white font-semibold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 border border-white/20 transition-all"
            >
              <Eye className="w-4 h-4 text-amber-400" /> View Public Page
            </button>
          )}

          <button
            onClick={handleSaveAll}
            disabled={isSaving || isUploading}
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-lg hover:shadow-amber-500/20 transition-all disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                Saving to Supabase...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 text-slate-950" />
                Save All Changes
              </>
            )}
          </button>
        </div>
      </div>

      {/* Status Notifications */}
      {statusMessage && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between border ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
              : 'bg-rose-50 text-rose-900 border-rose-300'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-slate-400 hover:text-slate-700 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Uploading Progress Bar */}
      {isUploading && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3 text-blue-900 text-xs font-medium animate-pulse">
          <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
          <span>{uploadProgress || 'Processing photos and uploading to Supabase Storage...'}</span>
        </div>
      )}

      {/* Category Tabs / Switcher */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 pb-2 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5" /> Select Infrastructure Category to Manage
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {CORE_CATEGORIES.map((cat, idx) => {
            const Icon = cat.icon;
            const isSelected = activeCategoryId === cat.id;
            const fac = facilities.find(f => f.id === cat.id);
            const photoCount = (fac?.photos || []).length;
            const activePhotoCount = (fac?.photos || []).filter(p => p.isActive !== false).length;

            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategoryId(cat.id)}
                className={`p-3 rounded-xl text-left transition-all border flex flex-col justify-between gap-2 relative ${
                  isSelected
                    ? 'bg-[#0A2342] text-white border-[#0A2342] shadow-md ring-2 ring-amber-500/50'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className={`p-2 rounded-lg ${isSelected ? 'bg-amber-500 text-slate-950' : 'bg-white text-slate-700 shadow-sm'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    isSelected ? 'bg-white/20 text-amber-300' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {photoCount} {photoCount === 1 ? 'photo' : 'photos'}
                  </span>
                </div>

                <div>
                  <div className="text-[11px] font-bold leading-snug line-clamp-1">
                    {cat.defaultTitle}
                  </div>
                  <div className={`text-[9px] mt-0.5 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                    {activePhotoCount} active on website
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Category Details & Photo Management Area */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
        {/* Category Header & Metadata */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase bg-blue-100 text-blue-900 px-2.5 py-0.5 rounded">
                Category: {currentFacility.category || 'Infrastructure'}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                ID: {currentFacility.id}
              </span>
            </div>
            <h3 className="text-xl font-bold font-serif text-[#0A2342]">
              {currentFacility.title}
            </h3>
            <p className="text-xs text-slate-600 max-w-2xl">
              {currentFacility.description || CORE_CATEGORIES.find(c => c.id === activeCategoryId)?.description}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Upload Button */}
            <input
              type="file"
              ref={fileInputRef}
              multiple
              className="hidden"
              accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
              onChange={(e) => handleUploadFiles(e.target.files)}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="bg-[#0A2342] hover:bg-[#071931] text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow transition-all disabled:opacity-50"
            >
              <Upload className="w-4 h-4 text-amber-400" />
              Upload Photos to {currentFacility.title}
            </button>
          </div>
        </div>

        {/* Drag and Drop / Quick Upload Box */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
              handleUploadFiles(e.dataTransfer.files);
            }
          }}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 hover:border-amber-500 bg-slate-50/70 hover:bg-amber-50/30 rounded-2xl p-6 text-center transition-all cursor-pointer group"
        >
          <div className="max-w-md mx-auto space-y-2">
            <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mx-auto text-amber-600 group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-slate-950 transition-all">
              <Upload className="w-6 h-6" />
            </div>
            <div className="text-xs font-bold text-slate-800">
              Click or Drag & Drop Photos Here to Upload
            </div>
            <p className="text-[11px] text-slate-500">
              Select multiple photos at once. Supported formats: <strong>JPG, JPEG, PNG, WEBP</strong> (Max 10 MB per photo).
            </p>
          </div>
        </div>

        {/* Photos Grid & Management */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold font-serif text-[#0A2342]">
                Photos in this Category ({currentPhotos.length})
              </h4>
              <span className="text-[10px] text-slate-500 font-mono">
                Order determines public gallery display sequence
              </span>
            </div>

            {currentPhotos.length > 0 && (
              <span className="text-[11px] text-slate-500">
                Tip: Use <strong className="text-slate-700">↑ Up</strong> and <strong className="text-slate-700">↓ Down</strong> to reorder.
              </span>
            )}
          </div>

          {currentPhotos.length === 0 ? (
            <div className="bg-slate-50 rounded-2xl p-10 text-center space-y-3 border border-slate-200">
              <ImageIcon className="w-10 h-10 text-slate-400 mx-auto" />
              <div className="text-sm font-bold text-slate-700">No photos uploaded for this category yet</div>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Use the upload button above to add photos of {currentFacility.title}. They will immediately show on the public website once saved.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {currentPhotos.map((photo, index) => {
                const isCover = photo.url === currentFacility.image || index === 0;

                return (
                  <div
                    key={photo.id}
                    className={`bg-white rounded-2xl border transition-all overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md ${
                      photo.isActive === false
                        ? 'border-slate-200 opacity-60 bg-slate-50'
                        : isCover
                        ? 'border-amber-400 ring-2 ring-amber-400/20'
                        : 'border-slate-200'
                    }`}
                  >
                    {/* Thumbnail Preview with Overlays */}
                    <div className="relative h-48 bg-slate-900 group overflow-hidden">
                      <img
                        src={photo.url}
                        alt={photo.title || 'Facility Photo'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />

                      {/* Badges */}
                      <div className="absolute top-2 left-2 flex items-center gap-1.5">
                        <span className="bg-slate-950/80 backdrop-blur-sm text-amber-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded shadow">
                          #{index + 1}
                        </span>
                        {isCover && (
                          <span className="bg-amber-500 text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded shadow flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5" /> Cover Photo
                          </span>
                        )}
                      </div>

                      {/* Active / Inactive Badge */}
                      <div className="absolute top-2 right-2">
                        <button
                          onClick={() => handleToggleActive(photo.id)}
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-full shadow flex items-center gap-1 transition-all ${
                            photo.isActive !== false
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                          title="Click to toggle visibility on public site"
                        >
                          {photo.isActive !== false ? (
                            <>
                              <Eye className="w-3 h-3" /> Active
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3 h-3" /> Inactive (Hidden)
                            </>
                          )}
                        </button>
                      </div>

                      {/* Hover Actions: Preview Lightbox */}
                      <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          onClick={() => setPreviewModalPhoto(photo)}
                          className="bg-white/90 hover:bg-white text-slate-900 p-2 rounded-full shadow-lg transition-transform hover:scale-110"
                          title="Preview full image"
                        >
                          <Maximize2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Metadata & Editing Body */}
                    <div className="p-4 space-y-3 flex-1 flex flex-col justify-between bg-white">
                      <div className="space-y-2">
                        {/* Title input */}
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                            Photo Title / Name
                          </label>
                          <input
                            type="text"
                            value={photo.title || ''}
                            onChange={(e) => handleUpdatePhotoField(photo.id, 'title', e.target.value)}
                            placeholder="e.g. Processing Vat & Homogenizer"
                            className="w-full text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 bg-slate-50"
                          />
                        </div>

                        {/* Caption input */}
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                            Photo Caption / Description
                          </label>
                          <textarea
                            rows={2}
                            value={photo.caption || ''}
                            onChange={(e) => handleUpdatePhotoField(photo.id, 'caption', e.target.value)}
                            placeholder="Brief description shown in public gallery preview..."
                            className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 bg-slate-50 resize-none"
                          />
                        </div>
                      </div>

                      {/* Photo Operations Toolbar */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-1 text-xs">
                        {/* Reorder Buttons */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleMovePhoto(photo.id, 'up')}
                            disabled={index === 0}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            title="Move photo up in display order"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleMovePhoto(photo.id, 'down')}
                            disabled={index === currentPhotos.length - 1}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            title="Move photo down in display order"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1.5">
                          {!isCover && (
                            <button
                              onClick={() => handleSetAsCover(photo)}
                              className="text-[10px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 px-2 py-1 rounded border border-amber-200 transition-colors"
                              title="Set as main cover photo"
                            >
                              Make Cover
                            </button>
                          )}

                          <button
                            onClick={() => {
                              setReplacingPhotoId(photo.id);
                              replaceFileInputRef.current?.click();
                            }}
                            className="text-[10px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded border border-blue-200 transition-colors"
                            title="Replace this image with a new file"
                          >
                            Replace
                          </button>

                          <button
                            onClick={() => handleDeletePhoto(photo.id)}
                            className="text-[10px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 p-1.5 rounded border border-rose-200 transition-colors"
                            title="Delete photo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Fullscreen Photo Lightbox / Preview Modal */}
      {previewModalPhoto && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreviewModalPhoto(null)}
        >
          <div
            className="bg-slate-900 text-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-slate-700 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-amber-400">
                  {previewModalPhoto.title || currentFacility.title}
                </h4>
                <p className="text-xs text-slate-400">
                  {currentFacility.title} &bull; Photo ID: {previewModalPhoto.id}
                </p>
              </div>
              <button
                onClick={() => setPreviewModalPhoto(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-full bg-slate-800 hover:bg-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 bg-black flex items-center justify-center p-4 min-h-[300px] max-h-[60vh] overflow-hidden">
              <img
                src={previewModalPhoto.url}
                alt={previewModalPhoto.title || 'Preview'}
                className="max-h-full max-w-full object-contain rounded-lg shadow-2xl"
              />
            </div>

            <div className="p-4 bg-slate-950 border-t border-slate-800 space-y-2">
              <p className="text-xs text-slate-300">
                {previewModalPhoto.caption || 'No caption entered for this photo.'}
              </p>
              <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span className="truncate max-w-md">URL: {previewModalPhoto.url}</span>
                <span className={`px-2 py-0.5 rounded font-bold ${
                  previewModalPhoto.isActive !== false ? 'bg-emerald-950 text-emerald-400' : 'bg-slate-800 text-slate-400'
                }`}>
                  {previewModalPhoto.isActive !== false ? 'Status: Active' : 'Status: Inactive'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
