// src/features/vigilo/components/dashboard/Saluto.tsx
//
// Il saluto e una frase che dice subito come stanno le cose: è il
// sottotitolo della pagina, sotto il titolo "Dashboard" di PageHeader.
import React from 'react';

import { giornoEsteso } from '../../utils/giorni';
import type { Conteggi } from '../../types/dashboard';

const PAROLE = ['', 'Una', 'Due', 'Tre', 'Quattro', 'Cinque', 'Sei', 'Sette', 'Otto', 'Nove', 'Dieci'];
const quante = (n: number) => PAROLE[n] ?? String(n);

const salutoDellOra = (ora: number) => (ora < 13 ? 'Buongiorno' : ora < 18 ? 'Buon pomeriggio' : 'Buonasera');

/** "Due scadenze sono superate e una è in tolleranza: conviene partire da lì." */
function sintesi(c: Conteggi): string {
  const urgenti: string[] = [];
  if (c.scadute) urgenti.push(c.scadute === 1 ? 'una scadenza è superata' : `${quante(c.scadute).toLowerCase()} scadenze sono superate`);
  if (c.inTolleranza) urgenti.push(c.inTolleranza === 1 ? 'una è in tolleranza' : `${quante(c.inTolleranza).toLowerCase()} sono in tolleranza`);
  if (urgenti.length) {
    const frase = urgenti.join(' e ');
    return `${frase.charAt(0).toUpperCase()}${frase.slice(1)}: conviene partire da lì.`;
  }
  if (c.entro8) return `Niente di superato. Nei prossimi 8 giorni: ${c.entro8 === 1 ? 'una scadenza' : `${c.entro8} scadenze`}.`;
  if (c.entro32) return `Tutto in regola per ora: ${c.entro32 === 1 ? 'una scadenza' : `${c.entro32} scadenze`} nelle prossime settimane.`;
  if (c.daCompletare) return `Tutto in regola. Restano ${c.daCompletare === 1 ? 'una data' : `${c.daCompletare} date`} da inserire.`;
  return 'Tutto in regola: niente in scadenza nelle prossime settimane.';
}

interface Props {
  nome: string | null;
  oggi: string | null;
  conteggi: Conteggi | null;
}

export const Saluto: React.FC<Props> = ({ nome, oggi, conteggi }) => {
  const giorno = oggi ? giornoEsteso(oggi).replace(/ \d{4}$/, '') : null;
  return (
    <>
      <span className='font-semibold text-text-primary'>
        {salutoDellOra(new Date().getHours())}
        {nome ? ` ${nome}` : ''}.
      </span>{' '}
      {giorno && `Oggi è ${giorno}. `}
      {conteggi ? sintesi(conteggi) : ''}
    </>
  );
};
