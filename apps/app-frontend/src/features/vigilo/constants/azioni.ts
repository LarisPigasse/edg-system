// src/features/vigilo/constants/azioni.ts
//
// Le azioni su una scadenza aperta, come compaiono nel pannello.
export const AZIONI = {
  completa: { etichetta: 'Inserisci la data', info: 'La scadenza non ha ancora una data: inseriscila e Vigilo inizia a seguirla.' },
  registra: { etichetta: 'Registra', info: "Fatto: con esito positivo la scadenza si chiude e Vigilo apre la successiva." },
  rinvia: { etichetta: 'Rinvia', info: 'Sposta la data con un motivo, senza chiudere la scadenza.' },
  lettura: { etichetta: 'Leggi contatore', info: 'Una nuova lettura aggiorna la stima di quando si arriva alla soglia.' },
} as const;

export type Azione = keyof typeof AZIONI;
