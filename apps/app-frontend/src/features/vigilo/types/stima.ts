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
  /** Ore di impiego annue di un mezzo: dividono i suoi costi fissi in un costo per ora */
  oreImpiegoAnnue: number;
  /** € per giorno fuori sede (trasferta), anche senza dormire fuori */
  indennitaTrasferta: number | null;
  /** Oltre queste ore di servizio, o questi km di andata, il conducente non rientra in giornata */
  sogliaOreTrasferta: number;
  sogliaKmTrasferta: number;
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
  /** % dei costi che spetta ai servizi con i mezzi (trasporti e lavori) */
  quotaMezzi: number;
  /** I costi attribuiti ai servizi con i mezzi: totale × quota */
  attribuiti: number;
  oreServizio: number | null;
  /** Costo aziendale per ora di servizio (sulla quota); null senza ore */
  costoPerOra: number | null;
  kmAnnui: number | null;
  /** Costo aziendale per km; null senza km annui */
  costoPerKm: number | null;
  /** Ricavi dell'anno, opzionali (Analisi, 2026-11-23) */
  ricavi: number | null;
  note: string | null;
  aggiornatoIl: string;
  aggiornatoDa: string | null;
}

export interface ParametriStima {
  generali: RegoleStima;
  iniziali: RegoleStima;
  limiti: Record<keyof RegoleStima | 'costoAnnuo' | 'oreServizio' | 'kmAnnui' | 'quotaMezzi' | 'ricaviAnnui' | 'anno' | 'km' | 'ore' | 'pernottamenti' | 'costoMezzo' | 'importo', Limite> & {
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
  kmAnnui: number | null;
  quotaMezzi: number;
  ricavi: number | null;
  note: string | null;
}

/** I km dei veicoli in un anno dai contatori: il suggerimento per i km annui */
export interface KmSuggeriti {
  anno: number;
  dal: string;
  al: string;
  km: number | null;
  veicoli: number;
  inCorso: boolean;
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
  /** Parte fissa del mezzo scritta a mano: € per ora di impiego */
  costoMezzoOra?: number | null;
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
    mezzo: { quantita: number; unitario: number | null; variabile?: number; ore?: number; fissoOra?: number | null; fisso?: number; totale: number };
    conducente: {
      ore: number;
      costoOrario: number | null;
      oreTotale: number;
      pernottamenti: number;
      diaria: number | null;
      diarie: number;
      giorniTrasferta?: number;
      indennita?: number | null;
      trasferta?: number;
      totale: number;
    };
    pedaggi: { stimati: boolean; totale: number };
    extra: { voci: VoceExtra[]; totale: number };
    aziendali: { ore: number; perOra: number | null; totale: number; perKm?: number | null; totaleSeKm?: number | null };
  };
  totale: number;
  /** Il totale con i costi aziendali per km (trasporti, se l'anno ha i km annui) */
  totaleConAziendaliPerKm?: number | null;
  perKm: number | null;
  perOra: number | null;
  avvisi: string[];
}

export interface CalcoloStima {
  usati: {
    mezzo: { uuid: string; nome: string; identificativo: string | null; base: string; costo: number | null; fissoOra?: number | null } | null;
    costoMezzo: number | null;
    fonteMezzo: Fonte;
    costoMezzoOra?: number | null;
    fonteMezzoOra?: Fonte;
    persona: { uuid: string; nome: string; costoOrario: number | null } | null;
    costoOrario: number | null;
    fonteCostoOrario: Fonte;
    anno: { anno: number; stato: StatoCosti; quotaMezzi?: number } | null;
    parametri: {
      velocitaMedia: number;
      oreGuidaGiorno: number;
      diaria: number | null;
      pedaggioKm: number | null;
      costoAziendalePerOra: number | null;
      costoAziendalePerKm?: number | null;
      indennitaTrasferta?: number | null;
    };
  };
  risultato: RisultatoStima;
}

// --- Stime salvate (fase 3) ---

/** Prezzo − costo (reale se c'è, altrimenti la stima: base) */
export interface Margine {
  euro: number;
  /** Sul prezzo; null se il prezzo è zero */
  percentuale: number | null;
  base: 'reale' | 'stimato';
}

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
  /** Prezzo applicato al cliente e margine, opzionali (2026-11-23) */
  prezzo: number | null;
  margine: Margine | null;
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
