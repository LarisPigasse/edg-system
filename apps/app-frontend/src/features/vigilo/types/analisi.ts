// src/features/vigilo/types/analisi.ts — la vista Analisi della Dashboard (GET /analisi, 2026-11-23)
import type { StatoCosti } from './stima';

export interface VoceConfronto {
  voce: string;
  nome: string;
  prima: number;
  dopo: number;
  differenza: number;
  percentuale: number | null;
}

export interface AvvisoAnalisi {
  chiave: 'anno' | 'oreServizio' | 'conducente' | 'flotta' | 'possesso' | 'ricavi' | 'precedente' | 'stimeReali' | 'prezzi' | 'consumi';
  testo: string;
}

export interface Analisi {
  oggi: string;
  anno: { anno: number; stato: StatoCosti; ricavi: number | null; oreServizio: number | null; costoPerOra: number | null; quotaMezzi: number } | null;
  precedente: { anno: number; stato: StatoCosti } | null;
  periodoMezzi: { dal: string; al: string };
  /** Fissa dai veicoli con il costo di possesso, variabile da tutti i veicoli; costoTotale di tutti i mezzi */
  flotta: { mezzi: number; veicoli: number; conPossesso: number; senzaPossesso: number; fissoOra: number | null; variabileKm: number | null; costoTotale: number };
  conducente: { costoOrario: number | null; fonte: 'parametro' | 'persone' | null; persone: number };
  velocitaMedia: number;
  costoPieno: {
    perOra: { mezzo: number; conducente: number; aziendali: number; totale: number };
    perKm: { movimento: number; orarie: number; totale: number };
    mancanti: ('mezzo' | 'conducente' | 'aziendali')[];
  };
  /** Il costo pieno per categoria di veicoli, dal più caro */
  categorie: { categoria: string | null; veicoli: number; conPossesso: number; mezzoOra: number | null; mezzoKm: number | null; perOra: number; perKm: number; mancanti: string[] }[];
  stime: {
    stime: number;
    conReale: number;
    scostamentoMedio: number | null;
    scostamentoAssoluto: number | null;
    entroTolleranza: number;
    tolleranza: number;
    verso: 'sotto' | 'sopra' | 'misto' | null;
    conPrezzo: number;
    margineMedio: number | null;
    inPerdita: number;
  };
  struttura: { voci: VoceConfronto[]; totale: VoceConfronto } | null;
  margine: { ricavi: number; costi: { aziendali: number; mezzi: number; conducenti: number; totale: number }; euro: number; percentuale: number | null } | null;
  operativita: Operativita;
  /** I segnali da valutare, dal più grave (fase D) */
  segnali: Segnale[];
  soglie: SoglieAnalisi;
  sogliePredefinite: SoglieAnalisi;
  limitiSoglie: Record<keyof SoglieAnalisi, { min: number; max: number }>;
  soglieModificabili: boolean;
  avvisi: AvvisoAnalisi[];
}

/** Le soglie dei segnali del tenant */
export interface SoglieAnalisi {
  consumoAlto: number;
  consumoCrescita: number;
  kmMeseMinimi: number;
  disponibilitaMinima: number;
  quotaGuastiMassima: number;
  strutturaMassima: number;
  strutturaMinimaEuro: number;
  margineMinimo: number;
}

export type Gravita = 'alta' | 'media' | 'bassa';

export interface Segnale {
  chiave: string;
  tipo: string;
  gravita: Gravita;
  titolo: string;
  dettaglio: string;
  azione: string;
  soggetto?: { uuid: string; nome: string };
}

/** La flotta al lavoro negli ultimi 12 mesi (fase C) */
export interface Operativita {
  periodo: { dal: string; al: string };
  giorni: number;
  veicoli: number;
  disponibilita: { percentuale: number | null; giorniFermo: number; guasti: number };
  consumo: { l100: number | null; recente: number | null; prima: number | null; tendenza: number | null };
  utilizzo: { kmMese: number | null; sotto: number; soglia: number };
  manutenzione: { riparazioni: number; programmata: number; quotaGuasti: number | null };
  perVeicolo: {
    uuid: string;
    nome: string;
    identificativo: string | null;
    categoria: string | null;
    giorniFermo: number;
    disponibilita: number | null;
    consumo: number | null;
    /** Sulla media della sua categoria, in %; null se è l'unico con i consumi */
    sullaCategoria: number | null;
    kmMese: number | null;
    riparazioni: number;
  }[];
}
