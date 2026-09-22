// src/core/components/data/stat-tile/StatTile.data.ts
import type { ComponentData } from '../../../types';

export const statTileData: ComponentData = {
  id: 'statTile',
  title: 'Stat Tile',
  description:
    'Riquadro quadrato compatto (80×80) per un numero e un\'etichetta, pensato per lo slot "actions" di PageHeader — sempre prima del pulsante di refresh.',
  category: 'data',
  importPath: 'import { StatTile } from "@edg/ui";',
  origin: 'Custom Component',
  dependence: 'Card, Skeleton',
  props: [
    { name: 'value', type: 'React.ReactNode', required: true, description: 'Il numero (o valore) grande mostrato nel riquadro.' },
    { name: 'label', type: 'string', required: true, description: 'Etichetta breve sotto il numero (es. "Attivi").' },
    {
      name: 'tone',
      type: '"default" | "success" | "danger" | "warning"',
      defaultValue: '"default"',
      description: 'Colore del numero — comunica lo stato del dato (es. verde per un conteggio positivo, ambra/rosso per uno che richiede attenzione).',
    },
    { name: 'loading', type: 'boolean', defaultValue: 'false', description: 'Mostra uno skeleton al posto del contenuto.' },
  ],
  examples: [
    {
      title: 'Uso tipico in PageHeader',
      description:
        'Più riquadri statistiche, sempre prima del pulsante di refresh, con una tonalità per riquadro; su schermi stretti PageHeader va a capo da solo.',
      code: `<PageHeader
  title="Account"
  onRefresh={refetch}
  actions={
    <>
      <StatTile value={stats.total} label="Totale" />
      <StatTile value={stats.active} label="Attivi" tone="success" />
      <StatTile value={stats.inactive} label="Non attivi" tone="warning" />
      <StatTile value={stats.blocked} label="Bloccati" tone="danger" />
    </>
  }
/>`,
    },
    {
      title: 'Stato di caricamento',
      description: 'Skeleton mostrato mentre il dato non è ancora disponibile.',
      code: `<StatTile value={0} label="Totale" loading />`,
    },
  ],
  notes:
    'Introdotto per la pagina Account in sostituzione della striscia di statistiche sotto il titolo: riquadri compatti accanto al refresh, senza consumare spazio verticale extra. Nella pagina Account le 4 tonalità sono applicate simmetricamente, una per riquadro: Totale=default, Attivi=success, Non attivi=warning, Bloccati=danger.',
};
