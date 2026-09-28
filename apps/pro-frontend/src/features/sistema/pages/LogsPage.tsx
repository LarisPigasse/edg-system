// src/features/sistema/pages/LogsPage.tsx
import React, { useCallback, useEffect, useState } from 'react';
import { PageHeader, Table, Badge, StatTile, useToast, type TableColumn, type SelectOption } from '@edg/ui';

import { cercaLogs, getLogStatistiche, getLogUtenti } from '../api/logsApi';
import LogFilters, { EMPTY_LOG_FILTERS, type LogFiltersValue } from '../components/LogFilters';
import LogDetailModal from '../components/LogDetailModal';
import LogsPager from '../components/LogsPager';
import {
  categoriaLabel,
  esitoBadgeVariant,
  esitoLabel,
  formatDateTime,
  originAccountId,
  originEmail,
  originTenantId,
  severityBadgeVariant,
  severityLabel,
} from '../utils/logsFormat';
import type { AzioneLog, LogSearchParams, LogStatistiche } from '../types';
import { useDebouncedValue } from '../../../shared/hooks/useDebouncedValue';
import { useTenantDirectory } from '../../base/api/useTenantDirectory';
import { useAccountDirectory } from '../../base/api/useAccountDirectory';
import { useEntityDirectory } from '../api/useEntityDirectory';

/** 64, non 50 (il default del backend se `limit` fosse omesso): qui è sempre esplicito. */
const PAGE_SIZE = 64;

const LogsPage: React.FC = () => {
  const toast = useToast();
  const { tenants, getTenantName } = useTenantDirectory();
  const { getAccount } = useAccountDirectory();
  const { getShortLabel: getEntityLabel } = useEntityDirectory();

  const [filters, setFilters] = useState<LogFiltersValue>(EMPTY_LOG_FILTERS);
  const debouncedSearch = useDebouncedValue(filters.search);
  const [page, setPage] = useState(0);

  const [logs, setLogs] = useState<AzioneLog[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const [stats, setStats] = useState<LogStatistiche | null>(null);
  const [utenti, setUtenti] = useState<string[]>([]);
  const [selectedLog, setSelectedLog] = useState<AzioneLog | null>(null);

  // Utenti distinti per il filtro: caricati una volta sola, non dipendono dai filtri correnti.
  useEffect(() => {
    getLogUtenti()
      .then(setUtenti)
      .catch(() => setUtenti([]));
  }, []);

  // Etichette leggibili per il filtro Utente: stessa risoluzione della
  // colonna Utente in tabella (account → entityId/accountType → nome), con
  // fallback su email e infine sull'id grezzo (per le voci 'sistema' come
  // "auth-service", che non sono account e restano quindi mostrate così).
  const utenteFilterOptions: SelectOption[] = utenti.map(id => {
    const numericId = Number(id);
    const account = Number.isFinite(numericId) ? getAccount(numericId) : null;
    const nome = account ? getEntityLabel(account.accountType, account.entityId) : null;
    return { value: id, label: nome ?? account?.email ?? id };
  });

  const tenantFilterOptions: SelectOption[] = tenants.map(t => ({ value: String(t.id), label: t.name }));

  const buildParams = useCallback(
    (): Omit<LogSearchParams, 'page' | 'limit'> => ({
      search: debouncedSearch || undefined,
      categoria: filters.categoria || undefined,
      criticita: filters.criticita || undefined,
      esito: filters.esito || undefined,
      userId: filters.userId || undefined,
      tenantId: filters.tenantId || undefined,
      startDate: filters.startDate?.toISOString(),
      endDate: filters.endDate?.toISOString(),
    }),
    [
      debouncedSearch,
      filters.categoria,
      filters.criticita,
      filters.esito,
      filters.userId,
      filters.tenantId,
      filters.startDate,
      filters.endDate,
    ]
  );

  const loadLogs = useCallback(() => {
    setIsLoading(true);
    cercaLogs({ ...buildParams(), page, limit: PAGE_SIZE })
      .then(res => {
        setLogs(res.logs);
        setTotalCount(res.totalCount);
        setTotalPages(res.totalPages);
      })
      .catch(err => {
        toast?.danger({ title: 'Impossibile caricare i log', description: (err as Error).message });
      })
      .finally(() => setIsLoading(false));
  }, [buildParams, page, toast]);

  // Statistiche di riepilogo: stessi filtri di loadLogs ma senza paginazione — vedi
  // il commento su LogStatistiche.bySeverity in types/index.ts prima di usare quel
  // campo: qui mostriamo solo total/criticalEvents/lastHourEvents, non affetti dal bug.
  const loadStats = useCallback(() => {
    getLogStatistiche(buildParams())
      .then(setStats)
      .catch(() => {
        setStats(null);
      });
  }, [buildParams]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const handleFiltersChange = (patch: Partial<LogFiltersValue>) => {
    setFilters(f => ({ ...f, ...patch }));
    setPage(0);
  };

  const handleReset = () => {
    setFilters(EMPTY_LOG_FILTERS);
    setPage(0);
  };

  const handleRefresh = () => {
    loadLogs();
    loadStats();
  };

  const columns: TableColumn<AzioneLog>[] = [
    { header: 'Quando', accessor: item => formatDateTime(item.timestamp) },
    { header: 'Categoria', accessor: item => <Badge variant='default'>{categoriaLabel(item.categoria)}</Badge> },
    {
      header: 'Criticità',
      accessor: item => <Badge variant={severityBadgeVariant(item.criticita)}>{severityLabel(item.criticita)}</Badge>,
    },
    {
      // Colonna cliccabile per aprire il dettaglio — stesso schema di
      // AnagrafichePage (clickable + onCellClick sulla colonna "nome").
      // Solo l'operazione: l'entità coinvolta si vede già aprendo il
      // dettaglio, qui serve spazio per le colonne Utente/Tenant/Account.
      header: 'Azione',
      accessor: item => item.azione.operazione,
      clickable: true,
      onCellClick: item => setSelectedLog(item),
    },
    {
      header: 'Esito',
      accessor: item => <Badge variant={esitoBadgeVariant(item.risultato.esito)}>{esitoLabel(item.risultato.esito)}</Badge>,
    },
    {
      // Nome dell'operatore o ragione sociale collegati all'account (via
      // Account.entityId + Account.accountType, risolti da
      // useEntityDirectory) — non l'email, quella è nella colonna Account.
      // '—' se l'account non è collegato a nessuna anagrafica/operatore
      // (es. account di sistema) o se il log è troppo vecchio per avere
      // origine.id come account valido.
      header: 'Utente',
      accessor: item => {
        const account = getAccount(originAccountId(item) ?? null);
        const nome = account ? getEntityLabel(account.accountType, account.entityId) : null;
        return nome ?? '—';
      },
    },
    {
      header: 'Tenant',
      accessor: item => getTenantName(originTenantId(item) ?? null) ?? '—',
    },
    {
      // L'email dell'account, così com'era al momento dell'evento — quella
      // effettivamente usata per il login, non quella corrente se nel
      // frattempo è cambiata.
      header: 'Account',
      accessor: item => originEmail(item) ?? item.origine.id,
    },
  ];

  return (
    <div className='space-y-6'>
      <PageHeader
        title='Logs'
        subtitle='Registro eventi (audit trail) di tutta la piattaforma'
        onRefresh={handleRefresh}
        isLoading={isLoading}
        actions={
          stats && (
            <>
              <StatTile value={stats.total} label='Eventi' />
              <StatTile value={stats.criticalEvents} label='Critici' tone={stats.criticalEvents > 0 ? 'danger' : 'default'} />
              <StatTile value={stats.lastHourEvents} label='Ultima ora' tone='warning' />
            </>
          )
        }
      />

      <LogFilters
        value={filters}
        onChange={handleFiltersChange}
        onReset={handleReset}
        utenteOptions={utenteFilterOptions}
        tenantOptions={tenantFilterOptions}
      />

      <Table
        data={logs}
        columns={columns}
        keyExtractor={item => item._id}
        isLoading={isLoading}
        emptyMessage='Nessun evento trovato con questi filtri'
        striped
        hoverable
      />

      <LogsPager
        page={page}
        totalPages={totalPages}
        totalCount={totalCount}
        isLoading={isLoading}
        onPrev={() => setPage(p => Math.max(0, p - 1))}
        onNext={() => setPage(p => p + 1)}
      />

      <LogDetailModal isOpen={!!selectedLog} onClose={() => setSelectedLog(null)} log={selectedLog} />
    </div>
  );
};

export default LogsPage;
