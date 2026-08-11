import React, { useState } from 'react';
import { Facility } from '../types';
import { Building2, Factory, Microscope, BookOpen, Home, Trophy } from 'lucide-react';
import { InnerPageLayout, SidebarItem } from './InnerPageLayout';

interface FacilitiesProps {
  facilities: Facility[];
  onNavigateTab?: (tab: string) => void;
}

export const Facilities: React.FC<FacilitiesProps> = ({ facilities, onNavigateTab }) => {
  const [activeSidebarItem, setActiveSidebarItem] = useState<string>('all');

  const sidebarItems: SidebarItem[] = [
    { id: 'all', label: 'All Infrastructure Overview', icon: Building2 },
    { id: 'plant', label: 'Experimental Dairy Plant', icon: Factory, badge: '10K LPD' },
    { id: 'labs', label: 'Quality Control Labs', icon: Microscope },
    { id: 'library', label: 'Central Library & E-Resource', icon: BookOpen },
    { id: 'hostel', label: 'Hostel & Mess Facilities', icon: Home },
    { id: 'sports', label: 'Sports Complex & Gym', icon: Trophy },
  ];

  const filteredFacilities = (facilities || []).filter(f => {
    if (activeSidebarItem === 'all') return true;
    if (activeSidebarItem === 'plant') return f.title.toLowerCase().includes('plant') || f.title.toLowerCase().includes('processing');
    if (activeSidebarItem === 'labs') return f.title.toLowerCase().includes('lab') || f.title.toLowerCase().includes('quality');
    if (activeSidebarItem === 'library') return f.title.toLowerCase().includes('library') || f.title.toLowerCase().includes('e-resource');
    if (activeSidebarItem === 'hostel') return f.title.toLowerCase().includes('hostel') || f.title.toLowerCase().includes('mess');
    if (activeSidebarItem === 'sports') return f.title.toLowerCase().includes('sport') || f.title.toLowerCase().includes('auditorium');
    return true;
  });

  return (
    <InnerPageLayout
      title="Infrastructure & Facilities"
      categoryTag="Campus Amenities"
      subtitle="Experimental Pilot Dairy Plant, Quality Assurance Labs, Digital Library & Student Residences"
      breadcrumbPath={[
        { label: 'Home', tab: 'home' },
        { label: 'Infrastructure' },
        { label: sidebarItems.find(s => s.id === activeSidebarItem)?.label || 'All Facilities' }
      ]}
      sidebarItems={sidebarItems}
      activeItem={activeSidebarItem}
      onSelectSidebarItem={setActiveSidebarItem}
      onNavigateTab={onNavigateTab}
    >
      <div className="space-y-6">
        <div className="border-b border-slate-200 pb-4">
          <h2 className="text-2xl font-bold font-serif text-[#0A2342] flex items-center gap-2">
            <Building2 className="w-6 h-6 text-amber-600" />
            {sidebarItems.find(s => s.id === activeSidebarItem)?.label || 'Campus Infrastructure'}
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            Our 35-acre eco-friendly campus provides state-of-the-art pilot plants, testing labs & comfortable amenities.
          </p>
        </div>

        <div className="space-y-6">
          {filteredFacilities.map((fac) => (
            <div
              key={fac.id}
              className="bg-slate-50 rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col lg:flex-row gap-6 items-center"
            >
              {/* Image */}
              <div className="w-full lg:w-1/2 h-56 sm:h-64 rounded-xl overflow-hidden shadow shrink-0 border border-slate-200">
                <img
                  src={fac.image}
                  alt={fac.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Content */}
              <div className="w-full lg:w-1/2 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="bg-[#0A2342] text-amber-400 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    {fac.category} Facility
                  </span>
                </div>

                <h3 className="text-xl font-bold font-serif text-[#0A2342]">
                  {fac.title}
                </h3>

                <p className="text-slate-700 text-xs sm:text-sm leading-relaxed">
                  {fac.description}
                </p>

                {fac.features && fac.features.length > 0 && (
                  <div className="pt-2 space-y-2">
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Key Highlights</h4>
                    <div className="flex flex-wrap gap-2">
                      {fac.features.map((feat, fIdx) => (
                        <span key={fIdx} className="bg-white border border-slate-200 text-slate-800 text-xs font-semibold px-2.5 py-1 rounded-md">
                          ✓ {feat}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </InnerPageLayout>
  );
};
