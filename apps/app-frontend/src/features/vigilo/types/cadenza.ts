// src/features/vigilo/types/cadenza.ts — la cadenza come la descrive vigilo-service (regole/tipi.ts)
// Si modifica con EditorCadenza nel pannello del controllo (2026-11-19, passo 2b).

export interface Durata {
  valore: number;
  unita: 'giorni' | 'mesi' | 'anni';
}

export interface Cadenza {
  tempo: Durata | null;
  uso: { valore: number; unita: 'km' | 'ore' } | null;
  ancoraggio: 'scadenza' | 'esecuzione' | 'finestra';
  fineMese: boolean;
  prima: { tempo: Durata; da: string } | null;
  finestra?: Durata | null;
  fasce?: { da: string; elenco: { oltre: Durata; tempo: Durata }[] } | null;
}
