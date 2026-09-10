// src/features/auth/pages/ChangePasswordPage.tsx

/**
 * ORCHESTRATION LAYER - Modulo Auth
 *
 * Pagina per cambiare la password dell'utente loggato.
 * Protetta - accessibile solo se autenticato.
 * Dopo il cambio riuscito, logout automatico e redirect a login.
 *
 * @example
 * ```tsx
 * // In App.tsx routing
 * <Route path="/change-password" element={<PrivateRoute><ChangePasswordPage /></PrivateRoute>} />
 * ```
 */

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChangePasswordForm } from '../components';
import { useAuth } from '../hooks';
import { useEdgConfig } from '@edg/ui';

// ============================================================================
// COMPONENT
// ============================================================================

export const ChangePasswordPage: React.FC = () => {
  const { routes } = useEdgConfig();
  const navigate = useNavigate();
  const { isAuthenticated, initializing, logout } = useAuth();

  // ============================================================================
  // EFFECTS
  // ============================================================================

  /**
   * Se l'utente non è autenticato, redirect a login.
   * Questa pagina è protetta - solo utenti loggati possono accedere.
   */
  useEffect(() => {
    if (!initializing && !isAuthenticated) {
      navigate(routes.login, { replace: true });
    }
  }, [isAuthenticated, initializing, navigate, routes.login]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  /**
   * Callback quando il cambio password ha successo.
   * 1. Logout automatico (invalida sessione)
   * 2. Redirect a login per effettuare login con nuova password
   */
  const handleChangePasswordSuccess = async () => {
    // Logout automatico
    await logout();

    // Redirect a login
    navigate(routes.login, { replace: true });
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  // Durante l'inizializzazione, mostra schermata vuota
  if (initializing) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-bg-secondary'>
        <div className='w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin' />
      </div>
    );
  }

  // Se non autenticato, non mostrare nulla (useEffect farà redirect)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className='relative p-4'>
      {/* Il velo sullo sfondo lo disegna già MainLayout (pagina non-home): niente da ripetere qui. */}

      {/* Container principale */}
      <div className='max-w-2xl mx-auto'>
        {/* Titolo e descrizione - CENTRATO */}
        <div className='mb-8 text-center'>
          <h1 className='text-4xl font-bold text-text-title mb-2'>Cambia password</h1>
          <p className='text-text-secondary'>Inserisci la password attuale e scegli una nuova password sicura.</p>
        </div>

        {/* Card form - PIÙ LARGA */}
        <div className='relative bg-bg-primary rounded-xl shadow-lg border border-border-default p-6 sm:p-8 w-full max-w-2xl mx-auto'>
          {/* Pulsante chiusura */}
          <button
            type='button'
            onClick={() => navigate(routes.home)}
            aria-label='Chiudi'
            className='absolute right-4 top-4 rounded-md p-1.5 text-text-secondary transition-colors hover:bg-bg-hover hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-action-primary'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='20'
              height='20'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            >
              <line x1='18' y1='6' x2='6' y2='18' />
              <line x1='6' y1='6' x2='18' y2='18' />
            </svg>
          </button>

          {/* Info sicurezza */}
          <div className='mb-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'>
            <p className='text-sm text-blue-900 dark:text-blue-300'>
              <span className='font-semibold'>Sicurezza:</span> Dopo il cambio password dovrai effettuare di nuovo il login.
            </p>
          </div>

          {/* Form */}
          <ChangePasswordForm onSuccess={handleChangePasswordSuccess} onCancel={() => navigate(routes.home)} />

          {/* info password */}
          {/* <div className='mb-4 mt-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800'>
            <p className='text-sm text-blue-900 dark:text-blue-300'>
              <span className='font-semibold'>Requisiti:</span> Minimo 8 caratteri, maiuscole, minuscole, numeri e caratteri
              speciali (!@#$%^&*...).
            </p>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordPage;
