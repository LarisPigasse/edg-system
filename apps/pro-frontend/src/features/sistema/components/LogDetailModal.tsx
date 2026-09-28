// src/features/sistema/components/LogDetailModal.tsx
import React from 'react';
import { DetailModal, Badge, type DetailSection } from '@edg/ui';

import type { AzioneLog } from '../types';
import {
  categoriaLabel,
  esitoBadgeVariant,
  esitoLabel,
  formatDateTime,
  formatJson,
  originAccountId,
  originEmail,
  originTenantId,
  severityBadgeVariant,
  severityLabel,
} from '../utils/logsFormat';
import { useTenantDirectory } from '../../base/api/useTenantDirectory';
import { useAccountDirectory } from '../../base/api/useAccountDirectory';
import { useEntityDirectory } from '../api/useEntityDirectory';

interface LogDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  log: AzioneLog | null;
}

/** Blocco JSON grezzo per i campi che non si prestano a una singola riga (dettagli, stato, metadata). */
const JsonBlock: React.FC<{ value: unknown }> = ({ value }) => {
  const text = formatJson(value);
  if (text === '—') return <span>—</span>;
  return (
    <pre className='w-full max-w-full overflow-x-auto rounded bg-bg-secondary p-3 text-xs font-mono whitespace-pre-wrap break-all text-text-primary'>
      {text}
    </pre>
  );
};

/**
 * Scheda di sola lettura per un evento di audit trail — nessun onEdit: i
 * log li scrivono i servizi via POST /azione (apiKeyAuth), non sono
 * modificabili da qui. Le sezioni ricalcano la struttura di AzioneLog
 * (vedi types/index.ts); Stato, Metadata e Tag compaiono solo se il log
 * porta davvero quel dato, per non riempire la scheda di sezioni vuote.
 */
const LogDetailModal: React.FC<LogDetailModalProps> = ({ isOpen, onClose, log }) => {
  // Chiamati prima dell'early return sotto: le regole degli hook impongono lo
  // stesso ordine ad ogni render, anche quando log è null.
  const { getTenantName } = useTenantDirectory();
  const { getAccount } = useAccountDirectory();
  const { getShortLabel: getEntityLabel } = useEntityDirectory();

  if (!log) return null;

  const account = getAccount(originAccountId(log) ?? null);
  const utenteNome = account ? getEntityLabel(account.accountType, account.entityId) : null;

  const hasStato = Boolean(log.stato && (log.stato.precedente || log.stato.nuovo || log.stato.diff));
  const hasMetadata = Boolean(log.metadata && Object.keys(log.metadata).length > 0);
  const hasDettagliAzione = Boolean(log.azione.dettagli && Object.keys(log.azione.dettagli).length > 0);
  const hasTags = log.tags.length > 0;

  const sections: DetailSection[] = [
    {
      title: 'Evento',
      fields: [
        { label: 'Quando', value: formatDateTime(log.timestamp) },
        { label: 'Categoria', value: <Badge variant='default'>{categoriaLabel(log.categoria)}</Badge> },
        {
          label: 'Criticità',
          value: <Badge variant={severityBadgeVariant(log.criticita)}>{severityLabel(log.criticita)}</Badge>,
        },
        {
          label: 'Esito',
          value: <Badge variant={esitoBadgeVariant(log.risultato.esito)}>{esitoLabel(log.risultato.esito)}</Badge>,
        },
        ...(log.risultato.messaggio ? [{ label: 'Messaggio', value: log.risultato.messaggio as React.ReactNode }] : []),
        { label: 'Ambiente', value: log.contesto.ambiente },
      ],
    },
    {
      title: 'Origine e azione',
      fields: [
        { label: 'Origine', value: `${log.origine.tipo === 'utente' ? 'Utente' : 'Sistema'} · ${log.origine.id}` },
        ...(utenteNome ? [{ label: 'Utente', value: utenteNome as React.ReactNode }] : []),
        ...(originEmail(log) ? [{ label: 'Account', value: originEmail(log) as React.ReactNode }] : []),
        ...(getTenantName(originTenantId(log) ?? null)
          ? [{ label: 'Tenant', value: getTenantName(originTenantId(log) ?? null) as React.ReactNode }]
          : []),
        { label: 'Entità', value: log.azione.entita },
        { label: 'ID entità', value: log.azione.idEntita },
        { label: 'Operazione', value: log.azione.operazione },
        ...(hasDettagliAzione ? [{ label: 'Dettagli', value: <JsonBlock value={log.azione.dettagli} /> }] : []),
      ],
    },
    {
      title: 'Contesto',
      fields: [
        { label: 'Transazione', value: log.contesto.transazioneId ?? '—' },
        { label: 'Sessione', value: log.contesto.sessione ?? '—' },
        { label: 'IP', value: log.contesto.ip ?? '—' },
        { label: 'User agent', value: log.contesto.userAgent ?? '—' },
      ],
    },
  ];

  if (hasStato) {
    sections.push({
      title: 'Stato',
      fields: [
        { label: 'Precedente', value: <JsonBlock value={log.stato.precedente} /> },
        { label: 'Nuovo', value: <JsonBlock value={log.stato.nuovo} /> },
        { label: 'Diff', value: <JsonBlock value={log.stato.diff} /> },
      ],
    });
  }

  if (hasMetadata) {
    sections.push({
      title: 'Metadata',
      fields: [{ label: 'Dati', value: <JsonBlock value={log.metadata} /> }],
    });
  }

  if (hasTags) {
    sections.push({
      title: 'Tag',
      fields: [
        {
          label: 'Tag',
          value: (
            <div className='flex flex-wrap gap-1'>
              {log.tags.map(tag => (
                <Badge key={tag} variant='default'>
                  {tag}
                </Badge>
              ))}
            </div>
          ),
        },
      ],
    });
  }

  return (
    <DetailModal isOpen={isOpen} onClose={onClose} title={`${log.azione.entita} · ${log.azione.operazione}`} sections={sections} size='xxl' />
  );
};

export default LogDetailModal;
