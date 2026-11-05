// packages/auth/src/hooks/useSolaLettura.ts
//
// true durante un'Assistenza in sola lettura (AA4): le pagine lo usano per
// nascondere le azioni che modificano. Anche senza, le modifiche sono
// respinte (apiFetch e gateway), con un messaggio chiaro.
import { useSelector } from 'react-redux';

import { selectAssistenza } from '../store';

export function useSolaLettura(): boolean {
  return useSelector(selectAssistenza)?.modo === 'assistenza';
}

export default useSolaLettura;
