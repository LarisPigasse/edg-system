// src/core/components/ui/technical-details-modal/TechnicalDetailsModal.data.ts
import type { ComponentData } from '../../../types';

export const technicalDetailsModalData: ComponentData = {
  id: 'technicalDetailsModal',
  title: 'Technical Details Modal',
  description:
    'Dump grezzo di tutti i campi di un record — una colonna, testo minimo, niente etichette curate. Uso tecnico (root), cablato automaticamente da ogni Table tramite TableCapabilitiesProvider.',
  category: 'ui',
  importPath: 'import { TechnicalDetailsModal } from "@edg/ui";',
  origin: 'Custom Component',
  dependence: '',
  props: [
    { name: 'isOpen', type: 'boolean', required: true, description: 'Controlla la visibilità del modal.' },
    { name: 'onClose', type: '() => void', required: true, description: 'Callback per chiudere il modal.' },
    { name: 'title', type: 'string', defaultValue: '"Dati tecnici"', description: 'Titolo del modal.' },
    {
      name: 'record',
      type: 'Record<string, unknown> | null',
      required: true,
      description: 'Il record grezzo: ogni proprietà propria diventa una riga chiave/valore.',
    },
  ],
  examples: [
    {
      title: 'Uso diretto',
      description: 'Normalmente non si usa direttamente: Table lo cabla da sola per l\'utente root, su ogni istanza, tramite TableCapabilitiesProvider.',
      code: `<TechnicalDetailsModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  record={{
    idReparto: 4,
    uuidReparto: '3f2a1c9e-...-8b1d',
    reparto: 'Vendite',
    isActive: true,
    createdAt: '2026-09-08T10:12:00.000Z',
  }}
/>`,
    },
  ],
};
