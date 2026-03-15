import { LockKeyhole, Server, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { AuthForm } from '../components/AuthForm';
import { useAppStore } from '../../../store/useAppStore';
import { AuthCredentials, RegisterCredentials } from '../../../types';

export function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const login = useAppStore(state => state.login);
  const register = useAppStore(state => state.register);
  const isAuthSubmitting = useAppStore(state => state.isAuthSubmitting);
  const authError = useAppStore(state => state.authError);
  const clearAuthError = useAppStore(state => state.clearAuthError);

  async function handleSubmit(payload: AuthCredentials | RegisterCredentials) {
    clearAuthError();

    if (mode === 'register') {
      await register(payload as RegisterCredentials);
      return;
    }

    await login(payload as AuthCredentials);
  }

  function handleModeChange(nextMode: 'login' | 'register') {
    clearAuthError();
    setMode(nextMode);
  }

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10 text-white">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[2.5rem] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 shadow-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary/80">
            Secure workspace
          </p>
          <h1 className="mt-6 max-w-2xl text-5xl font-heading font-bold leading-tight">
            EasyInvoice now runs on an authenticated server-backed architecture.
          </h1>
          <p className="mt-4 max-w-2xl text-sm text-slate-300">
            Sign in to your tenant-scoped workspace and let the API own persistence, invoice sequencing,
            and business rules.
          </p>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <article className="rounded-3xl bg-white/5 p-5">
              <Server className="text-primary/90" size={22} />
              <h2 className="mt-4 text-lg font-heading font-bold">Express API</h2>
              <p className="mt-2 text-sm text-slate-300">
                CRUD flows now execute against the backend instead of `localStorage`.
              </p>
            </article>
            <article className="rounded-3xl bg-white/5 p-5">
              <ShieldCheck className="text-primary/90" size={22} />
              <h2 className="mt-4 text-lg font-heading font-bold">Tenant isolation</h2>
              <p className="mt-2 text-sm text-slate-300">
                JWT-backed auth cookies keep user data isolated at the database layer.
              </p>
            </article>
            <article className="rounded-3xl bg-white/5 p-5">
              <LockKeyhole className="text-primary/90" size={22} />
              <h2 className="mt-4 text-lg font-heading font-bold">PostgreSQL schema</h2>
              <p className="mt-2 text-sm text-slate-300">
                Users, clients, invoices, and items are enforced with Prisma models.
              </p>
            </article>
          </div>
        </section>

        <section className="flex items-center">
          <AuthForm
            mode={mode}
            isSubmitting={isAuthSubmitting}
            errorMessage={authError}
            onSubmit={handleSubmit}
            onModeChange={handleModeChange}
          />
        </section>
      </div>
    </div>
  );
}
