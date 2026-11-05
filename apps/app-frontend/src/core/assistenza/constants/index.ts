// src/core/assistenza/constants/index.ts — accessi dell'assistenza EDG (AA5)
import type { BadgeVariant } from '@edg/ui';

import type { ModoAccesso, StatoAccesso } from '../types';

/** Pagina della piattaforma, nel menu utente (non /assistenza: è l'ingresso della scheda assistita) */
export const ACCESSI_ASSISTENZA_PATH = '/accessi-assistenza';

/** Permesso che apre la pagina (ruolo admin del cliente) */
export const PERMESSO_ACCESSI_ASSISTENZA = 'account.assistenze';

export const MODO_ACCESSO: Record<ModoAccesso, string> = {
  preparazione: 'Preparazione',
  assistenza: 'Assistenza in sola lettura',
};

/** Cosa vuol dire ogni modalità, per chi legge */
export const MODO_SPIEGAZIONE: Record<ModoAccesso, string> = {
  preparazione: "Ha preparato i moduli con i permessi dell'amministratore",
  assistenza: 'Ha guardato senza poter modificare nulla',
};

export const STATO_ACCESSO: Record<StatoAccesso, { testo: string; variante: BadgeVariant }> = {
  aperta: { testo: 'In corso', variante: 'warning' },
  uscita: { testo: 'Concluso', variante: 'default' },
  scaduta: { testo: 'Finito a tempo', variante: 'default' },
  chiusa: { testo: 'Chiuso da EDG', variante: 'default' },
};
