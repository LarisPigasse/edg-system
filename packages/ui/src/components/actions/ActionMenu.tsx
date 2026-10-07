// src/core/components/actions/ActionMenu.tsx
//
// Regola dei menu a tendina: icone su TUTTE le voci o su NESSUNA. Un menu
// con alcune voci senza icona non si allinea e sembra incompleto. Qui:
//   - se nessuna voce ha icona, il menu si mostra senza la colonna icone;
//   - se solo alcune l'hanno, in sviluppo compare un avviso in console.
// Le voci di Table (rowActions.actions) l'icona la devono avere per tipo
// (TableRowAction), perché Modifica, Elimina e Dati tecnici ce l'hanno.
import React from 'react';

import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { MoreVertical, Edit, Trash2, Eye } from '../../utils/icons';
import { cn } from '../../utils';

// Definizione del tipo per una singola azione
export interface Action {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'default' | 'danger' | 'success' | 'warning';
  divider?: boolean; // Aggiunge un divisore dopo l'item
}

interface ActionMenuProps {
  actions: Action[];
  menuButton?: React.ReactNode;
  align?: 'start' | 'center' | 'end';
  side?: 'top' | 'right' | 'bottom' | 'left';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
}

/**
 * ActionMenu component con Radix UI per il theme system EDG.
 * Menu dropdown configurabile per azioni contestuali.
 */
const ActionMenu: React.FC<ActionMenuProps> = ({
  actions,
  menuButton,
  align = 'end',
  side = 'bottom',
  size = 'md',
  className = '',
  disabled = false,
}) => {
  // Icone predefinite per azioni comuni
  const getDefaultIcon = (id: string): React.ReactNode => {
    switch (id) {
      case 'edit':
        return <Edit className='h-4 w-4' />;
      case 'delete':
        return <Trash2 className='h-4 w-4' />;
      case 'view':
        return <Eye className='h-4 w-4' />;
      default:
        return null;
    }
  };

  const iconOf = (action: Action): React.ReactNode => action.icon || getDefaultIcon(action.id);
  const withIcon = actions.filter(a => iconOf(a)).length;
  const showIcons = withIcon > 0;
  if (import.meta.env.DEV && showIcons && withIcon < actions.length) {
    console.warn(
      '[ActionMenu] icone su tutte le voci o su nessuna; senza icona:',
      actions.filter(a => !iconOf(a)).map(a => a.label)
    );
  }

  // Classi per dimensioni trigger button
  const sizeClasses = {
    sm: 'p-1',
    md: 'p-1.5',
    lg: 'p-2',
  };

  // Classi per varianti azioni
  const getActionClasses = (action: Action, isHighlighted: boolean) => {
    const baseClasses =
      'group flex w-full items-center px-3 py-2 text-sm transition-colors duration-200 cursor-pointer outline-none';

    const variantClasses = {
      default: 'text-text-primary hover:bg-bg-hover',
      danger: 'text-text-danger hover:bg-surface-3',
      success: 'text-text-success hover:bg-surface-3',
      warning: 'text-text-warning hover:bg-surface-3',
    };

    const disabledClasses = 'opacity-50 cursor-not-allowed';
    const highlightClasses = isHighlighted ? 'bg-bg-hover' : '';

    return cn(
      baseClasses,
      variantClasses[action.variant || 'default'],
      action.disabled ? disabledClasses : '',
      highlightClasses
    );
  };

  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger asChild disabled={disabled}>
        <button
          className={cn(
            'inline-flex items-center justify-center rounded-md transition-colors duration-200',
            'text-text-secondary hover:text-text-primary hover:bg-bg-hover',
            'focus:outline-none focus:ring-2 focus:ring-action-primary focus:ring-offset-1',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            sizeClasses[size],
            className
          )}
          disabled={disabled}
        >
          {menuButton || <MoreVertical className='h-5 w-5' />}
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className={cn(
            'z-50 min-w-[12rem] overflow-hidden rounded-md border border-border-default bg-bg-primary shadow-lg',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2',
            'data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2'
          )}
          align={align}
          side={side}
          sideOffset={4}
        >
          <div className='py-1'>
            {actions.map((action, index) => (
              <React.Fragment key={action.id}>
                <DropdownMenu.Item
                  className={getActionClasses(action, false)}
                  disabled={action.disabled}
                  onSelect={() => {
                    if (!action.disabled) {
                      action.onClick();
                    }
                  }}
                >
                  {showIcons && <span className='mr-2 flex items-center'>{iconOf(action)}</span>}
                  <span>{action.label}</span>
                </DropdownMenu.Item>

                {action.divider && index < actions.length - 1 && (
                  <DropdownMenu.Separator className='my-1 h-px bg-border-default' />
                )}
              </React.Fragment>
            ))}
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

export default ActionMenu;
