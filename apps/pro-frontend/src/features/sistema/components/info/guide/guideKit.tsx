// src/features/sistema/components/info/guide/guideKit.tsx
//
// Mattoni della scheda Guida di SISTEMA → Info: dati condivisi dalle sezioni
// e pochi elementi di testo con lo stesso stile ovunque. Le sezioni stanno in
// ./sections, una per file; qui niente contenuto, solo forma.
//
// I valori numerici (intervalli, soglie, orari, regole) non sono scritti nel
// testo: arrivano dal vivo da log-service, così la guida resta vera anche se
// cambiano le variabili d'ambiente o le regole. <Live> li evidenzia.
import React from 'react';
import { formatDuration } from '../../../utils/healthFormat';
import type { AlertRecipient, AlertRule, SystemHealth } from '../../../types/info';

/** Dati che le sezioni possono citare; null = non (ancora) disponibili */
export interface GuideContext {
  health: SystemHealth | null;
  /** null anche quando manca il permesso sistema.alert */
  rules: AlertRule[] | null;
  recipients: AlertRecipient[] | null;
  /** Ogni quanto la pagina si aggiorna da sola */
  pollMs: number;
}

/** "2048 ms" sotto gli 8 s (soglie e attese), altrimenti "32 s", "16 min", "1 h" */
export const fmtMs = (ms: number): string => (ms < 8192 ? `${ms} ms` : formatDuration(ms));

/** Valore letto dal vivo; "—" se il dato non è ancora arrivato */
export const Live: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <strong className='font-semibold text-text-primary whitespace-nowrap'>{children ?? '—'}</strong>
);

/** Paragrafo di testo della guida */
export const P: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className='text-sm text-text-secondary leading-relaxed'>{children}</p>
);

/** Elenco puntato */
export const List: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ul className='list-disc pl-5 space-y-1.5 text-sm text-text-secondary leading-relaxed'>{children}</ul>
);

/** Sottotitolo dentro una sezione */
export const Sub: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h4 className='pt-2 text-xs font-semibold uppercase tracking-wider text-text-secondary'>{children}</h4>
);

/** Nome di un elemento dell'interfaccia (pulsante, scheda, stato) */
export const Ui: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className='font-medium text-text-primary'>«{children}»</span>
);

/** Riquadro di avviso dentro una sezione (es. nessun destinatario predefinito) */
export const Note: React.FC<{ tone?: 'info' | 'warning'; children: React.ReactNode }> = ({ tone = 'info', children }) => (
  <div
    className={`rounded-lg border px-3 py-2 text-sm leading-relaxed ${
      tone === 'warning'
        ? 'border-action-warning/40 bg-action-warning/10 text-text-primary'
        : 'border-border-default bg-bg-secondary text-text-secondary'
    }`}
  >
    {children}
  </div>
);

/** Contenitore di una sezione */
export const Section: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className='space-y-3 pb-2'>{children}</div>
);
