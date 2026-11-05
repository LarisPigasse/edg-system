// src/features/vigilo/components/spese/EsportaSpese.tsx
//
// "Esporta" nella vista Spese e consumi: il PDF del resoconto mostrato (lo
// genera il browser con i dati già letti) e il CSV delle spese del periodo
// per Excel (lo genera il servizio con gli stessi filtri). Spento finché non
// ci sono dati o il periodo personalizzato è incompleto.
import React, { useState } from 'react';
import { ActionMenu, Button, Download, File, FileText, useToast } from '@edg/ui';

import { scaricaCsvSpese } from '../../api/resoconti';
import type { StatoSpese } from '../../hooks/useSpese';
import type { CostoMezzi } from '../../types/costoMezzi';
import type { RiferimentoSoggetto } from '../../types/scadenze';
import { esportaPdfSpese } from '../../utils/pdfSpese';

export const EsportaSpese: React.FC<{ s: StatoSpese; sedi: RiferimentoSoggetto[]; mezzi?: CostoMezzi | null }> = ({ s, sedi, mezzi }) => {
  const toast = useToast();
  const [csvInCorso, setCsvInCorso] = useState(false);
  const pronto = !!s.dati && !s.avvisoDate;

  const pdf = () => {
    if (!s.dati) return;
    try {
      esportaPdfSpese(s.dati, { tipo: s.filtri.tipo, sede: sedi.find(x => x.uuid === s.filtri.sede)?.nome, testo: s.richiesta.testo }, mezzi);
    } catch (e) {
      toast?.danger({ title: 'PDF non creato', description: (e as Error).message });
    }
  };

  const csv = async () => {
    setCsvInCorso(true);
    try {
      await scaricaCsvSpese(s.richiesta);
    } catch (e) {
      toast?.danger({ title: 'CSV non scaricato', description: (e as Error).message });
    } finally {
      setCsvInCorso(false);
    }
  };

  return (
    <ActionMenu
      align='end'
      disabled={!pronto || csvInCorso}
      actions={[
        { id: 'pdf', label: 'PDF del resoconto', icon: <FileText className='h-4 w-4' />, onClick: pdf },
        { id: 'csv', label: 'CSV delle spese (Excel)', icon: <File className='h-4 w-4' />, onClick: () => void csv() },
      ]}
      trigger={
        <Button variant='secondary' size='sm' leftIcon={<Download className='h-4 w-4' />} isLoading={csvInCorso} loadingText='Preparo…' disabled={!pronto}>
          Esporta
        </Button>
      }
    />
  );
};
