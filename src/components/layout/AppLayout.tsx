import {
  Building2,
  LayoutDashboard,
  LogOut,
  ReceiptText,
  Settings,
  Users,
} from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';

const navItems = [
  {
    to: '/',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    to: '/invoices/new',
    label: 'Invoice Builder',
    icon: ReceiptText,
  },
  {
    to: '/clients',
    label: 'Client Manager',
    icon: Users,
  },
  {
    to: '/settings',
    label: 'Settings',
    icon: Settings,
  },
];

export function AppLayout() {
  const authUser = useAppStore(state => state.authUser);
  const logout = useAppStore(state => state.logout);
  const errorMessage = useAppStore(state => state.errorMessage);
  const clearError = useAppStore(state => state.clearError);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-800">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="flex items-center gap-2 text-sm font-medium uppercase tracking-[0.3em] text-primary">
              <Building2 size={16} />
              EasyInvoice.at
            </p>
            <h1 className="mt-2 text-2xl font-heading font-bold text-slate-900">
              Modular invoice operations for Austrian and German small businesses
            </h1>
            {authUser && (
              <p className="mt-2 text-sm text-slate-500">
                Signed in as {authUser.email}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-3 lg:items-end">
            <nav className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
              {navItems.map(item => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) => (
                      `flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                        isActive
                          ? 'border-primary bg-primary text-white shadow-lg shadow-primary/20'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-primary/50 hover:text-primary'
                      }`
                    )}
                  >
                    <Icon size={18} />
                    {item.label}
                  </NavLink>
                );
              })}
            </nav>
            <button
              type="button"
              onClick={() => { void logout(); }}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 hover:border-primary/50 hover:text-primary"
            >
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">
        {errorMessage && (
          <div className="mb-6 flex items-start justify-between gap-4 rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p>{errorMessage}</p>
            <button
              type="button"
              onClick={clearError}
              className="font-semibold text-red-800"
            >
              Dismiss
            </button>
          </div>
        )}
        <Outlet />
      </main>
      <footer className="border-t border-slate-200 bg-white/80">
        <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-slate-500">
          Structured around dedicated features, authenticated API routes, and a shared Zustand client store.
        </div>
      </footer>
    </div>
  );
}
