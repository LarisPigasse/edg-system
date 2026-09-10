// src/core/components/ui/detail-modal/DetailModal.tsx
import React from 'react';
import { Modal, Button } from '..';
import type { ModalSize } from '../modal/Modal';
import { cn } from '../../../utils';

/** Una singola coppia etichetta/valore mostrata nella scheda. */
export interface DetailField {
  /** Etichetta del campo (es. "Partita IVA"). */
  label: string;
  /** Valore da mostrare — testo, un Badge, o qualsiasi ReactNode. `null`/`undefined` mostrano un trattino. */
  value: React.ReactNode;
}

/** Un gruppo di campi, con un titolo di sezione opzionale. */
export interface DetailSection {
  /** Titolo della sezione (es. "Contatti"). Omesso: i campi si susseguono senza intestazione. */
  title?: string;
  fields: DetailField[];
}

interface DetailModalProps {
  /** Stato aperto/chiuso del modal */
  isOpen: boolean;
  /** Callback per chiusura modal */
  onClose: () => void;
  /** Titolo del modal (in genere il nome del record) — è l'unica cosa mostrata nell'header: ogni altra informazione (tipo, stato, ...) va in una sezione. */
  title: string;
  /** Contenuto della scheda, organizzato in sezioni */
  sections: DetailSection[];
  /** Dimensione del modal (default 'xxl' — larga, per ospitare più campi per riga) */
  size?: ModalSize;
  /** Se presente, mostra un pulsante "Modifica" nel footer che apre il form di modifica */
  onEdit?: () => void;
  /** Testo del pulsante di modifica (default "Modifica") */
  editLabel?: string;
}

/**
 * Scheda di sola lettura con tutti i campi di un record, organizzati in
 * sezioni a griglia. Convenzione condivisa: si apre cliccando sulla colonna
 * "nome" di una riga di Table (colonna con `clickable` + `onCellClick`),
 * per i record la cui riga in elenco non mostra già tutti i campi.
 */
const DetailModal: React.FC<DetailModalProps> = ({
  isOpen,
  onClose,
  title,
  sections,
  size = 'xl',
  onEdit,
  editLabel = 'Modifica',
}) => {
  const footer = (
    <div className='flex items-center justify-end gap-3'>
      <Button variant='outline' onClick={onClose}>
        Chiudi
      </Button>
      {onEdit && (
        <Button variant='primary' onClick={onEdit}>
          {editLabel}
        </Button>
      )}
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      titleClassName='text-lg font-semibold text-text-title'
      size={size}
      footer={footer}
    >
      <div className='space-y-4'>
        {sections.map((section, sectionIndex) => (
          <div key={sectionIndex} className={cn(sectionIndex > 0 && 'pt-4 border-t border-border-default')}>
            <div className='flex flex-col gap-2'>
              {section.fields.map((field, fieldIndex) => (
                <div key={fieldIndex} className='flex items-baseline gap-2 min-w-0'>
                  <span className='text-sm text-text-secondary shrink-0'>{field.label}:</span>
                  <span className='text-sm text-text-primary font-medium wrap-break-word min-w-0'>{field.value ?? '—'}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
};

export default DetailModal;
