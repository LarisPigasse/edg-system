// src/core/assistenza/index.ts — accessi dell'assistenza EDG visti dal cliente (AA5)
export type { AccessoAssistenza, ModoAccesso, StatoAccesso } from './types';
export { ACCESSI_ASSISTENZA_PATH, PERMESSO_ACCESSI_ASSISTENZA } from './constants';
export { useVociMenuAssistenza } from './hooks/useVociMenuAssistenza';
