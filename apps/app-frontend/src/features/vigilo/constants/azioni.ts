// src/features/vigilo/constants/azioni.ts
//
// Le azioni su una scadenza aperta, come compaiono nel pannello. L'addetto
// segnala "fatto"; l'ufficio conferma o respinge la segnalazione (B9c).
export const AZIONI = {
  completa: { etichetta: 'Inserisci la data', info: 'La scadenza non ha ancora una data: inseriscila e Vigilo inizia a seguirla.' },
  registra: { etichetta: 'Registra', info: 'Fatto: con esito positivo la scadenza si chiude e Vigilo apre la successiva.' },
  rinvia: { etichetta: 'Rinvia', info: 'Sposta la data con un motivo, senza chiudere la scadenza.' },
  lettura: { etichetta: 'Leggi contatore', info: 'Una nuova lettura aggiorna la stima di quando si arriva alla soglia.' },
  segnala: { etichetta: 'Segnala fatto', info: "Fatto: l'ufficio riceve la segnalazione e la conferma. Fino ad allora la scadenza resta aperta." },
  conferma: { etichetta: 'Conferma', info: 'Controlla i dati della segnalazione, correggili se serve e conferma: la scadenza si chiude e Vigilo apre la successiva.' },
  respingi: { etichetta: 'Respingi', info: 'La segnalazione non va: scrivi il perché, chi l’ha mandata riceve un avviso.' },
} as const;

export type Azione = keyof typeof AZIONI;
