// src/features/vigilo/types/stima.ts
//
// Stima dei costi di un servizio (2026-11-17): parametri generali e costi
// aziendali per anno (GET /stima/parametri).

export interface RegoleStima {
  /** €/h del conducente o dell'operatore quando non si sceglie una persona */
  costoOrarioConducente: number | null;
  velocitaMedia: number;
  oreGuidaGiorno: number;
  diaria: number | null;
  pedaggioKm: number | null;
}

export type Limite = { min: number; max: number };

export type VoceCosti = 'personale' | 'struttura' | 'servizi' | 'consulenze' | 'finanziari' | 'altro';
export type StatoCosti = 'consuntivo' | 'preventivo';

export interface CostiAnno {
  uuid: string;
  anno: number;
  stato: StatoCosti;
  voci: Partial<Record<VoceCosti, number>>;
  totale: number;
  oreServizio: number | null;
  /** Costo aziendale per ora di servizio; null senza ore */
  costoPerOra: number | null;
  note: string | null;
  aggiornatoIl: string;
  aggiornatoDa: string | null;
}

export interface ParametriStima {
  generali: RegoleStima;
  iniziali: RegoleStima;
  limiti: Record<keyof RegoleStima | 'costoAnnuo' | 'oreServizio' | 'anno' | 'km' | 'ore' | 'pernottamenti' | 'costoMezzo' | 'importo', Limite> & {
    extraMassimi: number;
  };
  voci: { chiave: VoceCosti; nome: string }[];
  anni: CostiAnno[];
  annoCorrente: number;
  /** L'anno che la stima userebbe oggi */
  annoDiRiferimento: number | null;
  modificabili: boolean;
}

export interface DatiAnno {
  stato: StatoCosti;
  voci: Partial<Record<VoceCosti, number | null>>;
  oreServizio: number | null;
  note: string | null;
}

// --- La stima di un servizio (POST /stima/calcola, fase 2) ---

export type TipoServizio = 'km' | 'ore';
export type Fonte = 'manuale' | 'mezzo' | 'persona' | 'media' | 'mancante';

export interface VoceExtra {
  descrizione: string;
  importo: number;
}

export interface RichiestaCalcolo {
  tipo: TipoServizio;
  mezzo?: string | null;
  costoMezzo?: number | null;
  km?: number;
  ritornoAVuoto?: boolean;
  kmAutostrada?: number | null;
  oreLavoro?: number;
  oreAggiuntive?: number;
  persona?: string | null;
  costoOrario?: number | null;
  pernottamenti?: number;
  pedaggi?: number | null;
  extra?: VoceExtra[];
  anno?: number | null;
}

export interface RisultatoStima {
  kmTotali: number | null;
  oreGuida: number | null;
  oreServizio: number;
  giorni: number;
  pernottamenti: number;
  voci: {
    mezzo: { quantita: number; unitario: number | null; totale: number };
    conducente: { ore: number; costoOrario: number | null; oreTotale: number; pernottamenti: number; diaria: number | null; diarie: number; totale: number };
    pedaggi: { stimati: boolean; totale: number };
    extra: { voci: VoceExtra[]; totale: number };
    aziendali: { ore: number; perOra: number | null; totale: number };
  };
  totale: number;
  perKm: number | null;
  perOra: number | null;
  avvisi: string[];
}

export interface CalcoloStima {
  usati: {
    mezzo: { uuid: string; nome: string; identificativo: string | null; base: string; costo: number | null } | null;
    costoMezzo: number | null;
    fonteMezzo: Fonte;
    persona: { uuid: string; nome: string; costoOrario: number | null } | null;
    costoOrario: number | null;
    fonteCostoOrario: Fonte;
    anno: { anno: number; stato: StatoCosti } | null;
    parametri: { velocitaMedia: number; oreGuidaGiorno: number; diaria: number | null; pedaggioKm: number | null; costoAziendalePerOra: number | null };
  };
  risultato: RisultatoStima;
}

// --- Stime salvate (fase 3) ---

export interface Scostamento {
  euro: number;
  /** Sulla stima; null se la stima è zero */
  percentuale: number | null;
}

export interface StimaRiga {
  uuid: string;
  descrizione: string;
  tipo: TipoServizio;
  mezzo: string | null;
  persona: string | null;
  kmTotali: number | null;
  oreServizio: number | null;
  totale: number;
  costoReale: number | null;
  scostamento: Scostamento | null;
  salvataIl: string;
  salvataDa: string | null;
  eliminabile: boolean;
}

export interface StimaSalvata extends StimaRiga {
  dati: RichiestaCalcolo;
  usati: CalcoloStima['usati'];
  risultato: RisultatoStima;
  noteReale: string | null;
  realeIl: string | null;
  realeDa: string | null;
}
