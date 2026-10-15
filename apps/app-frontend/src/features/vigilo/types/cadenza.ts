// src/features/vigilo/types/cadenza.ts — la cadenza come la descrive vigilo-service (regole/tipi.ts)
// Per ora solo letta: l'editor della cadenza arriverà con la Configurazione modificabile.

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
