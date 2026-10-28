// src/features/vigilo/utils/capacita.ts
//
// Le capacità di Vigilo dai permessi del ruolo, con le stesse regole del
// servizio (core/middleware/permessi.ts): '*' tutto, 'vigilo.*' tutto Vigilo,
// '!x' nega; write e config comprendono la lettura. Servono al manifest per
// separare il menu dell'ufficio da quello dell'addetto (B9b); il controllo
// vero resta nel servizio.
import type { Capacita } from '../types/io';

const AZIONI = ['config', 'write', 'read', 'costi', 'own'] as const;

function concesso(permessi: readonly string[], azione: string): boolean {
  const p = `vigilo.${azione}`;
  if (permessi.includes(`!${p}`) || permessi.includes('!vigilo.*') || permessi.includes('!*')) return false;
  return permessi.includes('*') || permessi.includes('vigilo.*') || permessi.includes(p);
}

export function capacitaDa(permessi: readonly string[]): Capacita {
  const c = Object.fromEntries(AZIONI.map(a => [a, concesso(permessi, a)])) as unknown as Capacita;
  c.read = c.read || c.write || c.config;
  return c;
}

/** L'ufficio: chi legge tutto il tenant (read, write o config) */
export const ufficio = (permessi: readonly string[]): boolean => capacitaDa(permessi).read;

/** Solo addetto: vigilo.own senza lettura del tenant */
export const soloAddetto = (permessi: readonly string[]): boolean => {
  const c = capacitaDa(permessi);
  return c.own && !c.read;
};

/** Dal profilo (GET /me): l'utente è soltanto addetto */
export const eAddetto = (c: Capacita): boolean => c.own && !c.read;
