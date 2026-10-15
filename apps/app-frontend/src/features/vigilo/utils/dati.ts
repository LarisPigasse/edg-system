// src/features/vigilo/utils/dati.ts
//
// Un valore dei dati del soggetto (dati del tipo o campi della categoria)
// come testo da leggere; null se non c'è.
import { giornoEsteso } from './giorni';

const maiuscola = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);

export function testoDato(valore: unknown, formato: 'testo' | 'numero' | 'data' | 'elenco' | 'si-no' | 'email'): string | null {
  if (valore === undefined || valore === null || valore === '') return null;
  switch (formato) {
    case 'data':
      return typeof valore === 'string' ? giornoEsteso(valore) : String(valore);
    case 'numero':
      return typeof valore === 'number' ? valore.toLocaleString('it-IT') : String(valore);
    case 'si-no':
      return valore ? 'Sì' : 'No';
    case 'email':
      return String(valore);
    default:
      return maiuscola(String(valore));
  }
}
