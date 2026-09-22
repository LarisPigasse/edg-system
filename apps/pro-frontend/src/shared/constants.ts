// src/shared/constants.ts
//
// Costanti UI generiche, non legate a un backend/dominio specifico — usate
// da più feature (BASE, SISTEMA, ...).
import type { SelectOption } from '@edg/ui';

/** Opzioni per il filtro di stato (Select), stesso ordine e testo ovunque compaia. */
export const STATUS_FILTER_OPTIONS: SelectOption[] = [
  { value: 'all', label: 'Tutti gli stati' },
  { value: 'active', label: 'Attivi' },
  { value: 'inactive', label: 'Non attivi' },
];
