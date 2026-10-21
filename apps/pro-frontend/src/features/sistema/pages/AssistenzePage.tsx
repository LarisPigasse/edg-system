// src/features/sistema/pages/AssistenzePage.tsx
//
// Accessi assistiti (ADR085): chi del personale EDG è entrato in quale tenant,
// perché e come è finita. Le sessioni aperte si possono chiudere da qui: la
// scheda assistita smette subito di funzionare.
import React, { useCallback, useEffect, useState } from 'react';
import { Badge, ConfirmModal, PageHeader, Select, StatTile, Table, useToast, LogOut, type TableColumn } from '@edg/ui';

import { assistenzaApi } from '../api/assistenzaApi';
import { MODO_LABEL, STATO_LABEL, formatDataOra } from '../utils/assistenza';
import type { Assistenza, StatoAssistenza } from '../types/assistenza';

type Filtro = 'aperte' | 'tutte';

const FILTRI = [
  { value: 'aperte', label: 'Aperte' },
  { value: 'tutte', label: 'Tutte (ultime 64)' },
];

const BADGE: Record<StatoAssistenza, 'success' | 'default' | 'warning'> = {
  aperta: 'success',
  uscita: 'default',
  scaduta: 'default',
  chiusa: 'warning',
};

const AssistenzePage: React.FC = () => {
  const toast = useToast();
  const [filtro, setFiltro] = useState<Filtro>('aperte');
  const [righe, setRighe] = useState<Assistenza[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [daChiudere, setDaChiudere] = useState<Assistenza | null>(null);
  const [isClosing, setIsClosing] = useState(false);

  const carica = useCallback(() => {
    setIsLoading(true);
    assistenzaApi
      .elenco(filtro === 'aperte')
      .then(res => setRighe(res.data ?? []))
      .catch(err => toast?.danger({ title: 'Impossibile caricare gli accessi assistiti', description: (err as Error).message }))
      .finally(() => setIsLoading(false));
  }, [filtro, toast]);

  useEffect(() => {
    carica();
  }, [carica]);

  const handleChiudi = async () => {
    if (!daChiudere) return;
    setIsClosing(true);
    try {
      await assistenzaApi.chiudi(daChiudere.id);
      toast?.({ title: 'Accesso assistito chiuso' });
      carica();
    } catch (err) {
      toast?.danger({ title: 'Errore nella chiusura', description: (err as Error).message });
    } finally {
      setIsClosing(false);
      setDaChiudere(null);
    }
  };

  const aperte = righe.filter(r => r.stato === 'aperta').length;

  const columns: TableColumn<Assistenza>[] = [
    {
      header: 'Operatore',
      accessor: item => (
        <div>
          <div className='text-text-primary'>{item.operatore?.nome ?? '—'}</div>
          <div className='text-xs text-text-secondary'>{item.operatore?.email}</div>
        </div>
      ),
    },
    { header: 'Tenant', accessor: item => item.tenant?.nome ?? '—' },
    { header: 'Modalità', accessor: item => MODO_LABEL[item.modo] ?? item.modo },
    {
      header: 'Motivo',
      accessor: item => (
        <span className='line-clamp-2 max-w-64' title={item.motivo}>
          {item.motivo}
        </span>
      ),
    },
    { header: 'Inizio', accessor: item => formatDataOra(item.inizio) },
    {
      header: 'Fine',
      accessor: item => (item.stato === 'aperta' ? `scade ${formatDataOra(item.scade)}` : formatDataOra(item.fine)),
    },
    { header: 'Stato', accessor: item => <Badge variant={BADGE[item.stato]}>{STATO_LABEL[item.stato]}</Badge> },
  ];

  return (
    <div className='space-y-6'>
      <PageHeader
        title='Accessi assistiti'
        subtitle='Il personale EDG nei tenant dei clienti'
        onRefresh={carica}
        isLoading={isLoading}
        actions={<StatTile value={aperte} label='Aperti' />}
      />

      <div className='w-56'>
        <Select label='Mostra' options={FILTRI} value={filtro} onValueChange={v => setFiltro(v as Filtro)} />
      </div>

      <Table
        data={righe}
        columns={columns}
        keyExtractor={item => item.id}
        isLoading={isLoading}
        emptyMessage={filtro === 'aperte' ? 'Nessun accesso assistito aperto' : 'Nessun accesso assistito'}
        striped
        hoverable
        rowActions={{
          enabled: true,
          actions: item =>
            item.stato === 'aperta'
              ? [
                  {
                    id: 'chiudi',
                    label: 'Chiudi',
                    icon: <LogOut className='w-4 h-4' />,
                    variant: 'danger',
                    onClick: () => setDaChiudere(item),
                  },
                ]
              : [],
        }}
      />

      <ConfirmModal
        isOpen={!!daChiudere}
        onClose={() => setDaChiudere(null)}
        onConfirm={handleChiudi}
        isLoading={isClosing}
        title='Chiudi accesso assistito'
        message={`Chiudere l'accesso di ${daChiudere?.operatore?.nome ?? ''} nel tenant «${daChiudere?.tenant?.nome ?? ''}»? La sua scheda smette subito di funzionare.`}
        variant='danger'
        confirmText='Chiudi'
      />
    </div>
  );
};

export default AssistenzePage;
