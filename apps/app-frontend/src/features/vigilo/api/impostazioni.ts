// src/features/vigilo/api/impostazioni.ts — le regole degli avvisi del tenant (B8d-2)
import type { RegoleAvvisi, SchedaRegoleAvvisi } from '../types/impostazioni';
import { leggi, richiesta } from './client';

export const leggiRegoleAvvisi = () => leggi<SchedaRegoleAvvisi>('/impostazioni/avvisi');
export const cambiaRegoleAvvisi = (modifica: Partial<RegoleAvvisi>) => richiesta<SchedaRegoleAvvisi>('/impostazioni/avvisi', 'PATCH', modifica);
export const ripristinaRegoleAvvisi = () => richiesta<SchedaRegoleAvvisi>('/impostazioni/avvisi', 'DELETE');
