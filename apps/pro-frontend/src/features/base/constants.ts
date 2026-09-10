// src/features/base/constants.ts
//
// Costanti UI condivise dalle pagine di gestione tabelle (Operatori,
// Anagrafiche, ...): un solo punto per opzioni ripetute in più Select.
import type { SelectOption } from '@edg/ui';

/** Opzioni per il filtro di stato (Select), stesso ordine e testo ovunque compaia. */
export const STATUS_FILTER_OPTIONS: SelectOption[] = [
  { value: 'all', label: 'Tutti gli stati' },
  { value: 'active', label: 'Attivi' },
  { value: 'inactive', label: 'Non attivi' },
];
