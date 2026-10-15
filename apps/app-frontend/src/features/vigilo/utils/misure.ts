// src/features/vigilo/utils/misure.ts

/** "120.000 km", "1.250 ore" */
export const misura = (n: number, unita: 'km' | 'ore'): string => `${n.toLocaleString('it-IT')} ${unita}`;

/** Il nome di un contatore: il suo, altrimenti "Contachilometri" o "Contaore" */
export const nomeContatore = (c: { nome: string | null; unita: 'km' | 'ore' }): string =>
  c.nome?.trim() || (c.unita === 'km' ? 'Contachilometri' : 'Contaore');
