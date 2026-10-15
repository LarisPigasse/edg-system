// src/features/vigilo/api/fornitori.ts
import type { Fornitore } from '../types/fornitori';
import { leggiTutti } from './client';

export const leggiFornitori = () => leggiTutti<Fornitore>('/fornitori');
