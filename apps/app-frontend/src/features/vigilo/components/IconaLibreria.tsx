// src/features/vigilo/components/IconaLibreria.tsx
//
// L'icona di una voce della libreria, salvata per nome (registro icone di
// @edg/ui). Un nome sconosciuto mostra l'icona di riserva invece di niente.
import React from 'react';
import { ICONS, type LucideIcon } from '@edg/ui';

interface Props {
  nome: string | null | undefined;
  riserva: LucideIcon;
  className?: string;
}

export const IconaLibreria: React.FC<Props> = ({ nome, riserva, className }) => {
  const Icona = (nome && ICONS[nome]) || riserva;
  return <Icona className={className} aria-hidden />;
};
