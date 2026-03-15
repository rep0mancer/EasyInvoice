import {
  Building2,
  LayoutDashboard,
  ReceiptText,
  Settings,
  Users,
} from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';

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
          </div>
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
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
      <footer className="border-t border-slate-200 bg-white/80">
        <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-slate-500">
          Structured around dedicated features, routes, and a shared Zustand store.
        </div>
      </footer>
    </div>
  );
}
