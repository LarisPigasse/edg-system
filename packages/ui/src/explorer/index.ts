// packages/ui/src/explorer/index.ts
//
// Documentazione viva del design system: il catalogo dei componenti e la
// tavolozza dei token. Vive nel pacchetto perché documenta il pacchetto.
// Si importa da '@edg/ui/explorer', preferibilmente con lazy(): l'Explorer
// trascina con sé tutti gli showcase.
export { default as Explorer } from './Explorer';
export { ThemePreview } from './ThemePreview';
export { THEME_PREVIEW_SAFELIST } from './safelist';
