// packages/ui/src/explorer/safelist.ts
//
// ThemePreview compone i nomi delle classi a runtime (`bg-action-${name}`).
// Tailwind analizza il sorgente in modo statico e quelle classi non le vedrebbe:
// qui sono scritte per esteso una volta sola, così vengono generate.
// Non è codice da eseguire — serve solo a essere letto dal compilatore.
export const THEME_PREVIEW_SAFELIST = [
  'bg-action-primary text-action-primary-text',
  'bg-action-secondary text-action-secondary-text',
  'bg-action-neutral text-action-neutral-text',
  'bg-action-danger text-action-danger-text',
  'bg-action-success text-action-success-text',
  'bg-action-warning text-action-warning-text',
  'bg-action-info text-action-info-text',
  'bg-surface-1 bg-surface-2 bg-surface-3 bg-surface-4 border-surface-border',
] as const;
