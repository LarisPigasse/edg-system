// src/core/components/layout/PageHeader/PageHeader.tsx

import React from 'react';
import { cn, iconMap } from '../../../utils';
import { Tooltip } from '../../feedback';
import { Button } from '../../ui';

interface PageHeaderProps {
  /** Titolo principale della pagina — accetta string o ReactNode per contenuto formattato */
  title: React.ReactNode;
  /** Sottotitolo descrittivo (opzionale) — accetta string o ReactNode per contenuto formattato */
  subtitle?: React.ReactNode;
  /** Callback per il refresh — se assente, il pulsante non viene mostrato */
  onRefresh?: () => void;
  /** True mentre il dato è in caricamento (fa girare l'icona) */
  isLoading?: boolean;
  /** Area centrale, tra titolo e refresh (es. StatTile, pulsante "Crea", …) — su schermi stretti scende sotto il titolo, mentre il refresh resta sempre alla sua destra */
  actions?: React.ReactNode;
}

/**
 * PageHeader — intestazione di pagina a tre zone: titolo (sinistra), azioni
 * (area centrale) e refresh (sempre a destra del titolo).
 *
 * Layout responsive via CSS Grid:
 * - Da `sm` in su: una riga, 3 colonne — titolo | azioni (centrate) | refresh.
 * - Sotto `sm`: 2 righe — titolo e refresh sulla prima (il refresh non scende
 *   mai insieme alle azioni), le azioni sulla seconda, a piena larghezza.
 *
 * Senza `actions`, la griglia si riduce a titolo + refresh su un'unica riga.
 */
export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, onRefresh, isLoading = false, actions }) => {
  const hasActions = !!actions;

  return (
    <div
      className={cn(
        'mb-4 grid items-center gap-2 border-b border-border-thin pb-2',
        hasActions
          ? cn(
              'grid-cols-[1fr_auto] [grid-template-areas:"title_refresh"_"stats_stats"]',
              'sm:grid-cols-[1fr_auto_1fr] sm:[grid-template-areas:"title_stats_refresh"]'
            )
          : 'grid-cols-[1fr_auto] [grid-template-areas:"title_refresh"]'
      )}
    >
      {/* ── Titolo + sottotitolo ── */}
      <div className='min-w-0 [grid-area:title]'>
        <h1 className='text-page-title'>{title}</h1>
        {subtitle && <p className='text-page-subtitle mt-1'>{subtitle}</p>}
      </div>

      {/* ── Area centrale: azioni — su schermi stretti scende su una riga propria ── */}
      {hasActions && <div className='flex flex-wrap items-center gap-1 [grid-area:stats]'>{actions}</div>}

      {/* ── Refresh: sempre alla destra del titolo, non scende mai con le azioni ── */}
      {onRefresh && (
        <div className='justify-self-end [grid-area:refresh]'>
          <Tooltip content='Aggiorna' side='bottom'>
            <Button variant='secondary' size='md' onClick={onRefresh} disabled={isLoading}>
              <iconMap.refresh className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </Tooltip>
        </div>
      )}
    </div>
  );
};

export default PageHeader;
