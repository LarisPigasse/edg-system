// src/features/vigilo/api/resoconti.ts — Spese e consumi (B10c): solo con vigilo.read e vigilo.costi
import type { FiltriSpese, Spese } from '../types/resoconti';
import { leggi } from './client';
import { query } from './scadenze';

export const leggiSpese = (f: FiltriSpese) => leggi<Spese>(`/resoconti/spese${query({ ...f })}`);
