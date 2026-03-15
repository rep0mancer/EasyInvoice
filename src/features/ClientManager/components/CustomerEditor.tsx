import { Save, X } from 'lucide-react';
import { CustomerDraft } from '../../../types';

interface CustomerEditorProps {
  draft: CustomerDraft;
  isEditing: boolean;
  onFieldChange: <K extends keyof CustomerDraft>(field: K, value: CustomerDraft[K]) => void;
  onSave: () => Promise<void> | void;
  onCancel: () => void;
}

export function CustomerEditor({
  draft,
  isEditing,
  onFieldChange,
  onSave,
  onCancel,
}: CustomerEditorProps) {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">
        {isEditing ? 'Edit Client' : 'New Client'}
      </p>
      <h2 className="mt-2 text-3xl font-heading font-bold text-slate-900">
        {isEditing ? 'Update client details' : 'Create a reusable client record'}
      </h2>
      <div className="mt-6 space-y-4">
        <input
          type="text"
          value={draft.name}
          onChange={event => onFieldChange('name', event.target.value)}
          placeholder="Client name"
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <input
          type="text"
          value={draft.address}
          onChange={event => onFieldChange('address', event.target.value)}
          placeholder="Address"
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <input
          type="text"
          value={draft.vatId}
          onChange={event => onFieldChange('vatId', event.target.value)}
          placeholder="VAT ID (optional)"
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>
      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={() => { void onSave(); }}
          className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-primary-hover"
        >
          <Save size={16} />
          Save client
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 hover:border-primary/50 hover:text-primary"
        >
          <X size={16} />
          Clear form
        </button>
      </div>
    </div>
  );
}
