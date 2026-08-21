import React, { useState, useEffect } from 'react';
import { AdmissionEnquirySection } from '../../../types';
import { CheckCircle2, Save, Phone, Mail, MapPin, Clock, MessageSquare } from 'lucide-react';

interface AdmissionEnquiryManagerProps {
  data: AdmissionEnquirySection;
  onSave: (updated: AdmissionEnquirySection) => Promise<void>;
}

export const AdmissionEnquiryManager: React.FC<AdmissionEnquiryManagerProps> = ({ data, onSave }) => {
  const [formData, setFormData] = useState<AdmissionEnquirySection>(data || {});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (data) {
      setFormData(data);
    }
  }, [data]);

  const handleFieldChange = (field: keyof AdmissionEnquirySection, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(formData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error('AdmissionEnquiry save error:', err);
      alert(`Failed to save admission enquiry: ${err?.message || err}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header & Active Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
        <div className="flex items-center gap-2">
          <Phone className="w-5 h-5 text-amber-600" />
          <h3 className="font-bold text-slate-900 text-sm font-serif">Admission Counseling & Enquiry Cell</h3>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => handleFieldChange('isActive', e.target.checked)}
              className="w-4 h-4 rounded text-[#0A2342] focus:ring-amber-500"
            />
            <span>Active in Public Sidebar</span>
          </label>
          <button
            type="submit"
            disabled={isSaving}
            className="bg-[#0A2342] hover:bg-slate-900 text-amber-400 font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 shadow transition-all disabled:opacity-50"
          >
            {saveSuccess ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Save className="w-4 h-4" />}
            <span>{isSaving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* Main Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1 md:col-span-2">
          <label className="text-xs font-bold text-slate-700">Section Main Heading</label>
          <input
            type="text"
            value={formData.heading || ''}
            onChange={(e) => handleFieldChange('heading', e.target.value)}
            className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs outline-none"
          />
        </div>

        <div className="space-y-1 md:col-span-2">
          <label className="text-xs font-bold text-slate-700">Guidance & Counseling Description</label>
          <textarea
            rows={2}
            value={formData.description || ''}
            onChange={(e) => handleFieldChange('description', e.target.value)}
            className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-amber-600" /> Helpline Numbers
          </label>
          <input
            type="text"
            value={formData.phoneNumbers || ''}
            onChange={(e) => handleFieldChange('phoneNumbers', e.target.value)}
            placeholder="+91 8625869560 / +91 9422880000"
            className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-amber-600" /> Official Admissions Email
          </label>
          <input
            type="email"
            value={formData.email || ''}
            onChange={(e) => handleFieldChange('email', e.target.value)}
            placeholder="admissions@lsscdt.edu.in"
            className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs outline-none"
          />
        </div>

        <div className="space-y-1 md:col-span-2">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-amber-600" /> Campus Admission Office Address
          </label>
          <textarea
            rows={2}
            value={formData.officeAddress || ''}
            onChange={(e) => handleFieldChange('officeAddress', e.target.value)}
            className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-600" /> Working & Counseling Hours
          </label>
          <input
            type="text"
            value={formData.workingHours || ''}
            onChange={(e) => handleFieldChange('workingHours', e.target.value)}
            placeholder="Monday to Saturday: 9:30 AM to 5:30 PM"
            className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" /> WhatsApp Helpline Number
          </label>
          <input
            type="text"
            value={formData.whatsappNumber || ''}
            onChange={(e) => handleFieldChange('whatsappNumber', e.target.value)}
            placeholder="918625869560"
            className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs outline-none"
          />
        </div>

        <div className="space-y-1 md:col-span-2">
          <label className="text-xs font-bold text-slate-700">Direct WhatsApp Chat URL (Optional Override)</label>
          <input
            type="text"
            value={formData.whatsappLink || ''}
            onChange={(e) => handleFieldChange('whatsappLink', e.target.value)}
            placeholder="https://wa.me/918625869560?text=..."
            className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs outline-none"
          />
        </div>
      </div>
    </form>
  );
};
