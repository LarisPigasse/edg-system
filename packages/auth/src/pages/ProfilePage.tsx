// src/features/auth/pages/ProfilePage.tsx

/**
 * ORCHESTRATION LAYER - Modulo Auth
 *
 * Pagina "Il mio profilo": mostra le informazioni dell'utente connesso —
 * anagrafica, ruolo, permessi e moduli attivi (ADR009).
 * Protetta - accessibile solo se autenticato. Sola lettura: le azioni che
 * modificano l'account (es. cambio password) restano nelle loro pagine dedicate.
 *
 * @example
 * ```tsx
 * // In App.tsx routing
 * <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
 * ```
 */

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge, UserAvatar, useEdgConfig } from '@edg/ui';
import { useAuth } from '../hooks';
import type { AccountType } from '../types';

// ============================================================================
// COSTANTI
// ============================================================================

/** Etichette leggibili per i tipi di account (AccountType del backend). */
const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  operatore: 'Operatore',
  partner: 'Partner',
  cliente: 'Cliente',
  agente: 'Agente',
};

/** Un tenant/permesso con questo valore ha accesso completo (wildcard, ADR009). */
const WILDCARD = '*';

// ============================================================================
// COMPONENT
// ============================================================================

export const ProfilePage: React.FC = () => {
  const { routes } = useEdgConfig();
  const navigate = useNavigate();
  const { isAuthenticated, initializing, account, getUserInitials, getDisplayName } = useAuth();

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

  // Se non autenticato o senza dati account, non mostrare nulla (useEffect farà redirect)
  if (!isAuthenticated || !account) {
    return null;
  }

  const hasFullAccess = (list: string[]) => list.includes(WILDCARD);

  return (
    <div className='relative p-4'>
      {/* Il velo sullo sfondo lo disegna già MainLayout (pagina non-home): niente da ripetere qui. */}

      {/* Container principale */}
      <div className='max-w-2xl mx-auto'>
        {/* Titolo e descrizione - CENTRATO */}
        <div className='mb-8 text-center'>
          <h1 className='text-4xl font-bold text-text-title mb-2'>Il mio profilo</h1>
          <p className='text-text-secondary'>Le informazioni associate al tuo account.</p>
        </div>

        {/* Card */}
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

          {/* Header utente */}
          <div className='flex items-center gap-4 mb-6 pb-6 border-b border-border-default'>
            <UserAvatar initials={getUserInitials()} size='lg' variant='primary' />
            <div className='min-w-0'>
              <p className='text-xl font-semibold text-text-primary truncate'>{getDisplayName()}</p>
              <p className='text-text-secondary text-sm truncate'>{account.email}</p>
            </div>
          </div>

          {/* Sezione Account */}
          <section className='mb-6'>
            <h2 className='text-xs font-semibold text-text-secondary uppercase tracking-wide mb-3'>Account</h2>
            <dl className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <div>
                <dt className='text-xs text-text-secondary mb-0.5'>Tipo account</dt>
                <dd className='text-text-primary font-medium'>
                  {ACCOUNT_TYPE_LABELS[account.accountType] ?? account.accountType}
                </dd>
              </div>
              <div>
                <dt className='text-xs text-text-secondary mb-0.5'>Ruolo</dt>
                <dd className='text-text-primary font-medium'>{account.roleName ?? '—'}</dd>
              </div>
              <div className='sm:col-span-2'>
                <dt className='text-xs text-text-secondary mb-0.5'>Azienda / Tenant</dt>
                <dd className='text-text-primary font-medium'>{account.tenantName ?? `Tenant #${account.tenantId}`}</dd>
              </div>
            </dl>
          </section>

          {/* Sezione Permessi */}
          <section className='mb-6'>
            <h2 className='text-xs font-semibold text-text-secondary uppercase tracking-wide mb-3'>Permessi</h2>
            {hasFullAccess(account.permissions) ? (
              <Badge variant='primary'>Accesso completo</Badge>
            ) : account.permissions.length === 0 ? (
              <p className='text-text-secondary text-sm'>Nessun permesso assegnato.</p>
            ) : (
              <div className='flex flex-wrap gap-2'>
                {account.permissions.map(permission => (
                  <Badge key={permission} variant='default'>
                    {permission}
                  </Badge>
                ))}
              </div>
            )}
          </section>

          {/* Sezione Moduli attivi (ADR009) */}
          <section>
            <h2 className='text-xs font-semibold text-text-secondary uppercase tracking-wide mb-3'>Moduli attivi</h2>
            {hasFullAccess(account.modules) ? (
              <Badge variant='info'>Tutti i moduli disponibili</Badge>
            ) : account.modules.length === 0 ? (
              <p className='text-text-secondary text-sm'>Nessun modulo attivo per il tuo tenant.</p>
            ) : (
              <div className='flex flex-wrap gap-2'>
                {account.modules.map(module => (
                  <Badge key={module} variant='info'>
                    {module}
                  </Badge>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
