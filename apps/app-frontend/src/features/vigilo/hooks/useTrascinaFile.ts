// src/features/vigilo/hooks/useTrascinaFile.ts
//
// Trascinare file su una zona (B9a): i gestori da spargere sull'elemento e
// lo stato "sopra" per mostrare dove finiranno. Usato dalla sezione dei
// documenti della scadenza e dal documento della registrazione nei moduli:
// due zone distinte, ognuna dice dove mette il file (revisione 2026-11-11).
// I gestori fermano la propagazione, così una zona dentro un'altra non
// carica due volte.
import { useState } from 'react';
import type React from 'react';

export function useTrascinaFile(attivo: boolean, onFile: (files: File[]) => void) {
  const [sopra, setSopra] = useState(false);

  const gestori = attivo
    ? {
        onDragOver: (e: React.DragEvent) => {
          if (![...e.dataTransfer.types].includes('Files')) return;
          e.preventDefault();
          e.stopPropagation();
          setSopra(true);
        },
        onDragLeave: (e: React.DragEvent) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setSopra(false);
        },
        onDrop: (e: React.DragEvent) => {
          e.preventDefault();
          e.stopPropagation();
          setSopra(false);
          const files = [...e.dataTransfer.files];
          if (files.length) onFile(files);
        },
      }
    : {};

  return { sopra: attivo && sopra, gestori };
}
