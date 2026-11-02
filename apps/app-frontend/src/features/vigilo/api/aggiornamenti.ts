// src/features/vigilo/api/aggiornamenti.ts — aggiornamenti della libreria (B10b)
import type { Decisione, ElencoAggiornamenti, EntitaAggiornamento, EsitoDecisioneVoce, RigaStoricoLibreria, VoceAggiornamento } from '../types/aggiornamenti';
import { leggi, richiesta } from './client';

const voce = (entita: EntitaAggiornamento, uuid: string) => `/aggiornamenti/${entita}/${uuid}`;

export const leggiAggiornamenti = () => leggi<ElencoAggiornamenti>('/aggiornamenti');

/** Prima apertura delle differenze (si annota una volta) */
export const segnaVisto = (entita: EntitaAggiornamento, uuid: string) => richiesta<VoceAggiornamento>(`${voce(entita, uuid)}/visto`, 'POST');

export const decidi = (entita: EntitaAggiornamento, uuid: string, d: Decisione) => richiesta<EsitoDecisioneVoce>(voce(entita, uuid), 'POST', d);

/** Le decisioni sulla libreria di una voce, dalla più recente (avvio compreso) */
export const leggiStoricoLibreria = (entita: EntitaAggiornamento, uuid: string) => leggi<RigaStoricoLibreria[]>(`${voce(entita, uuid)}/storico`);
