// src/utils/safePortal.ts
//
// Portali "sicuri" dentro i dialog Radix (Modal, Sheet).
//
// Un dialog Radix modale mette `pointer-events: none` sul body finché è
// aperto: la pagina sotto non risponde. Un pannello disegnato con un portale
// proprio nel body (il calendario di DatePicker, l'orologio di TimePicker)
// sta fuori dal dialog e ne eredita il blocco: si vede ma non si clicca.
// Qui le due metà della soluzione, condivise:
//   - safePortalProps: sulla radice del portale, riattiva i clic e lo dichiara
//     sicuro con l'attributo data-modal-safe-portal;
//   - keepOpenOnSafeInteraction: per onInteractOutside dei dialog, non li
//     chiude se c'è un portale sicuro aperto (o un popper Radix) o se
//     l'interazione avviene in un altro dialog (un modale figlio aperto sopra);
//   - keepOpenOnSafeEscape: per onEscapeKeyDown, Esc chiude solo il portale
//     aperto (lo fa il portale stesso) e non il dialog con i dati già scritti.
import type { CSSProperties } from 'react';

/** L'attributo che dichiara un portale custom come parte del dialog aperto */
export const SAFE_PORTAL_ATTRIBUTE = 'data-modal-safe-portal';

/** Le proprietà della radice di un portale custom: attributo e clic riattivati */
export const safePortalProps = (style: CSSProperties) => ({
  'data-modal-safe-portal': 'true' as const,
  style: { ...style, pointerEvents: 'auto' as const },
});

const isSafePortalOpen = (): boolean =>
  document.querySelector(`[data-radix-popper-content-wrapper], [${SAFE_PORTAL_ATTRIBUTE}]`) !== null;

// Radix decide la chiusura per un clic fuori solo dopo il click, quando il
// portale si è già chiuso al mousedown (useClickOutside): si ricorda qui, in
// fase di cattura, se all'inizio del clic un portale sicuro era aperto. Così
// il clic che chiude il calendario non chiude anche il dialog.
let portalOpenAtPointerDown = false;
if (typeof document !== 'undefined') {
  document.addEventListener('pointerdown', () => (portalOpenAtPointerDown = isSafePortalOpen()), true);
}

type OutsideEvent = { target: EventTarget | null; preventDefault: () => void; detail?: { originalEvent?: Event } };

/** Per onInteractOutside di Modal e Sheet: resta aperto se l'interazione riguarda un portale sicuro o un altro dialog */
export const keepOpenOnSafeInteraction = (event: OutsideEvent): void => {
  const target = event.target instanceof Element ? event.target : null;
  const insideAnotherDialog = Boolean(target?.closest('[role="dialog"]'));
  const fromPointer = event.detail?.originalEvent?.type === 'pointerdown';
  if (isSafePortalOpen() || (fromPointer && portalOpenAtPointerDown) || insideAnotherDialog) event.preventDefault();
};

/** Per onEscapeKeyDown di Modal e Sheet: con un portale sicuro aperto, Esc chiude solo quello */
export const keepOpenOnSafeEscape = (event: { preventDefault: () => void }): void => {
  if (isSafePortalOpen()) event.preventDefault();
};
