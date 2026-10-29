// src/features/vigilo/constants/nature.ts — come si chiama la natura di un controllo o di una scadenza
import type { NaturaEffettiva } from '../types/valori';

export const NATURE_TESTO: Record<NaturaEffettiva, string> = {
  adempimento: 'Adempimento',
  manutenzione: 'Manutenzione',
  abilitazione: 'Abilitazione',
  documento: 'Documento',
  pagamento: 'Pagamento',
  promemoria: 'Promemoria',
  riparazione: 'Riparazione',
};
