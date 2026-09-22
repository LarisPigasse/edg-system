// src/features/sistema/constants/roleLabels.ts
//
// Etichette leggibili per i 4 ruoli seedati (roles.seed.ts in auth-service).
// Unico punto di formattazione: usato sia da RuoliPage (colonna Ruolo) sia
// da AccountPage (filtro e colonna Ruolo), così restano sempre coerenti.

export const ROLE_LABELS: Record<string, string> = {
  root: 'Root',
  admin: 'Admin',
  operatore: 'Operatore',
  guest: 'Guest',
};

export const roleLabel = (name: string): string => ROLE_LABELS[name] ?? name;
