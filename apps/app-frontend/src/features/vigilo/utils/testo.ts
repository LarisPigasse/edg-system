// src/features/vigilo/utils/testo.ts
//
// Piccole regole di scrittura usate in più punti della feature.
import { SIGLE } from '../constants/sigle';

/** "veicolo" → "Veicolo" */
export const maiuscola = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);

/** Un valore di elenco da mostrare: "gasolio" → "Gasolio", "gpl" → "GPL" */
export const etichettaOpzione = (valore: string) => SIGLE[valore] ?? maiuscola(valore);

/** "Mario" da "Mario Rossi": per i saluti */
export const nomeProprio = (nome: string) => nome.trim().split(/\s+/)[0] ?? nome;

/** Un testo per il nome di un file: "DAF XF 01" → "daf-xf-01" (senza accenti) */
export const nomeFileDi = (testo: string) =>
  testo
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
