// src/features/sistema/components/LogsPager.tsx
import React from 'react';
import { Button, ChevronLeft, ChevronRight } from '@edg/ui';

interface LogsPagerProps {
  /** Pagina corrente, 0-based — stessa convenzione di cercaLogs/logController.ts. */
  page: number;
  totalPages: number;
  totalCount: number;
  isLoading?: boolean;
  onPrev: () => void;
  onNext: () => void;
}

/**
 * Table (packages/ui) non ha paginazione integrata — solo sorting
 * client-side sulla pagina caricata (vedi il commento in Table.tsx: per
 * server-side serve TanStack Table). Con potenzialmente migliaia di eventi,
 * la ricerca log resta paginata lato server (vedi cercaLogs/LogSearchResult):
 * questo controllo, piccolo e locale alla feature, chiude il cerchio senza
 * introdurre una dipendenza pesante solo per una pagina.
 */
const LogsPager: React.FC<LogsPagerProps> = ({ page, totalPages, totalCount, isLoading, onPrev, onNext }) => {
  if (totalCount === 0) return null;

  return (
    <div className='flex items-center justify-between gap-4 text-sm text-text-secondary'>
      <span>
        Pagina {page + 1} di {Math.max(totalPages, 1)} · {totalCount} eventi
      </span>
      <div className='flex gap-2'>
        <Button
          variant='outline'
          size='sm'
          leftIcon={<ChevronLeft className='w-4 h-4' />}
          onClick={onPrev}
          disabled={isLoading || page <= 0}
        >
          Precedente
        </Button>
        <Button
          variant='outline'
          size='sm'
          rightIcon={<ChevronRight className='w-4 h-4' />}
          onClick={onNext}
          disabled={isLoading || page + 1 >= totalPages}
        >
          Successiva
        </Button>
      </div>
    </div>
  );
};

export default LogsPager;
