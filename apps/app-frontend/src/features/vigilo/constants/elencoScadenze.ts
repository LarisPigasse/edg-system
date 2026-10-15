// src/features/vigilo/constants/elencoScadenze.ts
//
// Le scelte dell'elenco delle scadenze: quali (stato), come ordinarle, e
// perché una scadenza è stata chiusa (codici del servizio → parole).
import type { FiltroStatoScadenze, OrdinaScadenze } from '../types/scadenze';
import { STATI_ASPETTO } from './stati';

export const FILTRI_STATO_SCADENZE: { value: FiltroStatoScadenze; label: string }[] = [
  { value: 'aperte', label: 'Tutte le aperte' },
  { value: 'scaduta', label: STATI_ASPETTO.scaduta.etichetta },
  { value: 'in-tolleranza', label: STATI_ASPETTO['in-tolleranza'].etichetta },
  { value: 'in-scadenza', label: STATI_ASPETTO['in-scadenza'].etichetta },
  { value: 'da-completare', label: STATI_ASPETTO['da-completare'].etichetta },
  { value: 'in-regola', label: STATI_ASPETTO['in-regola'].etichetta },
  { value: 'chiuse', label: 'Chiuse' },
];

export const ORDINI_SCADENZE: [OrdinaScadenze, string][] = [
  ['urgenza', 'Per urgenza'],
  ['scadeIl', 'Per data'],
  ['soggetto', 'Per soggetto'],
];

export const MOTIVI_CHIUSURA: Record<string, string> = {
  rinnovata: 'eseguita e rinnovata',
  completata: 'eseguita',
  'fine-ricorrenza': 'fine della serie',
  'soggetto-dismesso': 'soggetto archiviato',
  'controllo-disattivato': 'controllo disattivato',
};
