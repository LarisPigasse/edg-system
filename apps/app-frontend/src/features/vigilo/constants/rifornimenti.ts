// src/features/vigilo/constants/rifornimenti.ts — rifornimenti e spese d'uso dei mezzi (tappa 2)
import type { VoceRifornimento } from '../types/rifornimenti';
import type { TipoSoggetto } from '../types/valori';

/** Come si chiamano le voci (come il servizio, anche nel CSV) */
export const NOMI_VOCI: Record<VoceRifornimento, string> = { carburante: 'Carburante', adblue: 'AdBlue', pedaggi: 'Pedaggi', altro: 'Altro' };

export const VOCI_RIFORNIMENTO: readonly VoceRifornimento[] = ['carburante', 'adblue', 'pedaggi', 'altro'];

/** Le voci con i litri */
export const VOCI_CON_LITRI: readonly VoceRifornimento[] = ['carburante', 'adblue'];

/** I tipi di soggetto con rifornimenti (come il servizio): non solo veicoli */
export const TIPI_CON_RIFORNIMENTI: readonly TipoSoggetto[] = ['veicolo', 'macchina', 'attrezzatura'];

/** Come il servizio (LIMITI_RIFORNIMENTI): il modulo avvisa prima di inviare */
export const LIMITI_RIFORNIMENTO = { importo: 65536, litri: 16384, lettura: 16777216, riferimento: 128, note: 4096 } as const;

/** Rifornimenti per pagina nella scheda del mezzo ("Mostra altri") */
export const RIGHE_RIFORNIMENTI = 32;

/** Gli ultimi rifornimenti di un mezzo in "I miei mezzi" */
export const ULTIMI_RIFORNIMENTI = 4;
