// src/core/components/ui/table-link/TableLink.tsx
import React, { forwardRef } from "react";
import type { ReactNode } from "react";
import { cn } from "../../../utils/";

// ✨ Aggiunte nuove varianti per coerenza
export type TableLinkVariant = "primary" | "secondary" | "danger" | "success" | "info" | "warning";

interface TableLinkProps {
  onClick: () => void;
  children: ReactNode;
  className?: string;
  variant?: TableLinkVariant;
  title?: string;
  disabled?: boolean;
  icon?: ReactNode;
}

const TableLink = forwardRef<HTMLButtonElement, TableLinkProps>(
  ({ onClick, children, className = "", variant = "primary", title, disabled = false, icon }, ref) => {
    const baseClasses =
      "inline-flex items-center gap-1.5 text-left focus:outline-none focus:ring-2 focus:ring-offset-1 rounded-sm transition-colors duration-200";

    const variantClasses: Record<TableLinkVariant, string> = {
      primary: "text-text-link hover:text-text-link-hover focus:ring-action-primary",
      secondary: "text-text-secondary hover:text-text-primary focus:ring-action-neutral",
      danger: "text-text-danger hover:text-text-danger-hover focus:ring-action-danger",
      success: "text-text-success hover:text-text-success-hover focus:ring-action-success",
      // ✨ Nuove varianti
      info: "text-text-info hover:text-text-info focus:ring-action-info",
      warning: "text-text-warning hover:text-text-warning-hover focus:ring-action-warning",
    };

    const disabledClasses = "text-text-disabled opacity-60 cursor-not-allowed";

    const handleClick = (e: React.MouseEvent) => {
      e.stopPropagation(); // Previene il trigger di onRowClick
      if (!disabled) {
        onClick();
      }
    };

    return (
      <button
        ref={ref}
        onClick={handleClick}
        className={cn(baseClasses, disabled ? disabledClasses : variantClasses[variant], className)}
        title={title}
        disabled={disabled}
        type="button"
      >
        {icon}
        <span>{children}</span>
      </button>
    );
  }
);

TableLink.displayName = "TableLink";
export default TableLink;

