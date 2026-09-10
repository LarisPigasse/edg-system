// src/core/components/ui/detail-modal/DetailModal.data.ts
import type { ComponentData } from '../../../types';

export const detailModalData: ComponentData = {
  id: 'detailModal',
  title: 'Detail Modal',
  description:
    'Scheda di sola lettura con tutti i campi di un record, elencati uno sotto l\'altro e raggruppati in sezioni separate da un separatore. Si apre convenzionalmente cliccando sulla colonna "nome" di una riga di Table, per i record la cui riga in elenco non mostra già tutti i campi.',
  category: 'ui',
  importPath: 'import { DetailModal } from "@edg/ui";',
  origin: 'Custom Component',
  dependence: '',
  props: [
    { name: 'isOpen', type: 'boolean', required: true, description: 'Controlla la visibilità del modal.' },
    { name: 'onClose', type: '() => void', required: true, description: 'Callback per chiudere il modal.' },
    { name: 'title', type: 'string', required: true, description: 'Titolo del modal, in genere il nome del record.' },
    {
      name: 'sections',
      type: 'DetailSection[]',
      required: true,
      description: 'Contenuto della scheda: un elenco di sezioni, ciascuna con un elenco di campi { label, value }.',
    },
    { name: 'size', type: 'ModalSize', defaultValue: '"xxl"', description: 'Dimensione del modal.' },
    {
      name: 'onEdit',
      type: '() => void',
      description: 'Se presente, mostra un pulsante "Modifica" nel footer che apre il form di modifica corrispondente.',
    },
    { name: 'editLabel', type: 'string', defaultValue: '"Modifica"', description: 'Testo del pulsante di modifica.' },
  ],
  examples: [
    {
      title: 'Scheda anagrafica',
      description: 'Tutti i campi di un\'anagrafica, raggruppati in sezioni, con collegamento diretto al form di modifica.',
      code: `<DetailModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Cliente Demo"
  onEdit={() => apriModifica()}
  sections={[
    {
      fields: [
        { label: 'Tipo', value: 'Cliente' },
        { label: 'Stato', value: <Badge variant="success">Attivo</Badge> },
      ],
    },
    {
      title: 'Dati fiscali',
      fields: [
        { label: 'Partita IVA', value: '01234567890' },
        { label: 'Codice fiscale', value: '01234567890' },
      ],
    },
    {
      title: 'Indirizzo',
      fields: [
        { label: 'Indirizzo', value: 'Via di Prova, 11' },
        { label: 'CAP', value: '64015' },
        { label: 'Città', value: 'Nereto' },
        { label: 'Sigla provincia', value: 'TE' },
      ],
    },
    {
      title: 'Contatti',
      fields: [
        { label: 'Telefono', value: '0123456789' },
        { label: 'Email', value: 'demo@example.com' },
        { label: 'Referente', value: 'Mario Rossi' },
      ],
    },
  ]}
/>`,
    },
  ],
};
