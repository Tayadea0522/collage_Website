import React from 'react';
import { Facility } from '../types';

interface FacilitiesProps {
  facilities: Facility[];
}

export const Facilities: React.FC<FacilitiesProps> = ({ facilities }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-10 font-sans text-slate-800">
      
      {/* Header Banner */}
      <div className="bg-[#0A2342] text-white p-8 sm:p-12 rounded-2xl shadow border-b-4 border-[#D97706]">
        <div className="max-w-3xl space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-[#D97706] bg-amber-500/10 px-3 py-1 rounded border border-[#D97706]/30">
            Campus Infrastructure
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-serif text-white">
            World-Class Facilities & Experimental Dairy Plant
          </h1>
          <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
            Our 35-acre eco-friendly campus provides state-of-the-art pilot plants, quality testing labs, high-speed digital libraries, and comfortable student residences.
          </p>
        </div>
      </div>

      {/* Facilities Cards List */}
      <div className="space-y-8">
        {(facilities || []).map((fac, index) => (
          <div
            key={fac.id}
            className={`bg-[#F0F4F8] rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col ${
              index % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'
            } gap-8 items-center`}
          >
            {/* Image */}
            <div className="w-full lg:w-1/2 h-64 sm:h-80 rounded-2xl overflow-hidden shadow shrink-0 border border-slate-200">
              <img
                src={fac.image}
                alt={fac.title}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>

            {/* Content */}
            <div className="w-full lg:w-1/2 space-y-4">
              <div className="flex items-center gap-2">
                <span className="bg-[#0A2342] text-amber-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  {fac.category} Facility
                </span>
              </div>

              <h2 className="text-2xl font-bold font-serif text-[#0A2342]">
                {fac.title}
              </h2>

              <p className="text-slate-700 text-sm sm:text-base leading-relaxed">
                {fac.description}
              </p>

              {fac.features && fac.features.length > 0 && (
                <div className="pt-2 space-y-2">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Key Highlights</h4>
                  <div className="flex flex-wrap gap-2">
                    {fac.features.map((feat, fIdx) => (
                      <span key={fIdx} className="bg-white border border-slate-300 text-slate-800 text-xs font-semibold px-2.5 py-1 rounded-lg shadow-2xs">
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
  );
};
