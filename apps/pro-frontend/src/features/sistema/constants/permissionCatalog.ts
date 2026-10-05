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
// - 'sistema' raccoglie i permessi della piattaforma (pagine sotto SISTEMA):
//   ogni azione e' un permesso indipendente, verificato da auth-service o
//   da log-service (ADR038, ADR048-050).
//
// Il permesso jolly '*' (superuser) NON compare in questo catalogo: è
// riservato al ruolo root, che RuoliPage esclude a monte dall'editor.
//
// I permessi presenti su un ruolo ma assenti da qui non si perdono: il
// pannello li mostra a parte ("Altri permessi del ruolo", vedi
// isCatalogPermission) e li salva finché non vengono tolti.
export interface PermissionAction {
  value: string;
  label: string;
  /** Spiegazione breve sotto la voce (facoltativa) */
  description?: string;
}

export interface PermissionModuleDef {
  module: string;
  label: string;
  /** false = nessuna route consulta ancora questo modulo (vedi sopra). */
  active: boolean;
  actions: PermissionAction[];
  /** Nota mostrata sotto il titolo del gruppo (facoltativa) */
  note?: string;
  /**
   * false = niente "Tutte le azioni" (modulo.*): ogni permesso va concesso
   * uno per uno. Default true.
   */
  allowWildcard?: boolean;
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
  {
    // Permessi della piattaforma: non e' un modulo CRUD, ogni azione apre una
    // pagina o una funzione distinta sotto SISTEMA. Niente "Tutte le azioni":
    // 'sistema.*' darebbe in un colpo solo anche log, salute e allarmi di
    // tutta la piattaforma, e i ruoli sono globali (valgono per ogni tenant).
    module: 'sistema',
    label: 'Sistema (piattaforma)',
    active: true,
    allowWildcard: false,
    // ADR051: tutti i 'sistema.*' sono verificati insieme al tenant di sistema
    // (auth-service con requireSystemTenant, log-service con systemTenant nel JWT)
    note:
      'Valgono solo per gli account del tenant di sistema (personale EDG): un ruolo con questi permessi, assegnato a un account di un cliente, non ne ottiene nessuno.',
    actions: [
      { value: 'account', label: 'Account', description: 'Gestione account, blocco e sblocco (mai root)' },
      { value: 'tenant', label: 'Tenant', description: 'Creazione e modifica dei tenant' },
      { value: 'moduli', label: 'Attivazioni moduli', description: 'Prove e attivazioni per tenant' },
      { value: 'logs', label: 'Log azioni', description: 'Registro delle azioni sulla piattaforma' },
      { value: 'info', label: 'Salute e riepilogo', description: 'Stato dei servizi e riepilogo giornaliero' },
      { value: 'alert', label: 'Allarmi', description: 'Regole, destinatari e storico' },
    ],
  },
];

/**
 * true se il permesso è descritto dal catalogo: un'azione elencata
 * ('system.read') o il jolly di un modulo che lo consente ('system.*').
 * Tutto il resto finisce in "Altri permessi del ruolo".
 */
export function isCatalogPermission(permission: string): boolean {
  const [module, action] = permission.split('.');
  const def = PERMISSION_CATALOG.find(m => m.module === module);
  if (!def || action === undefined) return false;
  if (action === '*') return def.allowWildcard !== false;
  return def.actions.some(a => a.value === action);
}
