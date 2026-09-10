// src/core/components/ui/technical-details-modal/TechnicalDetailsModal.tsx
import React from 'react';
import { Modal } from '..';

interface TechnicalDetailsModalProps {
  /** Stato aperto/chiuso del modal */
  isOpen: boolean;
  /** Callback per chiusura modal */
  onClose: () => void;
  /** Titolo del modal (default "Dati tecnici") */
  title?: string;
  /** Il record grezzo: ogni proprietà propria diventa una riga chiave/valore, senza alcuna curatela */
  record: Record<string, unknown> | null;
}

/** Rende il valore grezzo così com'è, senza alcuna formattazione "amichevole" — è proprio il punto di questo modal. */
const formatValue = (value: unknown): string => {
  if (value === null) return 'null';
  if (value === undefined) return '—';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};

/**
 * Dump grezzo di TUTTI i campi di un record: una colonna, testo minimo,
 * righe compatte, niente etichette curate né formattazione — lo specchio
 * esatto di quello che arriva dall'API. Pensato per uso tecnico (root),
 * mai per l'utente finale: per una scheda leggibile e curata vedi invece
 * DetailModal. Cablato automaticamente da Table su ogni istanza, per
 * l'utente root, tramite TableCapabilitiesProvider — nessuna pagina deve
 * dichiararlo.
 */
const TechnicalDetailsModal: React.FC<TechnicalDetailsModalProps> = ({ isOpen, onClose, title = 'Dati tecnici', record }) => {
  const entries = record ? Object.entries(record) : [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size='sm'>
      <div className='space-y-1 font-mono text-xs'>
        {entries.map(([key, value]) => (
          <div key={key} className='flex gap-2'>
            <span className='text-text-secondary shrink-0'>{key}:</span>
            <span className='text-text-primary break-all'>{formatValue(value)}</span>
          </div>
        ))}
      </div>
    </Modal>
  );
};

export default TechnicalDetailsModal;
