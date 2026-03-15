import { Building2 } from 'lucide-react';
import { BusinessProfileForm } from '../components/BusinessProfileForm';
import { useAppStore } from '../../../store/useAppStore';

export function SettingsPage() {
  const profile = useAppStore(state => state.profile);
  const settingsForm = useAppStore(state => state.settingsForm);
  const updateSettingsField = useAppStore(state => state.updateSettingsField);
  const saveSettingsForm = useAppStore(state => state.saveSettingsForm);
  const resetSettingsForm = useAppStore(state => state.resetSettingsForm);
  const isSyncing = useAppStore(state => state.isSyncing);

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <div className="rounded-[2rem] bg-slate-900 p-8 text-white shadow-xl">
        <Building2 size={28} className="text-primary/80" />
        <h2 className="mt-6 text-4xl font-heading font-bold">
          Settings are now isolated from invoicing screens.
        </h2>
        <p className="mt-4 text-sm text-slate-300">
          Profile data is edited here and shared across the dashboard, builder, and export flows through Zustand.
        </p>
        <div className="mt-8 rounded-3xl bg-white/5 p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">
            Status
          </p>
          <p className="mt-3 text-2xl font-heading font-bold">
            {profile ? profile.companyName : 'No profile saved yet'}
          </p>
          <p className="mt-2 text-sm text-slate-300">
            {profile
              ? 'Saved profile values initialize the editable settings form.'
              : 'Save the company profile once and it becomes available throughout the app.'}
          </p>
        </div>
      </div>
      <BusinessProfileForm
        form={settingsForm}
        hasSavedProfile={Boolean(profile)}
        onFieldChange={updateSettingsField}
        onSave={() => { void saveSettingsForm(); }}
        onReset={resetSettingsForm}
      />
      {isSyncing && (
        <p className="text-sm text-slate-500 xl:col-span-2">
          Syncing business profile with the server...
        </p>
      )}
    </div>
  );
}
