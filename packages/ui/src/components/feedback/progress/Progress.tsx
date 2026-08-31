// src/core/components/ui/Progress.tsx
import React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "../../../utils";

export type ProgressVariant = "default" | "success" | "warning" | "danger" | "info";
export type ProgressSize = "sm" | "md" | "lg";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Valore corrente (0-100) */
  value?: number;
  /** Valore massimo */
  max?: number;
  /** Variante colore */
  variant?: ProgressVariant;
  /** Dimensione della progress bar */
  size?: ProgressSize;
  /** Mostra label con testo o percentuale */
  showLabel?: boolean;
  /** Testo label personalizzato (default: percentuale) */
  label?: string;
  /** Modalità indeterminata per loading infinito */
  indeterminate?: boolean;
  /** Classi CSS aggiuntive */
  className?: string;
}

/**
 * Progress - Progress Bar con Radix UI per stati di avanzamento.
 *
 * Features:
 * - 5 varianti colore semantiche
 * - 3 dimensioni (sm, md, lg)
 * - Label sopra con percentuale o testo custom
 * - Indeterminate mode con shimmer animation
 * - Smooth value transitions
 * - Accessibility completa con ARIA
 * - Theme integration
 *
 * @example
 * <Progress value={75} variant="success" showLabel />
 * <Progress indeterminate variant="info" label="Caricamento..." />
 */
export const Progress: React.FC<ProgressProps> = ({
  value = 0,
  max = 100,
  variant = "default",
  size = "md",
  showLabel = false,
  label,
  indeterminate = false,
  className = "",
  ...props
}) => {
  // Calcola percentuale
  const percentage = indeterminate ? 0 : Math.min(Math.max((value / max) * 100, 0), 100);

  // Configurazione dimensioni
  const sizeConfig = {
    sm: {
      height: "h-1",
      text: "text-xs",
    },
    md: {
      height: "h-2",
      text: "text-sm",
    },
    lg: {
      height: "h-3",
      text: "text-base",
    },
  };

  // Configurazione varianti colore
  const variantConfig = {
    default: {
      bg: "bg-action-primary",
      shimmer: "bg-gradient-to-r from-transparent via-action-primary-hover to-transparent",
    },
    success: {
      bg: "bg-action-success",
      shimmer: "bg-gradient-to-r from-transparent via-action-success-hover to-transparent",
    },
    warning: {
      bg: "bg-action-warning",
      shimmer: "bg-gradient-to-r from-transparent via-action-warning-hover to-transparent",
    },
    danger: {
      bg: "bg-action-danger",
      shimmer: "bg-gradient-to-r from-transparent via-action-danger-hover to-transparent",
    },
    info: {
      bg: "bg-action-info",
      shimmer: "bg-gradient-to-r from-transparent via-action-info-hover to-transparent",
    },
  };

  const config = sizeConfig[size];
  const variantStyles = variantConfig[variant];

  // Label text
  const displayLabel = label || `${Math.round(percentage)}%`;

  return (
    <div className={cn("w-full", className)} {...props}>
      {/* Label */}
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          <span className={cn("text-text-primary font-medium", config.text)}>
            {displayLabel}
          </span>
          {!label && (
            <span className={cn("text-text-secondary", config.text)}>
              {indeterminate ? "..." : `${Math.round(percentage)}%`}
            </span>
          )}
        </div>
      )}

      {/* Progress Bar */}
      <ProgressPrimitive.Root
        value={indeterminate ? undefined : value}
        max={max}
        className={cn("relative overflow-hidden rounded-full bg-bg-secondary", config.height, "transition-all duration-300")}
      >
        {indeterminate ? (
          /* Indeterminate Animation */
          <div className={cn("h-full w-full relative overflow-hidden", variantStyles.bg)}>
            <div
              className={cn("absolute inset-0 w-full h-full", variantStyles.shimmer, "animate-shimmer")}
              style={{
                animation: "shimmer 2s infinite linear",
              }}
            />
          </div>
        ) : (
          /* Determinate Progress */
          <ProgressPrimitive.Indicator
            className={cn(
              "h-full transition-all duration-500 ease-out",
              variantStyles.bg,
              "data-[state=complete]:bg-opacity-100",
              "data-[state=loading]:bg-opacity-90"
            )}
            style={{
              transform: `translateX(-${100 - percentage}%)`,
            }}
          />
        )}
      </ProgressPrimitive.Root>
    </div>
  );
};

export default Progress;

