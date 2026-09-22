// src/App.tsx
import React, { useEffect, useMemo, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';

import { EdgConfigProvider, MainLayout, MobileMenu, ToastProvider, ErrorBoundary, initializeFromStorage, TableCapabilitiesProvider } from '@edg/ui';
import {
  initializeAuth,
  LoginPage,
  ForgotPasswordPage,
  ResetPasswordPage,
  ChangePasswordPage,
  ProfilePage,
  SessioneTerminataPage,
  PrivateRoute,
  UserMenu,
  useAuth,
} from '@edg/auth';

import store from './app/store';
import { EDG_CONFIG, ROUTES, getModules } from './config';
import { Dashboard } from './pages';

const NotFound = lazy(() => import('./pages/NotFound'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const SupportPage = lazy(() => import('./pages/SupportPage'));

// BASE: gestione tabelle di system-service (operatori, reparti, anagrafiche)
const TabellePage = lazy(() => import('./features/base').then(m => ({ default: m.TabellePage })));
const AnagrafichePage = lazy(() => import('./features/base').then(m => ({ default: m.AnagrafichePage })));
const OperatoriPage = lazy(() => import('./features/base').then(m => ({ default: m.OperatoriPage })));

// SISTEMA: gestione di account, permessi e tenant (ADR024) — solo root
const TenantPage = lazy(() => import('./features/sistema').then(m => ({ default: m.TenantPage })));
const AccountPage = lazy(() => import('./features/sistema').then(m => ({ default: m.AccountPage })));
const SessioniPage = lazy(() => import('./features/sistema').then(m => ({ default: m.SessioniPage })));
const RuoliPage = lazy(() => import('./features/sistema').then(m => ({ default: m.RuoliPage })));

// Strumenti di sviluppo del design system: importati da un sottopath così non
// pesano sul bundle principale, e non protetti da PrivateRoute per poterli
// aprire senza backend attivo.
const ThemePreview = lazy(() => import('@edg/ui/explorer').then(m => ({ default: m.ThemePreview })));
const Explorer = lazy(() => import('@edg/ui/explorer').then(m => ({ default: m.Explorer })));
const IconsPreview = lazy(() => import('@edg/ui/explorer').then(m => ({ default: m.IconsPreview })));

/** Inizializza tema e sessione una volta sola all'avvio. */
const AppInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    store.dispatch(initializeFromStorage());
    store.dispatch(initializeAuth());
  }, []);

  return <>{children}</>;
};

/**
 * Inietta in ogni <Table> dell'app le capacità automatiche legate
 * all'utente autenticato (oggi: "Dati tecnici" visibile solo a root) — vedi
 * TableCapabilitiesProvider in @edg/ui. Un solo punto di collegamento fra
 * lo stato di autenticazione e il design system, nessuna pagina se ne deve
 * occupare singolarmente.
 */
const AppTableCapabilities: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isRoot } = useAuth();
  return <TableCapabilitiesProvider isRoot={isRoot}>{children}</TableCapabilitiesProvider>;
};

/**
 * Ricalcola i moduli del menu in base all'utente autenticato — oggi solo
 * per SISTEMA (root-only, ADR024), stesso criterio del requireRoot() di
 * backend. Un solo punto di collegamento fra stato di autenticazione e
 * configurazione del design system, come AppTableCapabilities qui sopra.
 */
const AppConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isRoot } = useAuth();
  const config = useMemo(() => ({ ...EDG_CONFIG, modules: getModules(isRoot) }), [isRoot]);
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
          {/* Consegna al design system identità, rotte, moduli e layout */}
          <AppConfigProvider>
            <AppInitializer>
              <AppTableCapabilities>
                <Router>
                  <Suspense fallback={<PageLoadingFallback />}>
                    <Routes>
                      {/* Pagine pubbliche, fuori dal layout */}
                      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
                      <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
                      <Route path={ROUTES.RESET_PASSWORD} element={<ResetPasswordPage />} />
                      {/* Destinazione del redirect forzato di sessionGuard.ts: non protetta da
                          PrivateRoute, ci si arriva proprio perché non si è più autenticati. */}
                      <Route path={ROUTES.SESSION_ENDED} element={<SessioneTerminataPage />} />

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
                                {/* BASE */}
                                <Route
                                  path={ROUTES.BASE_TABELLE}
                                  element={
                                    <PrivateRoute>
                                      <TabellePage />
                                    </PrivateRoute>
                                  }
                                />
                                <Route
                                  path={ROUTES.BASE_ANAGRAFICHE}
                                  element={
                                    <PrivateRoute>
                                      <AnagrafichePage />
                                    </PrivateRoute>
                                  }
                                />
                                <Route
                                  path={ROUTES.BASE_OPERATORI}
                                  element={
                                    <PrivateRoute>
                                      <OperatoriPage />
                                    </PrivateRoute>
                                  }
                                />

                                {/* SISTEMA — solo root (stesso criterio del requireRoot() di backend) */}
                                <Route
                                  path={ROUTES.SISTEMA_ACCOUNT}
                                  element={
                                    <PrivateRoute requiredPermission='*'>
                                      <AccountPage />
                                    </PrivateRoute>
                                  }
                                />
                                <Route
                                  path={ROUTES.SISTEMA_TENANT}
                                  element={
                                    <PrivateRoute requiredPermission='*'>
                                      <TenantPage />
                                    </PrivateRoute>
                                  }
                                />
                                <Route
                                  path={ROUTES.SISTEMA_SESSIONI}
                                  element={
                                    <PrivateRoute requiredPermission='*'>
                                      <SessioniPage />
                                    </PrivateRoute>
                                  }
                                />
                                <Route
                                  path={ROUTES.SISTEMA_RUOLI}
                                  element={
                                    <PrivateRoute requiredPermission='*'>
                                      <RuoliPage />
                                    </PrivateRoute>
                                  }
                                />

                                {/* Design system — solo in sviluppo */}
                                {import.meta.env.DEV && (
                                  <Route path={ROUTES.DESIGN_TEMA} element={<ThemePreview />} />
                                )}
                                {import.meta.env.DEV && (
                                  <Route path={ROUTES.DESIGN_COMPONENTI} element={<Explorer />} />
                                )}
                                {import.meta.env.DEV && (
                                  <Route path={ROUTES.DESIGN_ICONE} element={<IconsPreview />} />
                                )}

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
              </AppTableCapabilities>
            </AppInitializer>
          </AppConfigProvider>
        </Provider>
      </ToastProvider>
    </ErrorBoundary>
  );
};

export default App;
