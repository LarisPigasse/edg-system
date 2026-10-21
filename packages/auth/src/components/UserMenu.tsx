// src/core/components/navigation/custom/UserMenu.tsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUISettings, useEdgConfig } from '@edg/ui';
import { useAuth, useAssistenza } from '../hooks';
import { UserAvatar } from '@edg/ui';
import { User, Settings, LogOut, Lock, iconMap } from '@edg/ui';

interface UserMenuProps {
  className?: string;
}

const UserMenu: React.FC<UserMenuProps> = ({ className = '' }) => {
  const { routes } = useEdgConfig();
  const navigate = useNavigate();
  const { userMenuOpen, closeUserMenu } = useUISettings();
  const { logout, loading, account, assistenza, getUserInitials, getDisplayName } = useAuth();
  const { esci } = useAssistenza();

  // Chiudi menu con ESC key
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && userMenuOpen) {
        closeUserMenu();
      }
    };

    if (userMenuOpen) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [userMenuOpen, closeUserMenu]);

  // Handler per click su backdrop
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeUserMenu();
    }
  };

  // ============================================================================
  // HANDLER LOGOUT - Option B: Sicuro
  // Attende la risposta del backend prima di reindirizzare
  // ============================================================================
  const handleLogout = async () => {
    // ADR085: nella scheda assistita si esce dall'assistenza, non dalla sessione normale
    if (assistenza) {
      closeUserMenu();
      await esci();
      return;
    }
    try {
      // Chiama logout (attende il backend)
      await logout();

      // Dopo logout, reindirizza a login
      navigate(routes.login);
    } catch (error) {
      // Se logout fallisce, comunque reindirizza (per sicurezza)
      // Il backend potrebbe essere down, ma vogliamo logout l'utente
      console.error('Errore durante logout:', error);
      navigate(routes.login);
    }
  };

  // ============================================================================
  // HANDLER CAMBIA PASSWORD
  // ============================================================================
  const handleChangePassword = () => {
    navigate(routes.changePassword);
    closeUserMenu();
  };

  // ============================================================================
  // HANDLER IL MIO PROFILO
  // ============================================================================
  const handleProfile = () => {
    navigate(routes.profile);
    closeUserMenu();
  };

  if (!userMenuOpen) return null;

  // Dati utente dall'auth state
  const userInitials = getUserInitials();
  const userName = getDisplayName();
  const userEmail = account?.email || '';
  const roleName = account?.roleName || 'utente';
  const userRole = roleName.charAt(0).toUpperCase() + roleName.slice(1);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`
          fixed inset-0 bg-black/50 z-40 
          transition-opacity duration-300 ease-out
          ${userMenuOpen ? 'opacity-100' : 'opacity-0'}
        `}
        onClick={handleBackdropClick}
        aria-hidden='true'
      />

      {/* Dropdown Menu */}
      {/* sotto l'header, qualunque sia la sua altezza (una o due righe: --edg-header-h) */}
      <div className='fixed top-[calc(var(--edg-banner-h,0px)+var(--edg-header-h,40px)+8px)] right-4 z-50'>
        <div
          className={`
            w-max min-w-72 max-w-[min(24rem,calc(100vw-2rem))] shadow-xl rounded-lg border border-border-default bg-bg-primary transform transition-all duration-300 ease-out
            ${userMenuOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 -translate-y-2'}
            ${className}
          `}
        >
          {/* Header con Info Utente */}
          <div className='p-4 border-b border-border-default'>
            <div className='flex items-center space-x-3'>
              <UserAvatar initials={userInitials} size='lg' variant='primary' />
              <div className='flex-1 min-w-0'>
                <span className='text-text-primary font-semibold truncate block'>{userName}</span>
                {/* ADR081: menu largo quanto serve all'email (fino a 384 px), ruolo in grassetto senza icone */}
                <span className='text-text-secondary text-sm truncate block' title={userEmail}>
                  {userEmail}
                </span>
                <span className='text-text-primary text-xs font-semibold block mt-1'>{userRole}</span>
              </div>
              <button
                onClick={closeUserMenu}
                className='p-1 text-text-secondary hover:text-text-primary hover:bg-bg-hover rounded-md transition-colors'
                aria-label='Chiudi menu'
                disabled={loading}
              >
                <iconMap.close className='w-4 h-4' />
              </button>
            </div>
          </div>

          {/* Menu Items */}
          <div className='py-2'>
            {/* Profilo e password: non nella scheda assistita (ADR085), sarebbero dell'operatore */}
            {!assistenza && (
              <>
              {/* Profilo */}
              <button
                className='w-full px-4 py-3 text-left hover:bg-bg-hover transition-colors flex items-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed'
                onClick={handleProfile}
                disabled={loading}
              >
                <User className='w-4 h-4 text-text-secondary' />
                <div>
                  <span className='text-text-primary font-medium block'>Il mio profilo</span>
                  <span className='text-text-secondary text-sm block'>Dati account, ruolo e permessi</span>
                </div>
              </button>

              {/* Cambia password */}
              <button
                className='w-full px-4 py-3 text-left hover:bg-bg-hover transition-colors flex items-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed'
                onClick={handleChangePassword}
                disabled={loading}
              >
                <Lock className='w-4 h-4 text-text-secondary' />
                <div>
                  <span className='text-text-primary font-medium block'>Cambia password</span>
                  <span className='text-text-secondary text-sm block'>Aggiorna la tua password</span>
                </div>
              </button>
              </>
            )}

            {/* Preferenze */}
            <button
              className='w-full px-4 py-3 text-left flex items-center space-x-3 opacity-50 cursor-not-allowed'
              disabled
              title='Non ancora disponibile'
            >
              <Settings className='w-4 h-4 text-text-secondary' />
              <div>
                <span className='text-text-primary font-medium block'>Preferenze</span>
                <span className='text-text-secondary text-sm block'>Non ancora disponibile</span>
              </div>
            </button>

            {/* Separatore */}
            <div className='my-2 border-t border-border-default'></div>

            {/* Logout */}
            <button
              className='w-full px-4 py-3 text-left hover:bg-bg-selected dark:hover:bg-bg-selected transition-colors flex items-center space-x-3 text-red-600 dark:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed'
              onClick={handleLogout}
              disabled={loading}
            >
              <LogOut className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <div>
                <span className='font-medium text-red-600 dark:text-red-400 block'>
                  {loading ? 'Uscita in corso...' : assistenza ? "Esci dall'assistenza" : 'Logout'}
                </span>
                <span className='text-sm text-red-500 dark:text-red-500 block'>
                  {loading ? 'Attendi...' : assistenza ? 'La tua sessione in EDG Pro resta com’è' : "Esci dall'applicazione"}
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserMenu;
