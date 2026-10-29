// src/features/vigilo/api/impostazioni.ts — le regole degli avvisi (B8d-2) e degli interventi (passo 8) del tenant
import type { RegoleAvvisi, RegoleInterventi, SchedaInterventi, SchedaRegoleAvvisi } from '../types/impostazioni';
import { leggi, richiesta } from './client';

export const leggiRegoleAvvisi = () => leggi<SchedaRegoleAvvisi>('/impostazioni/avvisi');
export const cambiaRegoleAvvisi = (modifica: Partial<RegoleAvvisi>) => richiesta<SchedaRegoleAvvisi>('/impostazioni/avvisi', 'PATCH', modifica);
export const ripristinaRegoleAvvisi = () => richiesta<SchedaRegoleAvvisi>('/impostazioni/avvisi', 'DELETE');

/** Costo orario predefinito (solo vigilo.costi) e giorni per riparare un guasto */
export const leggiInterventi = () => leggi<SchedaInterventi>('/impostazioni/interventi');
export const cambiaInterventi = (modifica: Partial<RegoleInterventi>) => richiesta<SchedaInterventi>('/impostazioni/interventi', 'PATCH', modifica);
