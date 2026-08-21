import React, { useState } from 'react';
import { Facility, FacilityPhoto } from '../types';
import { 
  Building2, 
  Factory, 
  Microscope, 
  BookOpen, 
  Home, 
  Trophy, 
  Maximize2, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles,
  Layers,
  CheckCircle2,
  Image as ImageIcon
} from 'lucide-react';
import { InnerPageLayout, SidebarItem } from './InnerPageLayout';

interface FacilitiesProps {
  facilities: Facility[];
  onNavigateTab?: (tab: string) => void;
}

export const Facilities: React.FC<FacilitiesProps> = ({ facilities, onNavigateTab }) => {
  const [activeSidebarItem, setActiveSidebarItem] = useState<string>('all');
  const [activeLightbox, setActiveLightbox] = useState<{
    photos: FacilityPhoto[];
    currentIndex: number;
    categoryTitle: string;
  } | null>(null);

  const sidebarItems: SidebarItem[] = [
    { id: 'all', label: 'All Infrastructure Overview', icon: Building2 },
    { id: 'plant', label: 'Experimental Dairy Plant', icon: Factory, badge: '10K LPD' },
    { id: 'labs', label: 'Quality Control Labs', icon: Microscope },
    { id: 'library', label: 'Central Library & E-Resource', icon: BookOpen },
    { id: 'hostel', label: 'Hostel & Mess Facilities', icon: Home },
    { id: 'sports', label: 'Sports Complex & Gym', icon: Trophy },
  ];

  // Helper to extract active photos from a facility
  const getActivePhotos = (fac: Facility): FacilityPhoto[] => {
    let photos: FacilityPhoto[] = [];
    if (Array.isArray(fac.photos) && fac.photos.length > 0) {
      photos = fac.photos
        .filter(p => p.isActive !== false && Boolean(p.url))
        .sort((a, b) => (a.displayOrder || 1) - (b.displayOrder || 1));
    }
    
    // Fallback if photos array is empty but cover image exists
    if (photos.length === 0 && fac.image) {
      photos = [{
        id: `p-${fac.id}-fallback`,
        url: fac.image,
        title: fac.title,
        caption: fac.description || fac.title,
        displayOrder: 1,
        isActive: true
      }];
    }
    return photos;
  };

  // Filter facilities based on selected sidebar item
  const filteredFacilities = (facilities || []).filter(f => {
    if (activeSidebarItem === 'all') return true;
    if (activeSidebarItem === 'plant') {
      return f.id === 'fac-plant' || f.category.toLowerCase().includes('plant') || f.title.toLowerCase().includes('dairy plant');
    }
    if (activeSidebarItem === 'labs') {
      return f.id === 'fac-lab' || f.category.toLowerCase().includes('lab') || f.title.toLowerCase().includes('quality');
    }
    if (activeSidebarItem === 'library') {
      return f.id === 'fac-lib' || f.category.toLowerCase().includes('lib') || f.title.toLowerCase().includes('library');
    }
    if (activeSidebarItem === 'hostel') {
      return f.id === 'fac-hostel' || f.category.toLowerCase().includes('hostel') || f.title.toLowerCase().includes('hostel');
    }
    if (activeSidebarItem === 'sports') {
      return f.id === 'fac-sports' || f.category.toLowerCase().includes('sport') || f.title.toLowerCase().includes('sports');
    }
    return true;
  });

  const openLightbox = (photos: FacilityPhoto[], index: number, categoryTitle: string) => {
    if (!photos || photos.length === 0) return;
    setActiveLightbox({
      photos,
      currentIndex: Math.max(0, Math.min(index, photos.length - 1)),
      categoryTitle
    });
  };

  const handleNextPhoto = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!activeLightbox) return;
    setActiveLightbox(prev => {
      if (!prev) return null;
      const nextIdx = (prev.currentIndex + 1) % prev.photos.length;
      return { ...prev, currentIndex: nextIdx };
    });
  };

  const handlePrevPhoto = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!activeLightbox) return;
    setActiveLightbox(prev => {
      if (!prev) return null;
      const prevIdx = (prev.currentIndex - 1 + prev.photos.length) % prev.photos.length;
      return { ...prev, currentIndex: prevIdx };
    });
  };

  // Keyboard navigation for Lightbox
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!activeLightbox) return;
      if (e.key === 'Escape') setActiveLightbox(null);
      if (e.key === 'ArrowRight') handleNextPhoto();
      if (e.key === 'ArrowLeft') handlePrevPhoto();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeLightbox]);

  return (
    <InnerPageLayout
      title="Infrastructure & Facilities"
      categoryTag="Campus & Facilities"
      subtitle="Modern Pilot Processing Plant, Accredited QC Labs, Digital Knowledge Repository & Student Hostels"
      breadcrumbPath={[
        { label: 'Home', tab: 'home' },
        { label: 'Infrastructure' },
        { label: sidebarItems.find(s => s.id === activeSidebarItem)?.label || 'All Infrastructure' }
      ]}
      sidebarItems={sidebarItems}
      activeItem={activeSidebarItem}
      onSelectSidebarItem={setActiveSidebarItem}
      onNavigateTab={onNavigateTab}
    >
      <div className="space-y-8">
        {/* Header Summary */}
        <div className="border-b border-slate-200 pb-5">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full border border-amber-300">
              Campus Infrastructure
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-serif text-[#0A2342] flex items-center gap-2">
            <Building2 className="w-7 h-7 text-amber-600 shrink-0" />
            {sidebarItems.find(s => s.id === activeSidebarItem)?.label || 'Campus Infrastructure'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-3xl leading-relaxed">
            Our 35-acre lush green campus at Malkapur houses state-of-the-art pilot dairy processing machinery, accredited testing laboratories, smart multimedia classrooms, modern student residences, and sports facilities.
          </p>
        </div>

        {/* Facilities List & Galleries */}
        <div className="space-y-10">
          {filteredFacilities.map((fac) => {
            const activePhotos = getActivePhotos(fac);

            return (
              <div
                key={fac.id}
                className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 hover:border-amber-400/40 transition-colors"
              >
                {/* Facility Header Info */}
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="bg-[#0A2342] text-amber-400 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                        {fac.category} Division
                      </span>
                      {activePhotos.length > 0 && (
                        <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <ImageIcon className="w-3 h-3 text-amber-600" />
                          {activePhotos.length} {activePhotos.length === 1 ? 'Photo' : 'Photos'}
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold font-serif text-[#0A2342]">
                    {fac.title}
                  </h3>

                  <p className="text-slate-700 text-xs sm:text-sm leading-relaxed max-w-4xl">
                    {fac.description}
                  </p>

                  {/* Highlights / Features Chips */}
                  {fac.features && fac.features.length > 0 && (
                    <div className="pt-2">
                      <div className="flex flex-wrap gap-2">
                        {fac.features.map((feat, fIdx) => (
                          <span
                            key={fIdx}
                            className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold px-3 py-1 rounded-lg flex items-center gap-1.5 shadow-sm"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> {feat}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Photo Display: Single Hero OR Multi-Photo Gallery */}
                {activePhotos.length === 0 ? (
                  <div className="bg-slate-50 rounded-xl p-8 text-center text-slate-400 text-xs border border-slate-200">
                    No active photos uploaded for this facility yet.
                  </div>
                ) : activePhotos.length === 1 ? (
                  /* Single Large Hero Photo */
                  <div
                    onClick={() => openLightbox(activePhotos, 0, fac.title)}
                    className="relative rounded-2xl overflow-hidden shadow-md group cursor-pointer border border-slate-200 bg-slate-900 h-72 sm:h-96"
                  >
                    <img
                      src={activePhotos[0].url}
                      alt={activePhotos[0].title || fac.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/10 opacity-90 group-hover:opacity-100 transition-opacity" />

                    <div className="absolute bottom-0 inset-x-0 p-4 sm:p-6 text-white space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-base sm:text-lg font-bold font-serif text-white">
                          {activePhotos[0].title || fac.title}
                        </h4>
                        <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                          <Maximize2 className="w-3.5 h-3.5" /> View Photo
                        </span>
                      </div>
                      {activePhotos[0].caption && (
                        <p className="text-xs text-slate-200 line-clamp-2">
                          {activePhotos[0].caption}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Responsive Multi-Photo Gallery Grid */
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {activePhotos.map((photo, pIdx) => (
                        <div
                          key={photo.id || pIdx}
                          onClick={() => openLightbox(activePhotos, pIdx, fac.title)}
                          className="group relative bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md hover:border-amber-400 cursor-pointer transition-all flex flex-col"
                        >
                          <div className="relative h-48 sm:h-52 overflow-hidden bg-slate-900">
                            <img
                              src={photo.url}
                              alt={photo.title || `${fac.title} photo ${pIdx + 1}`}
                              className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-slate-950/40 transition-colors" />

                            {/* View Badge */}
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <span className="bg-slate-950/80 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1 shadow">
                                <Maximize2 className="w-3 h-3 text-amber-400" /> Fullscreen
                              </span>
                            </div>

                            {/* Photo Number indicator */}
                            <div className="absolute bottom-2 left-2">
                              <span className="bg-slate-950/70 text-slate-200 text-[10px] font-mono px-2 py-0.5 rounded">
                                {pIdx + 1} of {activePhotos.length}
                              </span>
                            </div>
                          </div>

                          {/* Caption footer */}
                          <div className="p-3 bg-white space-y-1 flex-1 flex flex-col justify-between">
                            <div className="font-bold text-xs text-slate-900 line-clamp-1 group-hover:text-amber-700 transition-colors">
                              {photo.title || `${fac.title} - View ${pIdx + 1}`}
                            </div>
                            {photo.caption && (
                              <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                                {photo.caption}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* High-Resolution Public Lightbox Modal */}
      {activeLightbox && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-4 select-none"
          onClick={() => setActiveLightbox(null)}
        >
          <div
            className="relative max-w-5xl w-full max-h-[92vh] flex flex-col bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-amber-400">
                  {activeLightbox.photos[activeLightbox.currentIndex]?.title || activeLightbox.categoryTitle}
                </h4>
                <p className="text-xs text-slate-400">
                  {activeLightbox.categoryTitle} &bull; Photo {activeLightbox.currentIndex + 1} of {activeLightbox.photos.length}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                  Use ← and → arrows to navigate
                </span>
                <button
                  onClick={() => setActiveLightbox(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-full bg-slate-800 hover:bg-slate-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Image Canvas with Nav Arrows */}
            <div className="relative flex-1 bg-black flex items-center justify-center min-h-[300px] max-h-[65vh] p-2 overflow-hidden">
              <img
                src={activeLightbox.photos[activeLightbox.currentIndex]?.url}
                alt={activeLightbox.photos[activeLightbox.currentIndex]?.title || 'Infrastructure Photo'}
                className="max-h-full max-w-full object-contain rounded shadow-2xl transition-all duration-300"
              />

              {/* Prev Button */}
              {activeLightbox.photos.length > 1 && (
                <button
                  onClick={handlePrevPhoto}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-slate-950/70 hover:bg-slate-900 text-white border border-slate-700 shadow-xl backdrop-blur-sm transition-transform hover:scale-110"
                  title="Previous photo (Left Arrow)"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              )}

              {/* Next Button */}
              {activeLightbox.photos.length > 1 && (
                <button
                  onClick={handleNextPhoto}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-slate-950/70 hover:bg-slate-900 text-white border border-slate-700 shadow-xl backdrop-blur-sm transition-transform hover:scale-110"
                  title="Next photo (Right Arrow)"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              )}
            </div>

            {/* Modal Footer with Caption */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <p className="text-xs text-slate-300 max-w-3xl">
                {activeLightbox.photos[activeLightbox.currentIndex]?.caption || activeLightbox.photos[activeLightbox.currentIndex]?.title || 'Campus Infrastructure photo'}
              </p>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] font-mono text-amber-400 bg-amber-950/60 px-2.5 py-1 rounded border border-amber-700/40">
                  {activeLightbox.currentIndex + 1} / {activeLightbox.photos.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </InnerPageLayout>
  );
};
