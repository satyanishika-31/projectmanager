import React from 'react';
import { BrowserRouter, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ProjectProvider } from './context/ProjectContext';
import { NotificationProvider } from './context/NotificationContext';
import AppRoutes from './routes/AppRoutes';

function ReloadToHome() {
  const location = useLocation();
  const navigate = useNavigate();

  React.useEffect(() => {
    const navigation = performance.getEntriesByType('navigation')[0];

    if (navigation?.type === 'reload' && location.pathname !== '/') {
      navigate('/', { replace: true });
    }
  }, [location.pathname, navigate]);

  return null;
}

function App() {
  return (
    <BrowserRouter>
      <ReloadToHome />
      <ToastProvider>
        <AuthProvider>
          <ProjectProvider>
            <NotificationProvider>
              <AppRoutes />
            </NotificationProvider>
          </ProjectProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
