// src/features/vigilo/constants/destinatari.ts
//
// I ruoli che possono ricevere gli avvisi e per quali tipi di soggetto hanno
// senso (B8d-3): l'assegnatario c'è per ciò che si assegna (mezzi e
// attrezzature), l'interessato solo per le persone; un promemoria senza
// soggetto ha solo l'ufficio (più gli indirizzi aggiuntivi).
import type { TipoDestinatario } from '../types/destinatari';
import type { TipoSoggetto } from '../types/valori';

export const RUOLI_DESTINATARI: Record<TipoDestinatario, { etichetta: string; spiegazione: string }> = {
  ufficio: { etichetta: 'Ufficio', spiegazione: 'Chi in azienda usa Vigilo (lettura o scrittura)' },
  referente: { etichetta: 'Referente', spiegazione: 'Il referente indicato nella scheda del soggetto' },
  assegnatario: { etichetta: 'Assegnatario', spiegazione: "Chi ha in uso il mezzo o l'attrezzatura in quel momento" },
  interessato: { etichetta: 'Interessato', spiegazione: 'La persona stessa: patenti, visite, corsi' },
};

/** L'ordine in cui si mostrano e si salvano */
export const ORDINE_RUOLI: TipoDestinatario[] = ['ufficio', 'referente', 'assegnatario', 'interessato'];

/** I ruoli che valgono per un tipo di soggetto (null = promemoria senza soggetto) */
export const ruoliPer = (tipo: TipoSoggetto | null): TipoDestinatario[] => {
  if (!tipo) return ['ufficio'];
  if (tipo === 'persona') return ['ufficio', 'referente', 'interessato'];
  if (tipo === 'veicolo' || tipo === 'macchina' || tipo === 'attrezzatura') return ['ufficio', 'referente', 'assegnatario'];
  return ['ufficio', 'referente'];
};
