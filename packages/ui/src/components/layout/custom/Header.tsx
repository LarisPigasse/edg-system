// src/core/components/layout/custom/Header.tsx
//
// Header a due righe:
//   1. logo dell'app (solo testo), indietro, HOME e i moduli principali; a
//      destra utente e azioni;
//   2. solo dentro un modulo con titolo o sottovoci: a sinistra il titolo del
//      modulo (sotto il logo), poi le sottovoci, allineate alla prima voce
//      dopo HOME, così si legge subito da quale modulo arrivano. L'allineamento
//      si misura sulla posizione reale della voce.
// L'altezza complessiva è pubblicata in `--edg-header-h` (es. per il menu
// utente). Su telefono le sottovoci restano nel menu a scomparsa; la seconda
// riga mostra solo il titolo del modulo.
// L'utente collegato (nome, entità, iniziali) arriva dalla configurazione
// dell'applicazione (EdgConfig.user, ADR081), non da props.
import React, { useLayoutEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, Settings, ArrowLeft } from '../../../utils/icons';

import { UserAvatar, Logo } from '../../info';
import NotificationBell from '../../navigation/notification-bell/NotificationBell';
import { useUISettings } from '../../../state/hooks';
import { useIsMobile } from '../../../hooks';
import { useEdgConfig } from '../../../config';
import type { EdgSubMenuItem } from '../../../config';

/** La sottovoce attiva: quella con il percorso più lungo che contiene la pagina corrente */
const sottovoceAttiva = (voci: EdgSubMenuItem[], pathname: string): EdgSubMenuItem | undefined =>
  voci
    .filter(v => pathname === v.href || pathname.startsWith(`${v.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0];

const Header: React.FC = () => {
  const { toggleSettingsMenu, toggleUserMenu, toggleMobileMenu } = useUISettings();
  const { modules, routes, getActiveModule, user, notifications } = useEdgConfig();
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();

  const activeModule = getActiveModule(location.pathname);
  const sottovoci = !isMobile ? (activeModule?.children ?? []) : [];
  const attiva = sottovoceAttiva(sottovoci, location.pathname);
  const titoloModulo = activeModule?.brand;
  const secondaRiga = sottovoci.length > 0 || !!titoloModulo;

  // Determina se siamo sulla Home
  const isHome = location.pathname === '/' || location.pathname === routes.home;

  const headerRef = useRef<HTMLElement>(null);
  const rigaRef = useRef<HTMLDivElement>(null);
  const primaVoceRef = useRef<HTMLAnchorElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const [rientro, setRientro] = useState(0);

  // Rientro delle sottovoci (fino alla prima voce dopo HOME, misurato dal
  // bordo del contenuto) e altezza dell'header in --edg-header-h; si
  // aggiornano quando cambiano le misure.
  useLayoutEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    const root = document.documentElement;
    const misura = () => {
      root.style.setProperty('--edg-header-h', `${header.offsetHeight}px`);
      const riga = rigaRef.current;
      const voce = primaVoceRef.current;
      setRientro(riga && voce ? Math.round(voce.getBoundingClientRect().left - riga.getBoundingClientRect().left) : 0);
    };
    misura();
    const osserva = new ResizeObserver(misura);
    osserva.observe(header);
    // il logo (titolo del modulo, a volte un'immagine) sposta la barretta quando cambia larghezza
    if (logoRef.current) osserva.observe(logoRef.current);
    return () => osserva.disconnect();
  }, [location.pathname, secondaRiga, isMobile]);

  const handleGoBack = () => {
    navigate(-1);
  };

  const renderDesktopNav = () => (
    <nav className='hidden md:flex items-center'>
      {/* Pulsante Torna Indietro - Prima di HOME */}
      <button
        onClick={handleGoBack}
        disabled={isHome}
        className={`p-2 rounded-lg transition-colors mr-2 ${
          isHome
            ? 'text-text-disabled cursor-not-allowed opacity-40'
            : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover'
        }`}
        title={isHome ? 'Torna indietro (disabilitato sulla home)' : 'Torna alla pagina precedente'}
        aria-label='Torna indietro'
      >
        <ArrowLeft className='w-4 h-4' />
      </button>

      {modules.map((module, index) => {
        const isCurrentModule = activeModule?.id === module.id;
        return (
          <React.Fragment key={module.id}>
            {index > 0 && <span className='mx-3 text-text-secondary'>|</span>}
            <Link
              ref={index === 1 ? primaVoceRef : undefined}
              to={module.href}
              aria-current={isCurrentModule ? 'page' : undefined}
              className={`text-sm whitespace-nowrap transition-colors ${
                isCurrentModule ? 'font-bold text-text-menu-active' : 'font-medium text-text-menu hover:text-text-menu-active'
              }`}
            >
              {module.label}
            </Link>
          </React.Fragment>
        );
      })}
    </nav>
  );

  return (
    <header ref={headerRef} className='bg-bg-primary border-b border-border-default'>
      <div className='w-full px-2 sm:px-4'>
        <div ref={rigaRef} className='flex items-center h-10'>
          {/* LEFT AREA - Logo dell'app (il titolo del modulo va nella seconda riga) */}
          <div ref={logoRef} className='shrink-0'>
            <Logo />
          </div>

          {/* NAVIGATION - Centr dopo logo */}
          <div className='ml-6'>
            {isMobile ? (
              <button
                onClick={toggleMobileMenu}
                className='p-2 rounded-lg hover:bg-bg-hover transition-colors md:hidden'
                title='Apri menu navigazione'
                aria-label='Menu navigazione'
              >
                <Menu className='w-5 h-5' />
              </button>
            ) : (
              renderDesktopNav()
            )}
          </div>

          {/* SPACER */}
          <div className='flex-1' />

          {/* RIGHT AREA - User Name + Actions */}
          <div className='flex items-center space-x-3'>
            {!isMobile && (
              <>
                {/* sotto i 1024 px lo spazio va al menu: nome e tenant restano nel menu utente */}
                {user && (
                  <div className='hidden min-w-0 max-w-64 flex-col items-end text-right leading-tight lg:flex'>
                    <span className='max-w-full truncate text-sm font-semibold text-text-primary' title={user.name}>
                      {user.name}
                    </span>
                    {user.entity && (
                      <span className='max-w-full truncate text-xs text-text-secondary' title={user.entity}>
                        {user.entity}
                      </span>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Campanella degli avvisi: solo se l'applicazione la dà (ADR091), anche su telefono */}
            {notifications && <NotificationBell {...notifications} />}

            <UserAvatar initials={user?.initials || '?'} size='md' onClick={toggleUserMenu} />

            <button
              onClick={toggleSettingsMenu}
              className='p-2 rounded-lg hover:bg-bg-hover transition-colors text-text-primary'
              title='Impostazioni app'
              aria-label='Menu impostazioni'
            >
              <Settings className='w-5 h-5' />
            </button>
          </div>
        </div>
      </div>

      {/* SECONDA RIGA - titolo del modulo sotto il logo, poi le sottovoci allineate alla prima voce dopo HOME */}
      {secondaRiga && (
        <div className='flex h-8 items-center border-t border-border-thin px-2 sm:px-4'>
          <div className='flex h-full shrink-0 items-center pr-4 leading-none' style={{ minWidth: sottovoci.length ? rientro : undefined }}>
            {titoloModulo}
          </div>
          {sottovoci.length > 0 && (
            <nav aria-label={`Menu di ${activeModule?.label ?? 'modulo'}`} className='flex h-full min-w-0 items-center gap-6 overflow-x-auto scrollbar-hide'>
              {sottovoci.map(voce => {
                const attivo = voce.id === attiva?.id;
                return (
                  <Link
                    key={voce.id}
                    to={voce.href}
                    aria-current={attivo ? 'page' : undefined}
                    className={`relative flex h-full items-center whitespace-nowrap text-sm font-medium transition-colors ${
                      attivo ? 'text-text-link' : 'text-text-primary hover:text-text-menu-active'
                    }`}
                  >
                    {voce.label}
                    {attivo && <span aria-hidden className='absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-action-primary' />}
                  </Link>
                );
              })}
            </nav>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
