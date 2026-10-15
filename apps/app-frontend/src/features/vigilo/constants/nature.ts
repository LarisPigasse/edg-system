// src/features/vigilo/constants/nature.ts — come si chiama la natura di un controllo
import type { Natura } from '../types/valori';

export const NATURE_TESTO: Record<Natura, string> = {
  adempimento: 'Adempimento',
  manutenzione: 'Manutenzione',
  abilitazione: 'Abilitazione',
  documento: 'Documento',
  pagamento: 'Pagamento',
  promemoria: 'Promemoria',
};
