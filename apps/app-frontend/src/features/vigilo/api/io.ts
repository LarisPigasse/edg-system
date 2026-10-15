// src/features/vigilo/api/io.ts
import type { ProfiloVigilo } from '../types/io';
import { leggi } from './client';

export const leggiProfilo = () => leggi<ProfiloVigilo>('/me');
