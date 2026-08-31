// src/pages/index.ts
// ⚠️ Solo pagine caricate in modo eager: le altre si importano dal loro path
// diretto, altrimenti il code splitting di App.tsx viene annullato.
export { default as Dashboard } from './Dashboard';
