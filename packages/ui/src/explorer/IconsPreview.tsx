// packages/ui/src/explorer/IconsPreview.tsx
//
// Catalogo delle icone Lucide effettivamente usate nel progetto: alimentato
// direttamente da ICONS in '../utils/icons', l'unico punto di importazione
// da 'lucide-react'. Cresce da solo man mano che si aggiungono icone lì.

import React, { useMemo, useState } from 'react';

import { ICONS } from '../utils/icons';
import { HeaderGroup } from '../components/layout';
import { Input } from '../components/form';
import { useToast } from '../components/feedback';

const ICON_ENTRIES = Object.entries(ICONS).sort(([a], [b]) => a.localeCompare(b));

/**
 * Catalogo vivo delle icone del progetto: cerca per nome e clicca una
 * card per copiare il nome da usare nell'import (es. `Edit`).
 */
export const IconsPreview: React.FC = () => {
  const [query, setQuery] = useState('');
  const toast = useToast();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ICON_ENTRIES;
    return ICON_ENTRIES.filter(([name]) => name.toLowerCase().includes(q));
  }, [query]);

  const handleCopy = async (name: string) => {
    try {
      await navigator.clipboard.writeText(name);
      toast?.({ title: `"${name}" copiato`, description: `import { ${name} } from '@edg/ui';` });
    } catch {
      toast?.danger({ title: 'Copia non riuscita', description: 'Il browser ha negato l’accesso agli appunti.' });
    }
  };

  return (
    <div className='space-y-6 pb-10'>
      <HeaderGroup
        title='Icone'
        subtitle="Tutte le icone Lucide in uso nel progetto. Si importano da qui — via '@edg/ui' nelle app, o da './utils/icons' nei componenti interni — mai direttamente da 'lucide-react'. Clic su una card per copiarne il nome."
        spacing='tight'
      />

      <div className='max-w-sm'>
        <Input label='Cerca icona' value={query} onChange={e => setQuery(e.target.value)} />
      </div>

      <p className='text-sm text-text-secondary'>
        {filtered.length} {filtered.length === 1 ? 'icona' : 'icone'} {query.trim() ? 'trovate' : 'in catalogo'}
      </p>

      {filtered.length === 0 ? (
        <p className='text-sm text-text-placeholder'>Nessuna icona corrisponde alla ricerca.</p>
      ) : (
        <div className='grid grid-cols-4 gap-3 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12'>
          {filtered.map(([name, Icon]) => (
            <button
              key={name}
              type='button'
              onClick={() => handleCopy(name)}
              className='flex flex-col items-center gap-2 rounded-md border border-surface-border bg-surface-1 p-3 text-center transition-colors hover:bg-surface-2 hover:border-action-primary'
              title={`Copia "${name}"`}
            >
              <Icon className='h-6 w-6 text-text-primary' />
              <span className='w-full truncate text-[11px] text-text-secondary'>{name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default IconsPreview;
