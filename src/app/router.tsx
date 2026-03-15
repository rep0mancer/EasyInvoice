import { Navigate, createBrowserRouter } from 'react-router-dom';
import { AuthRoute, ProtectedRoute } from './ProtectedRoute';
import { AppLayout } from '../components/layout/AppLayout';
import { AuthPage } from '../features/Auth/pages/AuthPage';
import { ClientManagerPage } from '../features/ClientManager/pages/ClientManagerPage';
import { DashboardPage } from '../features/Dashboard/pages/DashboardPage';
import { InvoiceBuilderPage } from '../features/InvoiceBuilder/pages/InvoiceBuilderPage';
import { SettingsPage } from '../features/Settings/pages/SettingsPage';

export const appRouter = createBrowserRouter([
  {
    element: <AuthRoute />,
    children: [
      {
        path: '/auth',
        element: <AuthPage />,
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/',
        element: <AppLayout />,
        children: [
          {
            index: true,
            element: <DashboardPage />,
          },
          {
            path: 'invoices/new',
            element: <InvoiceBuilderPage />,
          },
          {
            path: 'clients',
            element: <ClientManagerPage />,
          },
          {
            path: 'settings',
            element: <SettingsPage />,
          },
          {
            path: '*',
            element: <Navigate to="/" replace />,
          },
        ],
      },
    ],
  },
]);
