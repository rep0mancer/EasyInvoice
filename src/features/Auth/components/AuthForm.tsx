import { FormEvent, useState } from 'react';
import { AuthCredentials, RegisterCredentials } from '../../../types';

interface AuthFormProps {
  mode: 'login' | 'register';
  isSubmitting: boolean;
  errorMessage: string | null;
  onSubmit: (payload: AuthCredentials | RegisterCredentials) => Promise<void>;
  onModeChange: (mode: 'login' | 'register') => void;
}

export function AuthForm({
  mode,
  isSubmitting,
  errorMessage,
  onSubmit,
  onModeChange,
}: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (mode === 'register') {
      await onSubmit({ email, password, companyName });
      return;
    }

    await onSubmit({ email, password });
  }

  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex gap-2 rounded-2xl bg-slate-100 p-1">
        <button
          type="button"
          onClick={() => onModeChange('login')}
          className={`flex-1 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
            mode === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
          }`}
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={() => onModeChange('register')}
          className={`flex-1 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
            mode === 'register' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
          }`}
        >
          Create account
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {mode === 'register' && (
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Company name</label>
            <input
              type="text"
              value={companyName}
              onChange={event => setCompanyName(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Example GmbH"
              required
            />
          </div>
        )}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={event => setEmail(event.target.value)}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="you@company.com"
            required
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
          <input
            type="password"
            value={password}
            onChange={event => setPassword(event.target.value)}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="At least 8 characters"
            required
            minLength={8}
          />
        </div>

        {errorMessage && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-2xl bg-primary px-4 py-4 text-sm font-semibold text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting
            ? 'Submitting...'
            : mode === 'login'
              ? 'Sign in'
              : 'Create account'}
        </button>
      </form>
    </div>
  );
}
