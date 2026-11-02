// src/features/vigilo/constants/aggiornamenti.ts
//
// Le parole degli aggiornamenti della libreria (B10b): i nomi dei campi di
// categorie e controlli come li confronta il servizio (avvio/copia.ts) e i
// dati della registrazione.
import type { DatoRegistrazione } from '../types/scadenze';

export const ETICHETTE_CAMPI: Record<string, string> = {
  nome: 'Nome',
  descrizione: 'Descrizione',
  riferimentoNormativo: 'Riferimento normativo',
  natura: 'Natura',
  automatico: 'Scadenze',
  cadenza: 'Cadenza',
  preavvisi: 'Preavvisi',
  tolleranza: 'Tolleranza',
  destinatari: 'Avvisi a',
  rinnovo: 'Rinnovo',
  rinviabile: 'Rinvio',
  registrazione: 'Alla registrazione',
  categorie: 'Categorie',
  icona: 'Icona',
  campi: 'Campi dei soggetti',
  contatori: 'Contatori',
};

export const DATI_REGISTRAZIONE: Record<DatoRegistrazione, string> = {
  lettura: 'lettura del contatore',
  importo: 'importo',
  fornitore: 'fornitore',
  riferimento: 'riferimento',
  allegato: 'documento',
  manodopera: 'manodopera',
};

/** Chiave dell'indirizzo che apre il pannello (dall'avviso e dall'email) */
export const PARAMETRO_AGGIORNAMENTI = 'aggiornamenti';

/** Gli esiti degli aggiornamenti come titolo della riga dello storico (avvio e ritiro, col genere della voce, in utils) */
export const ESITI_STORICO: Record<string, string> = {
  accettato: 'Aggiornamento accettato',
  parziale: 'Aggiornamento accettato in parte',
  rifiutato: 'Tenuti i tuoi valori',
};
