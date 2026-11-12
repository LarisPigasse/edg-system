// src/features/vigilo/components/MenuEsporta.tsx
//
// Il pulsante "Esporta" degli elenchi di Vigilo (report, 2026-11-12): un menu
// con il PDF e, se c'è, il CSV per Excel. Mentre si prepara il file dice
// "Preparo…"; spento quando non c'è niente da esportare. Chi lo usa passa
// solo le azioni: leggere le righe e generare i file è compito del suo hook.
// Per i report che non sono un elenco (Configurazione) si passano `voci`.
// Sotto i 640 px resta l'icona (con l'etichetta per i lettori di schermo),
// per lasciare spazio al titolo della pagina.
import React from 'react';
import { ActionMenu, Button, Download, File, FileText, type ButtonSize } from '@edg/ui';

/** Una voce libera del menu (es. "Controlli non seguiti") */
export interface VoceEsporta {
  id: string;
  label: string;
  onClick: () => void;
}

interface Props {
  onPdf?: () => void;
  onCsv?: () => void;
  /** Etichette delle voci (predefinite "PDF" e "CSV (Excel)") */
  etichettaPdf?: string;
  etichettaCsv?: string;
  /** Altre voci, dopo PDF e CSV (con l'icona del documento) */
  voci?: VoceEsporta[];
  inCorso?: boolean;
  disabilitato?: boolean;
  size?: ButtonSize;
}

export const MenuEsporta: React.FC<Props> = ({
  onPdf,
  onCsv,
  etichettaPdf = 'PDF',
  etichettaCsv = 'CSV (Excel)',
  voci = [],
  inCorso = false,
  disabilitato = false,
  size = 'md',
}) => {
  const azioni = [
    ...(onPdf ? [{ id: 'pdf', label: etichettaPdf, icon: <FileText className='h-4 w-4' />, onClick: onPdf }] : []),
    ...(onCsv ? [{ id: 'csv', label: etichettaCsv, icon: <File className='h-4 w-4' />, onClick: onCsv }] : []),
    ...voci.map(v => ({ ...v, icon: <FileText className='h-4 w-4' /> })),
  ];
  const spento = disabilitato || inCorso || !azioni.length;
  return (
    <ActionMenu
      align='end'
      disabled={spento}
      actions={azioni}
      trigger={
        <Button variant='outline' size={size} isLoading={inCorso} loadingText='Preparo…' disabled={spento} aria-label='Esporta' title='Esporta'>
          {/* icona ed etichetta insieme: sotto i 640 px resta l'icona, centrata */}
          <span className='flex items-center gap-2'>
            <Download className='h-4 w-4' aria-hidden='true' />
            <span className='hidden sm:inline'>Esporta</span>
          </span>
        </Button>
      }
    />
  );
};
