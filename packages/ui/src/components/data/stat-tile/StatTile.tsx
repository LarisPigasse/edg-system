// src/core/components/data/stat-tile/StatTile.tsx

import React from 'react';
import { Card } from '../../layout';
import { Skeleton } from '../../feedback';

export type StatTileTone = 'default' | 'success' | 'danger' | 'warning';

const TONE_TEXT_CLASSES: Record<StatTileTone, string> = {
  default: 'text-text-primary',
  success: 'text-text-success',
  danger: 'text-text-danger',
  warning: 'text-text-warning',
};

export interface StatTileProps {
  /** Il numero (o valore) grande mostrato nel riquadro. */
  value: React.ReactNode;
  /** Etichetta breve sotto il numero (es. "Attivi"). */
  label: string;
  /** Colore del numero — comunica lo stato del dato (es. 'success' per un conteggio positivo, 'warning'/'danger' per uno che richiede attenzione). */
  tone?: StatTileTone;
  loading?: boolean;
}

/**
 * Riquadro quadrato compatto (80×80) per un numero + un'etichetta, pensato
 * per lo slot `actions` di PageHeader — sempre prima del pulsante di
 * refresh, sulla stessa riga del titolo, senza consumare spazio verticale
 * extra come farebbe una riga di StatCard sotto l'header. Su schermi
 * stretti PageHeader va a capo da solo (flex-wrap).
 *
 * @example
 * <PageHeader
 *   title='Account'
 *   onRefresh={refetch}
 *   actions={
 *     <>
 *       <StatTile value={stats.total} label='Totale' />
 *       <StatTile value={stats.active} label='Attivi' tone='success' />
 *     </>
 *   }
 * />
 */
export const StatTile: React.FC<StatTileProps> = ({ value, label, tone = 'default', loading }) => {
  if (loading) {
    return (
      <Card
        variant='default'
        padding='none'
        rounded='md'
        className='flex h-16 w-20 flex-col items-center justify-center gap-1 p-1'
      >
        <Skeleton className='h-6 w-10' />
        <Skeleton className='h-2 w-12' />
      </Card>
    );
  }

  return (
    <Card
      variant='default'
      padding='none'
      rounded='md'
      className='flex h-16 w-20 flex-col items-center justify-center p-1 gap-0 text-center'
    >
      <span className={`text-2xl font-bold leading-none ${TONE_TEXT_CLASSES[tone]}`}>
        {typeof value === 'number' ? value.toLocaleString('it-IT') : value}
      </span>
      <span className='mt-1 text-xs leading-tight text-text-secondary'>{label}</span>
    </Card>
  );
};

export default StatTile;
