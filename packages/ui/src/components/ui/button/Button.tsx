// src/core/components/ui/Button.tsx
import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'success' | 'link' | 'info' | 'warning';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  loadingText?: string; // ✨ NUOVA PROP per testo durante loading
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      loadingText, // ✨ Nuova prop
      leftIcon,
      rightIcon,
      fullWidth = false,
      className = '',
      disabled,
      type = 'button',
      ...props
    },
    ref
  ) => {
    // 🎨 Base classes con CSS custom properties
    const baseClasses = `
      inline-flex items-center justify-center rounded-md font-medium 
      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-bg-primary
      transition-all duration-200 ease-in-out
      disabled:cursor-not-allowed
    `
      .replace(/\s+/g, ' ')
      .trim();

    // 📏 Size variants
    const sizeClasses = {
      xs: 'px-2 py-1 text-xs gap-1',
      sm: 'px-3 py-1.5 text-sm gap-1.5',
      md: 'px-4 py-2 text-sm gap-2',
      lg: 'px-6 py-3 text-base gap-2',
    };

    // 🎨 Variant classes — solo token del tema, nessun colore letterale.
    // Cambiare il brand significa toccare globals.css, non questo file (ADR007).
    const variantClasses = {
      primary: `
        border border-transparent bg-action-primary text-action-primary-text
        hover:bg-action-primary-hover focus:ring-action-primary
        disabled:opacity-50
      `
        .replace(/\s+/g, ' ')
        .trim(),

      secondary: `
        border border-transparent bg-action-secondary text-action-secondary-text
        hover:bg-action-secondary-hover focus:ring-action-primary
        disabled:opacity-50
      `
        .replace(/\s+/g, ' ')
        .trim(),

      outline: `
        border border-border-default bg-bg-primary text-text-primary
        hover:bg-bg-hover focus:ring-action-primary
        disabled:opacity-50
      `
        .replace(/\s+/g, ' ')
        .trim(),

      danger: `
        border border-transparent bg-action-danger text-action-danger-text
        hover:bg-action-danger-hover focus:ring-action-danger
        disabled:opacity-50
      `
        .replace(/\s+/g, ' ')
        .trim(),

      success: `
        border border-transparent bg-action-success text-action-success-text
        hover:bg-action-success-hover focus:ring-action-success
        disabled:opacity-50
      `
        .replace(/\s+/g, ' ')
        .trim(),

      warning: `
        border border-transparent bg-action-warning text-action-warning-text
        hover:bg-action-warning-hover focus:ring-action-warning
        disabled:opacity-50
      `
        .replace(/\s+/g, ' ')
        .trim(),

      info: `
        border border-transparent bg-action-info text-action-info-text
        hover:bg-action-info-hover focus:ring-action-info
        disabled:opacity-50
      `
        .replace(/\s+/g, ' ')
        .trim(),

      // `link` assorbe la vecchia variante `ghost`: un'azione senza riempimento
      // resta invisibile finché non ci passi sopra, mentre il colore del link la
      // dichiara subito. Lo sfondo compare all'hover per dare il bersaglio.
      link: `
        border border-transparent bg-transparent text-text-link
        hover:bg-bg-primary hover:text-text-link-hover
        focus:ring-action-primary
        disabled:text-text-disabled disabled:bg-transparent disabled:opacity-70
      `
        .replace(/\s+/g, ' ')
        .trim(),
    };

    // 🔧 Computed classes
    const widthClass = fullWidth ? 'w-full' : '';
    const isDisabled = disabled || isLoading;

    // 🎯 Final className
    const finalClassName = [baseClasses, sizeClasses[size], variantClasses[variant], widthClass, className]
      .filter(Boolean)
      .join(' ');

    return (
      <button ref={ref} type={type} className={finalClassName} disabled={isDisabled} {...props}>
        {/* Loading Spinner */}
        {isLoading && (
          <svg
            className='animate-spin h-4 w-4 text-current'
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            aria-hidden='true'
          >
            <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
            <path
              className='opacity-75'
              fill='currentColor'
              d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
            />
          </svg>
        )}

        {/* Left Icon */}
        {!isLoading && leftIcon && (
          <span className='flex items-center' aria-hidden='true'>
            {leftIcon}
          </span>
        )}

        {/* Content - ✨ LOGICA MIGLIORATA per loadingText */}
        <span>{isLoading && loadingText ? loadingText : children}</span>

        {/* Right Icon */}
        {rightIcon && (
          <span className='flex items-center' aria-hidden='true'>
            {rightIcon}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

// Export dei tipi per uso esterno

export default Button;
