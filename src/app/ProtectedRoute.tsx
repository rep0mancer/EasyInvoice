import { Navigate, Outlet } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary/80">
          EasyInvoice
        </p>
        <h1 className="mt-4 text-3xl font-heading font-bold">Connecting to your workspace</h1>
        <p className="mt-3 text-sm text-slate-300">
          Syncing the authenticated session and tenant data from the server.
        </p>
      </div>
    </div>
  );
}

export function ProtectedRoute() {
  const authStatus = useAppStore(state => state.authStatus);
  const isInitializing = useAppStore(state => state.isInitializing);

  if (authStatus === 'checking' || isInitializing) {
    return <LoadingScreen />;
  }

  if (authStatus !== 'authenticated') {
    return <Navigate to="/auth" replace />;
  }

  return <Outlet />;
}

export function AuthRoute() {
  const authStatus = useAppStore(state => state.authStatus);
  const isInitializing = useAppStore(state => state.isInitializing);

  if (authStatus === 'checking' || isInitializing) {
    return <LoadingScreen />;
  }

  if (authStatus === 'authenticated') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
