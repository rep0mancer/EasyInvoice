import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { appRouter } from './app/router';
import { useAppStore } from './store/useAppStore';

function App() {
  const initializeApp = useAppStore(state => state.initializeApp);

  useEffect(() => {
    void initializeApp();
  }, [initializeApp]);

  return <RouterProvider router={appRouter} />;
}

export default App;
