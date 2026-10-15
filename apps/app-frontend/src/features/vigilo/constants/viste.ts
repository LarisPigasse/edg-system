// src/features/vigilo/constants/viste.ts
//
// I riquadri della dashboard: ognuno è anche un filtro dell'elenco "Da fare",
// che è la vista di partenza (tutto ciò che chiede attenzione).
import type { RichiestaScadenze } from '../api/scadenze';
import type { Conteggi } from '../types/dashboard';
import type { Fascia } from './fasce';

export const VISTE = ['da-fare', 'scadute', 'tolleranza', 'entro8', 'entro32', 'da-completare'] as const;
export type Vista = (typeof VISTE)[number];

/** I riquadri in testa, nell'ordine in cui vanno curati */
export const RIQUADRI: Exclude<Vista, 'da-fare'>[] = ['scadute', 'tolleranza', 'entro8', 'entro32', 'da-completare'];

interface DefinizioneVista {
  etichetta: string;
  /** La fascia che dà il colore al riquadro */
  fascia: Fascia | null;
  /** Che cosa conta il riquadro, per la "i" */
  info: string;
  conteggio: (c: Conteggi) => number;
  /** Riga sotto l'etichetta del riquadro */
  sotto: (c: Conteggi) => string;
  richiesta: Pick<RichiestaScadenze, 'stati' | 'entro'>;
  /** Frase dell'elenco vuoto */
  vuoto: string;
}

export const DEFINIZIONI: Record<Vista, DefinizioneVista> = {
  'da-fare': {
    etichetta: 'Da fare',
    fascia: null,
    info: 'Tutto ciò che chiede attenzione; le scadenze senza data sono riassunte a parte',
    conteggio: c => c.scadute + c.inTolleranza + c.inScadenza,
    sotto: () => '',
    richiesta: { stati: 'scaduta,in-tolleranza,in-scadenza' },
    vuoto: 'Niente da fare: tutte le scadenze sono in regola.',
  },
  scadute: {
    etichetta: 'Scadute',
    fascia: 'scaduta',
    info: 'Superate e oltre la tolleranza: vanno rinnovate subito',
    conteggio: c => c.scadute,
    sotto: c => (c.scadute ? 'da rinnovare subito' : 'nessuna'),
    richiesta: { stati: 'scaduta' },
    vuoto: 'Nessuna scadenza superata.',
  },
  tolleranza: {
    etichetta: 'In tolleranza',
    fascia: 'tolleranza',
    info: 'Superate, ma ancora rinnovabili senza sanzioni',
    conteggio: c => c.inTolleranza,
    sotto: c => (c.inTolleranza ? 'rinnovabili senza sanzioni' : 'nessuna'),
    richiesta: { stati: 'in-tolleranza' },
    vuoto: 'Nessuna scadenza nel periodo di tolleranza.',
  },
  entro8: {
    etichetta: 'Entro 8 giorni',
    fascia: 'entro8',
    info: 'In scadenza nei prossimi 8 giorni: da organizzare adesso',
    conteggio: c => c.entro8,
    sotto: c => (c.entro8 ? 'da organizzare adesso' : 'nessuna'),
    richiesta: { stati: 'in-scadenza', entro: 8 },
    vuoto: 'Niente in scadenza nei prossimi 8 giorni.',
  },
  entro32: {
    etichetta: 'Entro 32 giorni',
    fascia: 'entro32',
    info: 'In scadenza nelle prossime settimane',
    conteggio: c => c.entro32,
    sotto: c => (c.entro32 ? `di cui ${c.entro8} entro 8 giorni` : 'nessuna'),
    richiesta: { stati: 'in-scadenza', entro: 32 },
    vuoto: 'Niente in scadenza nei prossimi 32 giorni.',
  },
  'da-completare': {
    etichetta: 'Da completare',
    fascia: 'da-completare',
    info: 'Scadenze senza data: inserisci quella che conosci',
    conteggio: c => c.daCompletare,
    sotto: c => (c.daCompletare ? 'date da inserire' : 'tutte le date ci sono'),
    richiesta: { stati: 'da-completare' },
    vuoto: 'Tutte le scadenze hanno la loro data.',
  },
};
