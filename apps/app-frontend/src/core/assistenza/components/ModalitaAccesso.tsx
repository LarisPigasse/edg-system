// src/core/assistenza/components/ModalitaAccesso.tsx
//
// La modalità dell'accesso in parole: "Preparazione" oppure "Assistenza in
// sola lettura" con, sotto, "come Mario Rossi". Il significato nel title.
import React from 'react';

import { MODO_ACCESSO, MODO_SPIEGAZIONE } from '../constants';
import type { AccessoAssistenza } from '../types';

export const ModalitaAccesso: React.FC<{ a: AccessoAssistenza }> = ({ a }) => (
  <div title={MODO_SPIEGAZIONE[a.modo]}>
    <div className='text-text-primary'>{MODO_ACCESSO[a.modo] ?? a.modo}</div>
    {a.perConto && <div className='text-xs text-text-secondary'>come {a.perConto}</div>}
  </div>
);
