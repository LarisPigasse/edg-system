// src/features/vigilo/api/configurazione.ts — categorie e controlli del cliente
import type { Categoria, Controllo } from '../types/configurazione';
import { leggiTutti } from './client';

export const leggiCategorie = () => leggiTutti<Categoria>('/categorie?ordina=ordine');
export const leggiControlli = () => leggiTutti<Controllo>('/controlli?ordina=ordine');
