import { ChangeEvent } from 'react';
import { Save, Undo2 } from 'lucide-react';
import { BusinessProfile } from '../../../types';

interface BusinessProfileFormProps {
  form: BusinessProfile;
  hasSavedProfile: boolean;
  onFieldChange: <K extends keyof BusinessProfile>(field: K, value: BusinessProfile[K]) => void;
  onSave: () => Promise<void> | void;
  onReset: () => void;
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function BusinessProfileForm({
  form,
  hasSavedProfile,
  onFieldChange,
  onSave,
  onReset,
}: BusinessProfileFormProps) {
  async function handleLogoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const dataUrl = await readFileAsDataUrl(file);
    onFieldChange('logo', dataUrl);
  }

  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">
        Settings
      </p>
      <h2 className="mt-2 text-3xl font-heading font-bold text-slate-900">
        Business profile
      </h2>
      <p className="mt-2 text-sm text-slate-500">
        The settings feature owns profile editing while the other routes consume this data from the shared store.
      </p>

      <div className="mt-6 space-y-4">
        {form.logo && (
          <img src={form.logo} alt="Company logo preview" className="h-20 object-contain" />
        )}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Logo</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleLogoChange}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
          />
        </div>
        <input
          type="text"
          value={form.companyName}
          onChange={event => onFieldChange('companyName', event.target.value)}
          placeholder="Company name"
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <input
          type="text"
          value={form.address}
          onChange={event => onFieldChange('address', event.target.value)}
          placeholder="Address"
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <div className="grid gap-4 md:grid-cols-2">
          <input
            type="text"
            value={form.postalCode}
            onChange={event => onFieldChange('postalCode', event.target.value)}
            placeholder="Postal code"
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <input
            type="text"
            value={form.city}
            onChange={event => onFieldChange('city', event.target.value)}
            placeholder="City"
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <input
            type="text"
            value={form.country}
            onChange={event => onFieldChange('country', event.target.value)}
            placeholder="Country"
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <input
            type="text"
            value={form.vatId}
            onChange={event => onFieldChange('vatId', event.target.value)}
            placeholder="VAT ID"
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <input
            type="tel"
            value={form.phone}
            onChange={event => onFieldChange('phone', event.target.value)}
            placeholder="Phone"
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <input
            type="email"
            value={form.email}
            onChange={event => onFieldChange('email', event.target.value)}
            placeholder="Email"
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => { void onSave(); }}
          className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-primary-hover"
        >
          <Save size={16} />
          Save profile
        </button>
        {hasSavedProfile && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 hover:border-primary/50 hover:text-primary"
          >
            <Undo2 size={16} />
            Reset form
          </button>
        )}
      </div>
    </div>
  );
}
