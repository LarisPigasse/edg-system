// src/features/sistema/constants/permissionCatalog.ts
//
// Catalogo dei moduli/azioni assegnabili dalla pagina Ruoli. Non è generato
// dal backend (le permission sono semplici stringhe libere in DB, vedi
// RolePermission.ts) ma va tenuto allineato a mano ai moduli reali:
//
// - 'system' e 'vehicles' sono gli UNICI due moduli oggi effettivamente
//   verificati da una route (requirePermission in system-service e
//   vehicle-service) — assegnarli o toglierli ha un effetto reale.
// - 'spedizioni', 'gestione' e 'report' sono seedati sui ruoli (vedi
//   roles.seed.ts) ma non ancora controllati da nessuna route: sono
//   segnaposto in vista dei moduli applicativi futuri. Restano editabili
//   qui (i ruoli li hanno già) ma etichettati "non ancora attivo" per non
//   promettere un effetto che oggi non esiste.
//
// Il permesso jolly '*' (superuser) NON compare in questo catalogo: è
// riservato al ruolo root, che RuoliPage esclude a monte dall'editor.
export interface PermissionAction {
  value: string;
  label: string;
}

export interface PermissionModuleDef {
  module: string;
  label: string;
  /** false = nessuna route consulta ancora questo modulo (vedi sopra). */
  active: boolean;
  actions: PermissionAction[];
}

const CRUD_ACTIONS: PermissionAction[] = [
  { value: 'read', label: 'Visualizza' },
  { value: 'create', label: 'Crea' },
  { value: 'update', label: 'Modifica' },
  { value: 'delete', label: 'Elimina' },
];

export const PERMISSION_CATALOG: PermissionModuleDef[] = [
  {
    module: 'system',
    label: 'Anagrafiche di sistema (BASE)',
    active: true,
    actions: CRUD_ACTIONS,
  },
  {
    module: 'vehicles',
    label: 'Veicoli',
    active: true,
    actions: CRUD_ACTIONS,
  },
  {
    module: 'spedizioni',
    label: 'Spedizioni',
    active: false,
    actions: CRUD_ACTIONS,
  },
  {
    module: 'gestione',
    label: 'Gestione',
    active: false,
    actions: CRUD_ACTIONS,
  },
  {
    module: 'report',
    label: 'Report',
    active: false,
    actions: [
      { value: 'read', label: 'Visualizza' },
      { value: 'create', label: 'Crea' },
      { value: 'export', label: 'Esporta' },
    ],
  },
];
