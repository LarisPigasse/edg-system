// src/features/base/types/index.ts

/**
 * Tipi condivisi con system-service (packages/system-service in edg-docker).
 * Rispecchiano lo schema Postgres: id_/uuid_ separati, campi in italiano
 * (ADR014 — convenzione naming tabelle Postgres).
 */

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: { field: string; message: string }[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// ─── Reparto (tabella primitiva) ─────────────────────────────────────────────

export interface Reparto {
  idReparto: number;
  uuidReparto: string;
  reparto: string;
  isActive: boolean;
}

export interface RepartoInput {
  reparto: string;
  isActive?: boolean;
}

// ─── Operatore ────────────────────────────────────────────────────────────────

export interface Operatore {
  idOperatore: number;
  uuidOperatore: string;
  nome: string;
  cognome: string;
  idReparto: number;
  telefono: string | null;
  email: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OperatoreInput {
  nome: string;
  cognome: string;
  idReparto: number;
  telefono?: string | null;
  email?: string | null;
  isActive?: boolean;
}

// ─── Anagrafica (partner / cliente / agente) ─────────────────────────────────

export type TipoAnagrafica = 'partner' | 'cliente' | 'agente';

export const TIPO_ANAGRAFICA_LABELS: Record<TipoAnagrafica, string> = {
  partner: 'Partner',
  cliente: 'Cliente',
  agente: 'Agente',
};

export interface Anagrafica {
  idAnagrafica: number;
  uuidAnagrafica: string;
  tipo: TipoAnagrafica;
  idTenant: number;
  ragioneSociale: string;
  partitaIva: string | null;
  codiceFiscale: string | null;
  indirizzo: string | null;
  cap: string | null;
  citta: string | null;
  provincia: string | null;
  telefono: string | null;
  email: string | null;
  referente: string | null;
  note: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AnagraficaInput {
  tipo: TipoAnagrafica;
  idTenant: number;
  ragioneSociale: string;
  partitaIva?: string | null;
  codiceFiscale?: string | null;
  indirizzo?: string | null;
  cap?: string | null;
  citta?: string | null;
  provincia?: string | null;
  telefono?: string | null;
  email?: string | null;
  referente?: string | null;
  note?: string | null;
  isActive?: boolean;
}
