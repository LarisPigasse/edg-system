// src/core/components/layout/custom/PageBackground.tsx
import React from 'react';

import { useThemedImage } from '../../../hooks';
import { useEdgConfig } from '../../../config';

interface PageBackgroundProps {
  /**
   * Mostra il velo semitrasparente sopra l'immagine (pagine "interne", dove
   * serve leggibilità sul contenuto). `false` mostra l'immagine a piena
   * intensità, come sulla home.
   * Default: `true`.
   */
  veil?: boolean;
}

/**
 * Sfondo condiviso da ogni pagina dell'applicazione: l'immagine a tema
 * (chiaro/scuro) più, dove richiesto, un velo del colore di sfondo.
 *
 * Estratto da `MainLayout` per essere riutilizzabile anche dalle pagine che
 * vivono fuori dal layout (login, password dimenticata, reset password):
 * un solo punto che decide "come si disegna lo sfondo dell'app".
 *
 * ─── Perché due `<div>` fissi e non un `<img>` ────────────────────────────
 * L'immagine è un `background-image` su un livello `fixed inset-0`, non un
 * `<img>` nel flusso. Da qui tre conseguenze volute:
 *
 *  • copre l'intera finestra, quindi il padding del contenuto non le lascia
 *    margini attorno;
 *  • non partecipa al calcolo dell'altezza del documento, quindi non può
 *    generare barre di scorrimento per quanto sia grande;
 *  • `bg-cover` la fa adattare a qualsiasi proporzione di finestra, ritagliando
 *    il minimo indispensabile e restando centrata.
 *
 * Essendo `fixed`, la posizione di questo componente nell'albero DOM non
 * conta ai fini visivi: può comparire come primo figlio di qualunque pagina.
 */
const PageBackground: React.FC<PageBackgroundProps> = ({ veil = true }) => {
  const { layout } = useEdgConfig();
  const bgSrc = useThemedImage(layout.backgroundImage);

  return (
    <>
      <div
        aria-hidden
        className='fixed inset-0 -z-20 bg-bg-base bg-cover bg-center bg-no-repeat'
        style={{ backgroundImage: `url(${bgSrc})` }}
      />
      {veil && (
        <div
          aria-hidden
          className={`fixed inset-0 ${layout.innerPageBgZIndex} ${layout.innerPageBgColor} ${layout.innerPageBgOpacity}`}
        />
      )}
    </>
  );
};

export default PageBackground;
