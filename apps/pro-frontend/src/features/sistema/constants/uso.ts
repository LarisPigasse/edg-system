// src/features/sistema/constants/uso.ts — periodi del riepilogo dell'uso (fase 2 dei log, ADR117)
//
// log-service accetta da 1 a 256 giorni (LOG_USO_GIORNI, predefinito 32):
// qui le scelte offerte nella finestra, in potenze di 2.
import type { SelectOption } from '@edg/ui';

export const PERIODO_USO_PREDEFINITO = 32;

export const PERIODI_USO: SelectOption[] = [8, 32, 128, 256].map(g => ({ value: String(g), label: `Ultimi ${g} giorni` }));
