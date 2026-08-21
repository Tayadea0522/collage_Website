import React, { useState, useEffect } from 'react';
import { DocumentsRequiredSection, RequiredDocumentItem } from '../../../types';
import { supabaseStorageService } from '../../../services/supabaseStorageService';
import { Plus, Trash2, ArrowUp, ArrowDown, CheckCircle2, Save, FileText, Upload, Download, Loader2 } from 'lucide-react';

interface DocumentsRequiredManagerProps {
  data: DocumentsRequiredSection;
  onSave: (updated: DocumentsRequiredSection) => Promise<void>;
}

export const DocumentsRequiredManager: React.FC<DocumentsRequiredManagerProps> = ({ data, onSave }) => {
  const [formData, setFormData] = useState<DocumentsRequiredSection>(data || {});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [uploadingDocId, setUploadingDocId] = useState<string | null>(null);

  useEffect(() => {
    if (data) {
      setFormData(data);
    }
  }, [data]);

  // New Doc state
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newMandatory, setNewMandatory] = useState(true);

  const handleFieldChange = (field: keyof DocumentsRequiredSection, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddDocument = () => {
    if (!newName.trim()) return;
    const newDoc: RequiredDocumentItem = {
      id: `doc-${Date.now()}`,
      name: newName.trim(),
      description: newDesc.trim(),
      isMandatory: newMandatory,
      isActive: true,
      displayOrder: (formData.documents?.length || 0) + 1
    };
    setFormData(prev => ({
      ...prev,
      documents: [...(prev.documents || []), newDoc]
    }));
    setNewName('');
    setNewDesc('');
    setNewMandatory(true);
  };

  const handleRemoveDocument = (id: string) => {
    setFormData(prev => ({
      ...prev,
      documents: (prev.documents || []).filter(d => d.id !== id)
    }));
  };

  const handleMoveDocument = (index: number, direction: 'up' | 'down') => {
    const list = [...(formData.documents || [])];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;
    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;
    setFormData(prev => ({ ...prev, documents: list }));
  };

  // Upload PDF for a document to Supabase Storage
  const handlePdfUpload = async (docId: string, file: File) => {
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) {
      alert('File size exceeds 20MB limit.');
      return;
    }
    setUploadingDocId(docId);
    try {
      const uploadResult = await supabaseStorageService.uploadWebsiteDocument('downloads', file);
      if (uploadResult && (uploadResult.publicUrl || (uploadResult as any).url)) {
        const url = uploadResult.publicUrl || (uploadResult as any).url;
        setFormData(prev => ({
          ...prev,
          documents: (prev.documents || []).map(d => 
            d.id === docId ? { 
              ...d, 
              pdfUrl: url, 
              storagePath: uploadResult.storagePath,
              fileName: file.name,
              fileSize: uploadResult.fileSize || `${(file.size / (1024 * 1024)).toFixed(2)} MB`
            } : d
          )
        }));
      }
    } catch (err: any) {
      alert(`Upload failed: ${err.message || err}`);
    } finally {
      setUploadingDocId(null);
    }
  };

  const handleRemovePdf = (docId: string) => {
    setFormData(prev => ({
      ...prev,
      documents: (prev.documents || []).map(d => 
        d.id === docId ? { 
          ...d, 
          pdfUrl: undefined, 
          storagePath: undefined,
          fileName: undefined,
          fileSize: undefined
        } : d
      )
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(formData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error('DocumentsRequired save error:', err);
      alert(`Failed to save documents checklist: ${err?.message || err}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header & Active Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-amber-600" />
          <h3 className="font-bold text-slate-900 text-sm font-serif">Required Documents Checklist</h3>
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

      {/* Main Section Headings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700">Section Heading</label>
          <input
            type="text"
            value={formData.heading || ''}
            onChange={(e) => handleFieldChange('heading', e.target.value)}
            className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700">Subtitle / Instruction Notice</label>
          <input
            type="text"
            value={formData.subtitle || ''}
            onChange={(e) => handleFieldChange('subtitle', e.target.value)}
            placeholder="e.g. 1 set original + 3 sets attested photocopies"
            className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs outline-none"
          />
        </div>
      </div>

      {/* Document Items */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="font-bold text-slate-900 text-xs font-serif uppercase tracking-wide">Document Checklist Items</h4>
            <p className="text-[11px] text-slate-500">Manage individual certificates, marksheets, sample PDFs & mandatory requirements</p>
          </div>
        </div>

        {/* Existing Documents */}
        <div className="space-y-3">
          {(formData.documents || []).map((doc, idx) => (
            <div key={doc.id || idx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-2">
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-xs font-bold text-slate-500">#{idx + 1}</span>
                  <input
                    type="text"
                    value={doc.name}
                    onChange={(e) => {
                      const list = [...(formData.documents || [])];
                      list[idx] = { ...list[idx], name: e.target.value };
                      setFormData(prev => ({ ...prev, documents: list }));
                    }}
                    placeholder="Document Title"
                    className="font-bold text-xs text-slate-900 bg-white border border-slate-300 rounded px-2 py-1 flex-1"
                  />
                  <label className="flex items-center gap-1.5 text-xs text-slate-700 font-medium cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={doc.isMandatory}
                      onChange={(e) => {
                        const list = [...(formData.documents || [])];
                        list[idx] = { ...list[idx], isMandatory: e.target.checked };
                        setFormData(prev => ({ ...prev, documents: list }));
                      }}
                      className="rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span>Mandatory</span>
                  </label>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleMoveDocument(idx, 'up')}
                    disabled={idx === 0}
                    className="p-1 rounded hover:bg-slate-200 text-slate-600 disabled:opacity-30"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveDocument(idx, 'down')}
                    disabled={idx === (formData.documents?.length || 0) - 1}
                    className="p-1 rounded hover:bg-slate-200 text-slate-600 disabled:opacity-30"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveDocument(doc.id)}
                    className="p-1 rounded hover:bg-red-50 text-red-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <textarea
                rows={1}
                value={doc.description}
                onChange={(e) => {
                  const list = [...(formData.documents || [])];
                  list[idx] = { ...list[idx], description: e.target.value };
                  setFormData(prev => ({ ...prev, documents: list }));
                }}
                placeholder="Description / Issuing authority note"
                className="text-xs text-slate-700 bg-white border border-slate-300 rounded p-2 w-full outline-none"
              />

              {/* Sample PDF / Attachment Upload */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                {doc.pdfUrl ? (
                  <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg text-xs text-emerald-900">
                    <FileText className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="font-bold truncate max-w-[200px]">{doc.fileName || 'Sample Document PDF'}</span>
                    <button
                      type="button"
                      onClick={() => handleRemovePdf(doc.id)}
                      className="text-red-600 hover:text-red-800 font-bold ml-2"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer border border-slate-300 transition-colors">
                    {uploadingDocId === doc.id ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />
                        <span>Uploading PDF...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5" />
                        <span>Attach Sample / Proforma PDF</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handlePdfUpload(doc.id, file);
                      }}
                    />
                  </label>
                )}

                <input
                  type="text"
                  value={doc.externalUrl || ''}
                  onChange={(e) => {
                    const list = [...(formData.documents || [])];
                    list[idx] = { ...list[idx], externalUrl: e.target.value };
                    setFormData(prev => ({ ...prev, documents: list }));
                  }}
                  placeholder="Or External Proforma URL (https://...)"
                  className="text-xs text-slate-700 bg-white border border-slate-300 rounded px-2.5 py-1.5 flex-1 min-w-[200px] outline-none"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Add New Document Box */}
        <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2.5">
          <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5 text-amber-700" />
            <span>Add Required Document</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input
              type="text"
              placeholder="Document Title (e.g. Migration Certificate)"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="sm:col-span-2 p-2 bg-white border border-amber-300 rounded-lg text-xs outline-none"
            />
            <label className="flex items-center gap-2 p-2 bg-white border border-amber-300 rounded-lg text-xs font-bold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={newMandatory}
                onChange={(e) => setNewMandatory(e.target.checked)}
                className="rounded text-amber-600 focus:ring-amber-500"
              />
              <span>Compulsory Document</span>
            </label>
          </div>
          <input
            type="text"
            placeholder="Document description or conditions"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            className="w-full p-2 bg-white border border-amber-300 rounded-lg text-xs outline-none"
          />
          <button
            type="button"
            onClick={handleAddDocument}
            disabled={!newName.trim()}
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 disabled:opacity-50"
          >
            <Plus className="w-3.5 h-3.5" /> Add to Checklist
          </button>
        </div>
      </div>
    </form>
  );
};
