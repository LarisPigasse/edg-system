// src/features/vigilo/utils/predefiniti.ts
//
// I predefiniti per i controlli nuovi in parole, come le frasi del servizio:
// usati da Impostazioni (Configurazione) e dal Piano dei controlli in PDF.

/** "32, 8 e 1" */
const elenco = (xs: number[]) => (xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join(', ')} e ${xs[xs.length - 1]}`);

/** Dal più lontano; il nome si accorda con l'ultimo numero: "avvisi a 32, 8 e 1 giorno" */
export const frasePreavvisi = (g: number[]): string => {
  const ordinati = [...g].sort((a, b) => b - a);
  return ordinati.length ? `avvisi a ${elenco(ordinati)} ${ordinati[ordinati.length - 1] === 1 ? 'giorno' : 'giorni'}` : 'nessun preavviso';
};

/** "tolleranza 8 giorni", "nessuna tolleranza" */
export const fraseTolleranza = (t: number): string => (t ? `tolleranza ${t} ${t === 1 ? 'giorno' : 'giorni'}` : 'nessuna tolleranza');
