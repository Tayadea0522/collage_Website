import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Upload, 
  Trash2, 
  Eye, 
  Save, 
  CheckCircle2, 
  AlertTriangle, 
  Image as ImageIcon,
  Clock,
  Calendar,
  Link,
  Power,
  RefreshCw,
  Info
} from 'lucide-react';
import { PopupBanner } from '../types';
import { supabaseStorageService } from '../services/supabaseStorageService';
import { supabase } from '../supabaseClient.js';

interface PopupBannerManagerProps {
  popup: PopupBanner;
  onSave: (updated: PopupBanner) => void;
  onDelete: () => void;
  onPreview: (popup: PopupBanner) => void;
  showToast: (msg: string) => void;
}

export const PopupBannerManager: React.FC<PopupBannerManagerProps> = ({
  popup,
  onSave,
  onDelete,
  onPreview,
  showToast
}) => {
  const [isActive, setIsActive] = useState(popup.isActive);
  const [title, setTitle] = useState(popup.title || '');
  const [description, setDescription] = useState(popup.description || '');
  const [imageUrl, setImageUrl] = useState(popup.imageUrl || '');
  const [buttonText, setButtonText] = useState(popup.buttonText || '');
  const [buttonUrl, setButtonUrl] = useState(popup.buttonUrl || '');
  const [displayFrequency, setDisplayFrequency] = useState<PopupBanner['displayFrequency']>(
    popup.displayFrequency || 'once_per_session'
  );
  const [startDate, setStartDate] = useState(popup.startDate || '');
  const [endDate, setEndDate] = useState(popup.endDate || '');

  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setIsActive(popup.isActive);
    setTitle(popup.title || '');
    setDescription(popup.description || '');
    setImageUrl(popup.imageUrl || '');
    setButtonText(popup.buttonText || '');
    setButtonUrl(popup.buttonUrl || '');
    setDisplayFrequency(popup.displayFrequency || 'once_per_session');
    setStartDate(popup.startDate || '');
    setEndDate(popup.endDate || '');
    setImageError(false);
  }, [popup]);

  const handleImageFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (JPEG, PNG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB limit. Please upload a smaller image.');
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      alert('Supabase authentication session is missing. Please log in again.');
      return;
    }

    setIsUploading(true);
    setImageError(false);
    try {
      const url = await supabaseStorageService.uploadImage(file, 'banners');
      if (url) {
        setImageUrl(url);
        setImageError(false);
        showToast('Banner image uploaded successfully!');
      } else {
        alert('Failed to upload image. Please try again.');
      }
    } catch (err: any) {
      console.error('Image upload error:', err);
      alert('Error uploading image: ' + (err.message || 'Unknown error'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleImageFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFile(e.dataTransfer.files[0]);
    }
  };

  const currentConstructedPopup = (): PopupBanner => ({
    ...popup,
    isActive,
    title: title.trim(),
    description: description.trim(),
    imageUrl: imageUrl.trim(),
    buttonText: buttonText.trim(),
    buttonUrl: buttonUrl.trim(),
    displayFrequency,
    startDate,
    endDate,
    updatedAt: new Date().toISOString()
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updated = currentConstructedPopup();
      onSave(updated);
      showToast('Popup Banner settings saved successfully!');
    } catch (err) {
      console.error('Failed to save popup settings:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = () => {
    const nextState = !isActive;
    setIsActive(nextState);
    const updated = {
      ...currentConstructedPopup(),
      isActive: nextState
    };
    onSave(updated);
    showToast(nextState ? 'Popup Banner ENABLED on public website' : 'Popup Banner DISABLED');
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete and reset the Popup Banner configuration?')) {
      onDelete();
      showToast('Popup Banner configuration deleted');
    }
  };

  const handlePreviewClick = () => {
    onPreview(currentConstructedPopup());
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#0A2342] font-serif">
              Website Popup & Announcement Banner
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage automatic popup announcements for visitors on the college public website.
            </p>
          </div>
        </div>

        {/* Status Toggle Pill */}
        <div className="flex items-center gap-3 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 self-start md:self-auto">
          <span className="text-xs font-bold text-slate-700">Popup Status:</span>
          <button
            type="button"
            onClick={handleToggleStatus}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              isActive
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-300 text-slate-700 hover:bg-slate-400'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>{isActive ? 'ACTIVE (ON)' : 'DISABLED (OFF)'}</span>
          </button>
        </div>
      </div>

      {/* Main Settings Form Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 Cols): Form Fields */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* 1. Banner Image Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#0A2342] uppercase tracking-wider flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-amber-600" />
                <span>1. Banner Image</span>
              </h3>
              <span className="text-xs text-slate-400 font-medium">Recommended: 1200 x 600px (Max 5MB)</span>
            </div>

            {imageUrl && !imageError ? (
              <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900 group">
                <img 
                  src={imageUrl} 
                  alt="Popup Banner Preview" 
                  onError={() => setImageError(true)}
                  className="w-full h-48 sm:h-56 object-cover"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 p-4">
                  <label className="bg-white text-slate-900 hover:bg-slate-100 font-bold px-4 py-2 rounded-lg text-xs cursor-pointer shadow flex items-center gap-1.5 transition-colors">
                    <Upload className="w-3.5 h-3.5 text-slate-700" />
                    <span>Replace Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      disabled={isUploading}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => setImageUrl('')}
                    className="bg-red-600 text-white hover:bg-red-700 font-bold px-4 py-2 rounded-lg text-xs shadow flex items-center gap-1.5 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            ) : (
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                  isDragging 
                    ? 'border-amber-500 bg-amber-50/50' 
                    : 'border-slate-300 hover:border-slate-400 bg-slate-50'
                }`}
              >
                {isUploading ? (
                  <div className="flex flex-col items-center justify-center py-4 space-y-2">
                    <RefreshCw className="w-8 h-8 text-amber-600 animate-spin" />
                    <p className="text-xs font-bold text-slate-600">Uploading banner image to Supabase Storage...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-slate-200/80 flex items-center justify-center text-slate-500">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-700">
                        Drag and drop your banner image here, or{' '}
                        <label className="text-amber-600 hover:underline cursor-pointer">
                          browse files
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                        </label>
                      </p>
                      <p className="text-xs text-slate-400 mt-1">Supports JPG, PNG, WebP (Up to 5MB)</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 2. Text Content Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-[#0A2342] uppercase tracking-wider flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-600" />
              <span>2. Announcement Content (Optional)</span>
            </h3>

            {/* Title Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Popup Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Admissions Open 2026-27 | B.Tech Dairy Technology"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0A2342] text-sm text-slate-800"
              />
            </div>

            {/* Description Area */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Description / Message
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Applications invited for B.Tech Dairy Technology (4-Year Degree) & Direct 2nd Year Lateral Entry..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0A2342] text-sm text-slate-800"
              />
            </div>

            {/* Action Button Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Action Button Label
                </label>
                <input
                  type="text"
                  value={buttonText}
                  onChange={(e) => setButtonText(e.target.value)}
                  placeholder="e.g. Apply Online Now"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0A2342] text-sm text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Action Button URL / Section Link
                </label>
                <input
                  type="text"
                  value={buttonUrl}
                  onChange={(e) => setButtonUrl(e.target.value)}
                  placeholder="e.g. #admissions or https://..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0A2342] text-sm text-slate-800"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Use <code className="bg-slate-100 px-1 rounded">#admissions</code> for online form or full link for prospectus.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column (1 Col): Display Rules & Schedule */}
        <div className="space-y-6">

          {/* 3. Display Frequency Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-[#0A2342] uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>3. Display Frequency</span>
            </h3>

            <div className="space-y-2.5">
              {[
                { 
                  id: 'once_per_session', 
                  title: 'Once per Browser Session (Default)', 
                  desc: 'Shows once when visitor opens site until tab is closed.' 
                },
                { 
                  id: 'every_visit', 
                  title: 'Every Visit', 
                  desc: 'Shows popup on every page refresh/visit.' 
                },
                { 
                  id: 'once_per_day', 
                  title: 'Once per Day', 
                  desc: 'Shows once per calendar day per visitor.' 
                }
              ].map((opt) => (
                <label 
                  key={opt.id}
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    displayFrequency === opt.id
                      ? 'border-[#0A2342] bg-amber-50/30 ring-1 ring-[#0A2342]'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="displayFrequency"
                    value={opt.id}
                    checked={displayFrequency === opt.id}
                    onChange={() => setDisplayFrequency(opt.id as any)}
                    className="mt-1 text-[#0A2342] focus:ring-[#0A2342]"
                  />
                  <div>
                    <span className="block text-xs font-bold text-slate-800">{opt.title}</span>
                    <span className="block text-[11px] text-slate-500 leading-tight mt-0.5">{opt.desc}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* 4. Schedule Dates Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-[#0A2342] uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-600" />
              <span>4. Schedule Dates (Optional)</span>
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Start Date (Show From)
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0A2342] text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  End Date (Hide After)
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0A2342] text-xs text-slate-800"
                />
              </div>

              <p className="text-[11px] text-slate-400">
                Leave dates empty to keep the popup active immediately and indefinitely.
              </p>
            </div>
          </div>

          {/* Actions Column */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#0A2342] text-amber-400 hover:bg-[#081c35] font-bold text-sm transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save & Publish Popup'}</span>
            </button>

            <button
              type="button"
              onClick={handlePreviewClick}
              className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-50 text-[#0A2342] border border-amber-300 hover:bg-amber-100 font-bold text-xs transition-colors cursor-pointer"
            >
              <Eye className="w-4 h-4 text-amber-600" />
              <span>Preview Popup Banner</span>
            </button>

            <button
              type="button"
              onClick={handleDelete}
              className="w-full flex items-center justify-center gap-2 px-5 py-2 text-red-600 hover:bg-red-50 font-semibold text-xs rounded-xl transition-colors mt-2"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete / Reset Popup</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
