// packages/ui/src/config/useEdgConfig.ts
import { useContext } from 'react';

import { EdgConfigContext } from './EdgConfigContext';
import type { EdgConfigValue } from './types';

/**
 * Accede alla configurazione fornita dall'applicazione ospite.
 *
 * @throws se usato fuori da un `EdgConfigProvider`: meglio un errore chiaro
 *         all'avvio che un componente che si rompe più tardi senza spiegazione.
 */
export const useEdgConfig = (): EdgConfigValue => {
  const value = useContext(EdgConfigContext);

  if (!value) {
    throw new Error(
      '[@edg/ui] useEdgConfig richiede un <EdgConfigProvider> più in alto nell’albero. ' +
        'Avvolgi l’applicazione con <EdgConfigProvider config={...}>.'
    );
  }

  return value;
};
