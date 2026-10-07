// src/App.tsx
import React, { useEffect, useMemo, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';

import { EdgConfigProvider, MainLayout, MobileMenu, ToastProvider, ErrorBoundary, initializeFromStorage } from '@edg/ui';
import {
  initializeAuth,
  LoginPage,
  ForgotPasswordPage,
  ResetPasswordPage,
  ChangePasswordPage,
  ProfilePage,
  PrivateRoute,
  UserMenu,
  useAuth,
} from '@edg/auth';

import store from './app/store';
import { EDG_CONFIG, MODULE_MANIFESTS, ROUTES, getModules } from './config';
import { MyModulesProvider, ModuleRoutes, useMyModules } from './core/modules';
import { moduleImages } from './assets/moduli';
import { Dashboard } from './pages';

const NotFound = lazy(() => import('./pages/NotFound'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const SupportPage = lazy(() => import('./pages/SupportPage'));


/** Inizializza tema e sessione una volta sola all'avvio. */
const AppInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    store.dispatch(initializeFromStorage());
    store.dispatch(initializeAuth());
  }, []);

  return <>{children}</>;
};

/**
 * Ricalcola il menu dai moduli che l'utente può aprire (JWT + permessi) e dal
 * catalogo (titolo del modulo nell'header). Un solo punto di collegamento fra
 * autenticazione, moduli e configurazione del design system.
 */
const AppConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { hasModule, hasPermission, permissions } = useAuth();
  const { byKey } = useMyModules();
  const config = useMemo(
    () => ({
      ...EDG_CONFIG,
      modules: getModules({ hasModule, hasPermission, permissions, myModules: byKey, images: moduleImages }),
    }),
    [hasModule, hasPermission, permissions, byKey]
  );
  return <EdgConfigProvider config={config}>{children}</EdgConfigProvider>;
};

const PageLoadingFallback: React.FC = () => (
  <div className='flex items-center justify-center min-h-[60vh]'>
    <div className='text-center space-y-4'>
      <div className='inline-flex items-center justify-center'>
        <div className='w-12 h-12 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin' />
      </div>
      <p className='text-text-secondary text-sm'>Caricamento pagina...</p>
    </div>
  </div>
);

const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
  console.error('Application error:', error.message);
  if (import.meta.env.DEV && errorInfo.componentStack) {
    console.error('Component Stack:', errorInfo.componentStack);
  }
};

const App: React.FC = () => {
  return (
    <ErrorBoundary onError={handleError}>
      <ToastProvider>
        <Provider store={store}>
          {/* Moduli dell'utente, poi la configurazione del design system che ne dipende */}
          <MyModulesProvider>
            <AppConfigProvider>
              <AppInitializer>
                <Router>
                  <Suspense fallback={<PageLoadingFallback />}>
                    <Routes>
                      {/* Pagine pubbliche, fuori dal layout */}
                      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
                      <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
                      <Route path={ROUTES.RESET_PASSWORD} element={<ResetPasswordPage />} />

                      {/* Tutto il resto dentro il layout */}
                      <Route
                        path='*'
                        element={
                          <div className='App'>
                            <MainLayout>
                              <Routes>
                                <Route
                                  path={ROUTES.HOME}
                                  element={
                                    <PrivateRoute>
                                      <Dashboard />
                                    </PrivateRoute>
                                  }
                                />
                                {/* Un ramo per modulo: le sue pagine stanno nel manifest */}
                                {MODULE_MANIFESTS.map(manifest => (
                                  <Route
                                    key={manifest.key}
                                    path={`${manifest.basePath}/*`}
                                    element={
                                      <PrivateRoute>
                                        <ModuleRoutes manifest={manifest} homePath={ROUTES.HOME} />
                                      </PrivateRoute>
                                    }
                                  />
                                ))}
                                <Route
                                  path={ROUTES.CHANGE_PASSWORD}
                                  element={
                                    <PrivateRoute>
                                      <ChangePasswordPage />
                                    </PrivateRoute>
                                  }
                                />
                                <Route
                                  path={ROUTES.PROFILE}
                                  element={
                                    <PrivateRoute>
                                      <ProfilePage />
                                    </PrivateRoute>
                                  }
                                />
                                <Route
                                  path={ROUTES.TERMS}
                                  element={
                                    <PrivateRoute>
                                      <TermsPage />
                                    </PrivateRoute>
                                  }
                                />
                                <Route
                                  path={ROUTES.SUPPORT}
                                  element={
                                    <PrivateRoute>
                                      <SupportPage />
                                    </PrivateRoute>
                                  }
                                />
                                <Route path={ROUTES.NOT_FOUND} element={<NotFound />} />
                                <Route path='*' element={<NotFound />} />
                              </Routes>
                            </MainLayout>

                            <UserMenu />
                            <MobileMenu />
                          </div>
                        }
                      />
                    </Routes>
                  </Suspense>
                </Router>
              </AppInitializer>
            </AppConfigProvider>
          </MyModulesProvider>
        </Provider>
      </ToastProvider>
    </ErrorBoundary>
  );
};

export default App;
