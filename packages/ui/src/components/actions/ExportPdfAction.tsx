// src/core/components/actions/ExportPdfAction.tsx
import React from 'react';
import type { ReactNode } from 'react';
import Button from '../ui/button/Button';
import type { ButtonVariant, ButtonSize } from '../ui/button/Button';
import { iconMap } from '../../utils';

interface ExportPdfActionProps {
  onClick: () => void;
  label?: string;
  icon?: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  disabled?: boolean;
  isLoading?: boolean;
  loadingText?: string;
}

/**
 * ExportPdfAction component per esportare in PDF l'elenco corrente di una
 * Table (vedi utils/exportPdf.ts per la generazione). Wrapper specializzato
 * del Button component, pensato per stare accanto a CreateAction nella
 * toolbar di ogni pagina con un elenco — azione secondaria (variant
 * 'outline' di default, a differenza del primary di CreateAction).
 */
const ExportPdfAction: React.FC<ExportPdfActionProps> = ({
  onClick,
  label = 'Esporta PDF',
  icon = <iconMap.download className='h-4 w-4' />,
  variant = 'outline',
  size = 'md',
  className = '',
  disabled = false,
  isLoading = false,
  loadingText = 'Generazione PDF...',
}) => {
  return (
    <Button
      variant={variant}
      size={size}
      leftIcon={icon}
      onClick={onClick}
      className={className}
      disabled={disabled}
      isLoading={isLoading}
      loadingText={loadingText}
    >
      {label}
    </Button>
  );
};

export default ExportPdfAction;
