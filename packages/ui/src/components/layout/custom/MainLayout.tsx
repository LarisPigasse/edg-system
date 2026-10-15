// src/core/components/layout/custom/MainLayout.tsx
import React, { useLayoutEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

import { Header, Footer } from '..';
import PageBackground from './PageBackground';
import { SettingsMenu } from '../../navigation';
import { useUISettings } from '../../../state/hooks';
import { useIsMobile } from '../../../hooks';
import { useEdgConfig } from '../../../config';

interface MainLayoutProps {
  children: React.ReactNode;
}

/**
 * Struttura di pagina condivisa: header, area centrale, footer.
 *
 * ─── Lo sfondo ──────────────────────────────────────────────────────────────
 * L'immagine è un `background-image` su due livelli `fixed inset-0`, non un
 * `<img>` nel flusso. Da qui tre conseguenze volute:
 *
 *  • copre l'intera finestra, quindi il padding del `<main>` (che serve al
 *    contenuto) non le lascia margini attorno;
 *  • non partecipa al calcolo dell'altezza del documento, quindi non può
 *    generare barre di scorrimento per quanto sia grande;
 *  • `bg-cover` la fa adattare a qualsiasi proporzione di finestra, ritagliando
 *    il minimo indispensabile e restando centrata.
 *
 * Sulla home l'immagine si vede piena. Sulle pagine interne le si sovrappone un
 * velo del colore di fondo, così il contenuto resta leggibile: colore, opacità
 * e z-index arrivano da `EdgConfigProvider`, un punto solo da ritoccare.
 *
 * Il disegno vero e proprio vive in `PageBackground`, condiviso anche dalle
 * pagine fuori dal layout (login, password dimenticata, reset password).
 *
 * ─── Barre fisse delle pagine ───────────────────────────────────────────────
 * Il footer del desktop resta fisso in basso: la sua altezza (0 se nascosto o
 * su mobile, dove scorre con la pagina) è pubblicata nella variabile CSS
 * `--edg-footer-h`, così una barra di azioni `sticky` di una pagina può
 * fermarsi appena sopra: `bottom-[var(--edg-footer-h,0px)]`.
 */
const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { footerVisible } = useUISettings();
  const { isHomeActive } = useEdgConfig();
  const isMobile = useIsMobile();
  const { pathname } = useLocation();

  const isHome = isHomeActive(pathname);

  const footerRef = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    const root = document.documentElement;
    const el = footerRef.current;
    const pubblica = () => root.style.setProperty('--edg-footer-h', `${el ? el.offsetHeight : 0}px`);
    pubblica();
    if (!el) return;
    const osserva = new ResizeObserver(pubblica);
    osserva.observe(el);
    return () => {
      osserva.disconnect();
      root.style.setProperty('--edg-footer-h', '0px');
    };
  }, [footerVisible, isMobile]);

  /** Immagine a tutta finestra + velo sulle pagine interne. */
  const background = <PageBackground veil={!isHome} />;

  if (isMobile) {
    return (
      <div className='min-h-screen flex flex-col relative'>
        {background}

        <Header />

        <main className='flex-1'>
          <div className='w-full px-4 sm:px-6 py-8'>{children}</div>
        </main>

        {footerVisible && <Footer showVersionInfo={true} />}

        <SettingsMenu />
      </div>
    );
  }

  return (
    <div className='min-h-full relative'>
      {background}

      <div className='grid grid-cols-1 grid-rows-[auto_1fr_auto] min-h-screen'>
        <header className='sticky top-0 z-40 col-span-full'>
          <Header />
        </header>

        {/* Nessun colore di sfondo qui: il `main` è trasparente e lascia
            vedere l'immagine. Il padding vale solo per il contenuto. */}
        <main className='min-w-0 flex flex-col px-6 py-6'>
          <div className='w-full flex-1'>{children}</div>
        </main>

        {footerVisible && (
          <footer ref={footerRef} className='sticky bottom-0 z-40 col-span-full'>
            <Footer showVersionInfo={true} />
          </footer>
        )}
      </div>

      <SettingsMenu />
    </div>
  );
};

export default MainLayout;
