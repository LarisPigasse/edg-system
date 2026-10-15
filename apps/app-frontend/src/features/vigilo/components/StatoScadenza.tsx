// src/features/vigilo/components/StatoScadenza.tsx
//
// Lo stato di una scadenza, uguale ovunque: il testo pronto del servizio
// ("tra 5 giorni · 18 ott") in grassetto, nel colore dello stato (constants/stati.ts).
// Il testo dice già lo stato: il colore lo rende riconoscibile a colpo d'occhio.
import React from 'react';
import { cn } from '@edg/ui';

import type { Stato } from '../types/scadenze';
import { STATI_ASPETTO } from '../constants/stati';

interface Props {
  stato: Stato;
  /** Il testo pronto del servizio; assente = l'etichetta dello stato */
  testo?: string;
  className?: string;
}

export const StatoScadenza: React.FC<Props> = ({ stato, testo, className }) => (
  <span className={cn('font-bold whitespace-nowrap', STATI_ASPETTO[stato].testo, className)}>{testo ?? STATI_ASPETTO[stato].etichetta}</span>
);
