// src/features/vigilo/utils/fasce.ts
//
// La fascia di urgenza di una scadenza aperta (colori: constants/fasce.ts).
import type { Fascia } from '../constants/fasce';
import type { Scadenza } from '../types/scadenze';
import { aggiungiGiorni } from './giorni';

export function fasciaDi(s: Scadenza, oggi: string): Fascia {
  switch (s.stato) {
    case 'scaduta':
      return 'scaduta';
    case 'in-tolleranza':
      return 'tolleranza';
    case 'da-completare':
      return 'da-completare';
    case 'in-regola':
      return 'in-regola';
    default:
      if (s.urgenzaIl && s.urgenzaIl <= aggiungiGiorni(oggi, 8)) return 'entro8';
      if (s.urgenzaIl && s.urgenzaIl <= aggiungiGiorni(oggi, 32)) return 'entro32';
      return 'oltre';
  }
}
