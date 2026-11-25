// src/features/sistema/components/tenant/UsoTenantModal.tsx
//
// "Uso" di un tenant (fase 2 dei log, ADR117): che cosa fanno le persone del
// cliente nei moduli nel periodo scelto — per modulo (accessi, consultazioni,
// modifiche, persone) e per persona — con il personale EDG in accesso
// assistito a parte, perché non è uso del cliente. "Vedi nei Logs" apre la
// pagina Logs filtrata sul tenant. Dati da log-service (GET /api/log/uso).
// Spazio verticale contenuto (regola dell'utente): periodo e note su una riga,
// moduli in riquadri affiancati, persone in tabella compatta.
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Badge, Button, Modal, Select, Table, relativeTime, useMediaQuery, type TableColumn } from '@edg/ui';

import { ROUTES } from '../../../../config';
import { useAccountDirectory } from '../../../base/api/useAccountDirectory';
import { useEntityDirectory } from '../../api/useEntityDirectory';
import { PERIODI_USO, PERIODO_USO_PREDEFINITO } from '../../constants/uso';
import { useModuleOptions } from '../../hooks/useModuleOptions';
import { useUsoTenant } from '../../hooks/useUsoTenant';
import type { Tenant } from '../../types';
import type { UsoModulo, UsoPersona } from '../../types/uso';

interface UsoTenantModalProps {
  /** Il tenant di cui mostrare l'uso; null = finestra chiusa */
  tenant: Tenant | null;
  onClose: () => void;
}

const giorno = (iso: string) => new Date(iso).toLocaleDateString('it-IT');
const dataOra = (iso: string) => new Date(iso).toLocaleString('it-IT', { dateStyle: 'short', timeStyle: 'short' });

/** "oggi alle 16:19", "ieri alle…", "16 ott"; la data completa al passaggio del mouse */
const Quando: React.FC<{ iso: string | null }> = ({ iso }) =>
  iso ? <span title={dataOra(iso)}>{relativeTime(iso)}</span> : <span className='text-text-secondary'>—</span>;

const Numero: React.FC<{ etichetta: string; valore: number }> = ({ etichetta, valore }) => (
  <div className='text-right'>
    <dt className='text-xs text-text-secondary'>{etichetta}</dt>
    <dd className='text-lg font-semibold tabular-nums'>{valore}</dd>
  </div>
);

const RiquadroModulo: React.FC<{ m: UsoModulo; nome: string }> = ({ m, nome }) => (
  <div className='rounded-lg border border-border-default px-4 py-3'>
    <div className='flex items-baseline justify-between gap-2'>
      <span className='font-medium'>{nome}</span>
      <span className='text-xs text-text-secondary'>
        ultimo accesso <Quando iso={m.ultimoAccesso} />
      </span>
    </div>
    <dl className='mt-2 grid grid-cols-4 gap-2'>
      <Numero etichetta='Accessi' valore={m.accessi} />
      <Numero etichetta='Consultazioni' valore={m.consultazioni} />
      <Numero etichetta='Modifiche' valore={m.modifiche} />
      <Numero etichetta='Persone' valore={m.persone} />
    </dl>
  </div>
);

const UsoTenantModal: React.FC<UsoTenantModalProps> = ({ tenant, onClose }) => {
  const [giorni, setGiorni] = useState(PERIODO_USO_PREDEFINITO);
  const { uso, errore, caricamento } = useUsoTenant(tenant?.id ?? null, giorni);
  const { getModuleName } = useModuleOptions();
  const { getAccount } = useAccountDirectory();
  const { getShortLabel } = useEntityDirectory();
  const navigate = useNavigate();
  // tre misure: tutte le colonne; senza Login e Moduli; i tre conteggi in una colonna sola (telefono)
  const larga = useMediaQuery('(min-width: 1024px)');
  const media = useMediaQuery('(min-width: 640px)');

  // ogni tenant si apre sul periodo predefinito
  useEffect(() => {
    if (tenant) setGiorni(PERIODO_USO_PREDEFINITO);
  }, [tenant]);

  const nomePersona = (p: UsoPersona): string | null => {
    const a = getAccount(Number(p.accountId));
    return a ? getShortLabel(a.accountType, a.entityId) : null;
  };

  const colonne: TableColumn<UsoPersona>[] = [
    {
      header: 'Persona',
      accessor: p => {
        const nome = nomePersona(p);
        return (
          <div className='min-w-0' title={[nome, p.email].filter(Boolean).join(' · ') || undefined}>
            <div className='truncate'>{nome ?? p.email ?? `account ${p.accountId}`}</div>
            {nome && p.email && <div className='truncate text-xs text-text-secondary'>{p.email}</div>}
          </div>
        );
      },
    },
    { header: 'Ultimo uso', className: media ? 'w-36' : 'w-28', accessor: p => <Quando iso={p.ultimoUso} /> },
    ...(media
      ? ([
          { header: 'Accessi', className: 'w-24', align: 'right', accessor: p => p.accessi },
          { header: 'Consultazioni', className: 'w-32', align: 'right', accessor: p => p.consultazioni },
          { header: 'Modifiche', className: 'w-24', align: 'right', accessor: p => p.modifiche },
        ] as TableColumn<UsoPersona>[])
      : ([
          {
            header: 'Acc. · Cons. · Mod.',
            className: 'w-36',
            align: 'right',
            accessor: p => <span className='tabular-nums'>{`${p.accessi} · ${p.consultazioni} · ${p.modifiche}`}</span>,
          },
        ] as TableColumn<UsoPersona>[])),
    ...(larga
      ? ([
          { header: 'Login', className: 'w-20', align: 'right', accessor: p => p.login },
          { header: 'Moduli', className: 'w-36', accessor: p => p.moduli.map(m => getModuleName(m)).join(', ') || '—' },
        ] as TableColumn<UsoPersona>[])
      : []),
  ];

  const vediLogs = () => {
    if (!tenant) return;
    onClose();
    navigate(`${ROUTES.SISTEMA_LOGS}?tenantId=${tenant.id}`);
  };

  const a = uso?.assistenza;

  return (
    <Modal
      isOpen={!!tenant}
      onClose={onClose}
      title={`Uso — ${tenant?.name ?? ''}`}
      description='Accessi, consultazioni e modifiche delle persone del cliente nei moduli'
      size='xxl'
      footer={
        <div className='flex justify-between gap-3'>
          <Button variant='outline' onClick={vediLogs}>
            Vedi nei Logs
          </Button>
          <Button variant='outline' onClick={onClose}>
            Chiudi
          </Button>
        </div>
      }
    >
      <div className='space-y-4'>
        <div className='flex flex-wrap items-end gap-x-4 gap-y-2'>
          <div className='w-48'>
            <Select label='Periodo' options={PERIODI_USO} value={String(giorni)} onValueChange={v => setGiorni(Number(v))} optionSize='sm' />
          </div>
          {uso && (
            <span className='pb-2 text-sm text-text-secondary'>
              dal {giorno(uso.dal)} al {giorno(uso.al)}
            </span>
          )}
        </div>

        {errore && (
          <Alert variant='danger' title='Riepilogo non disponibile'>
            {errore}
          </Alert>
        )}

        {uso && uso.moduli.length > 0 && (
          <div className='grid gap-3 lg:grid-cols-2'>
            {uso.moduli.map(m => (
              <RiquadroModulo key={m.modulo} m={m} nome={getModuleName(m.modulo)} />
            ))}
          </div>
        )}
        {uso && uso.moduli.length === 0 && <p className='text-sm text-text-secondary'>Nessun uso dei moduli in questo periodo.</p>}

        {a && a.eventi > 0 && (
          <p className='flex flex-wrap items-center gap-2 text-sm text-text-secondary'>
            <Badge size='xs' variant='info'>
              Assistenza EDG
            </Badge>
            <span>
              {a.accessi} {a.accessi === 1 ? 'accesso' : 'accessi'} e {a.consultazioni} {a.consultazioni === 1 ? 'consultazione' : 'consultazioni'}
              {a.operatori.length > 0 && <> di {a.operatori.join(', ')}</>}, l&apos;ultimo <Quando iso={a.ultimo} />: non contano come uso del cliente.
            </span>
          </p>
        )}

        <Table
          data={uso?.persone ?? []}
          columns={colonne}
          keyExtractor={p => p.accountId}
          isLoading={caricamento && !uso}
          emptyMessage='Nessuna persona ha usato la piattaforma in questo periodo'
          size='xs'
          fit
          striped
        />
      </div>
    </Modal>
  );
};

export default UsoTenantModal;
