import React from 'react';
import { Facility } from '../types';
import { Building2, CheckCircle2, Sparkles, ShieldCheck, Microscope, BookOpen, Home } from 'lucide-react';

interface FacilitiesProps {
  facilities: Facility[];
}

export const Facilities: React.FC<FacilitiesProps> = ({ facilities }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white p-8 sm:p-12 rounded-2xl shadow-lg border border-emerald-500/30">
        <div className="max-w-3xl space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-400/30">
            Campus Infrastructure
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-serif text-white">
            World-Class Facilities & Experimental Dairy Plant
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Our 35-acre eco-friendly campus provides state-of-the-art pilot plants, quality testing labs, high-speed digital libraries, and comfortable student residences.
          </p>
        </div>
      </div>

      {/* Facilities Cards List */}
      <div className="space-y-8">
        {facilities.map((fac, index) => (
          <div
            key={fac.id}
            className={`bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col ${
              index % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'
            } gap-8 items-center`}
          >
            {/* Image */}
            <div className="w-full lg:w-1/2 h-64 sm:h-80 rounded-2xl overflow-hidden shadow-md shrink-0 border border-slate-200">
              <img
                src={fac.image}
                alt={fac.title}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>

            {/* Content */}
            <div className="w-full lg:w-1/2 space-y-4">
              <div className="flex items-center gap-2">
                <span className="bg-amber-100 text-amber-900 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  {fac.category} Facility
                </span>
              </div>

              <h2 className="text-2xl font-bold font-serif text-slate-900">
                {fac.title}
              </h2>

              <p className="text-slate-700 text-sm sm:text-base leading-relaxed">
                {fac.description}
              </p>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">Key Equipment & Amenities:</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {fac.features.map((feat, i) => (
                    <div key={i} className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
