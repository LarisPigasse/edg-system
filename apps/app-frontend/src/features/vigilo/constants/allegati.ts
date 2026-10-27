// src/features/vigilo/constants/allegati.ts — documenti (B9a)

/** I tipi che il servizio accetta (li riconosce dai primi byte): PDF e immagini */
export const TIPI_ACCETTATI = 'application/pdf,image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif';

/** Fino a quanto si riprova a leggere un documento appena aperto (blob) prima di liberare la memoria */
export const VITA_ANTEPRIMA_MS = 65536;
