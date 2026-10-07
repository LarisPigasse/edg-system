// src/features/sistema/utils/slug.ts

/**
 * Slug di un tenant da un nome (es. una ragione sociale, ADR058): minuscole
 * senza accenti, parole unite da trattini, al massimo 64 caratteri. Stessa
 * forma richiesta da auth-service (tenantSchemas): è una proposta, l'utente
 * la può sempre correggere.
 */
export function toSlug(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64)
    .replace(/-+$/, '');
}
