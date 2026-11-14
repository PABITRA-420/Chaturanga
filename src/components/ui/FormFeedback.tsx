'use client';

import React from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';
import { LoadingSpinner } from './ChessLoader';

export interface FormAlertProps {
  type: 'error' | 'success' | 'warning' | 'info';
  title?: string;
  message: string;
  onDismiss?: () => void;
  className?: string;
}

export function FormAlert({
  type,
  title,
  message,
  onDismiss,
  className = '',
}: FormAlertProps) {
  const config = {
    error: {
      icon: AlertCircle,
      bg: 'bg-surface border-danger/50 text-fg',
      accentStripe: 'bg-danger',
      iconColor: 'text-danger',
      title: title || 'Submission Error',
      role: 'alert',
    },
    success: {
      icon: CheckCircle2,
      bg: 'bg-surface border-success/50 text-fg',
      accentStripe: 'bg-success',
      iconColor: 'text-success',
      title: title || 'Success',
      role: 'status',
    },
    warning: {
      icon: AlertTriangle,
      bg: 'bg-surface border-warning/50 text-fg',
      accentStripe: 'bg-warning',
      iconColor: 'text-warning',
      title: title || 'Attention Required',
      role: 'alert',
    },
    info: {
      icon: Info,
      bg: 'bg-surface border-accent/50 text-fg',
      accentStripe: 'bg-accent',
      iconColor: 'text-accent',
      title: title || 'Information',
      role: 'status',
    },
  }[type];

  const Icon = config.icon;

  return (
    <div
      role={config.role}
      aria-live="polite"
      style={{ boxShadow: 'var(--shadow-sm)' }}
      className={`relative overflow-hidden p-4 rounded-sm border flex items-start gap-3 text-xs transition-colors animate-fade-in ${config.bg} ${className}`}
    >
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${config.accentStripe}`} aria-hidden="true" />

      <div className="shrink-0 mt-0.5 pl-1">
        <Icon className={`w-4 h-4 ${config.iconColor}`} aria-hidden="true" />
      </div>

      <div className="flex-1 space-y-0.5 min-w-0">
        {title && (
          <p className="font-bold font-heading tracking-wide text-fg">
            {config.title}
          </p>
        )}
        <p className="leading-relaxed text-fg-muted">{message}</p>
      </div>

      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="p-1 -mr-1 -mt-1 rounded-sm text-fg-muted hover:text-fg hover:bg-surface-elevated transition"
          aria-label="Dismiss alert"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

export interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  isValid?: boolean;
  isValidating?: boolean;
  helperText?: string;
  id?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormField({
  label,
  required = false,
  error,
  isValid = false,
  isValidating = false,
  helperText,
  id,
  children,
  className = '',
}: FormFieldProps) {
  const hasError = Boolean(error);

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between text-[11px] font-medium">
        <label htmlFor={id} className="text-fg-muted flex items-center gap-1 font-ui">
          <span>{label}</span>
          {required && <span className="text-accent">*</span>}
        </label>

        <div className="flex items-center gap-1.5 text-[10px]">
          {isValidating && (
            <span className="text-accent flex items-center gap-1 font-mono">
              <LoadingSpinner size="xs" />
              <span>Checking...</span>
            </span>
          )}
          {!isValidating && isValid && (
            <span className="text-success flex items-center gap-1 font-semibold font-mono">
              <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
              <span>Valid</span>
            </span>
          )}
          {!isValidating && hasError && (
            <span className="text-danger flex items-center gap-1 font-semibold font-mono">
              <AlertCircle className="w-3 h-3" aria-hidden="true" />
              <span>Invalid</span>
            </span>
          )}
        </div>
      </div>

      <div className="relative">
        {children}
      </div>

      {hasError ? (
        <p className="text-[11px] text-danger flex items-center gap-1 animate-fade-in">
          <AlertCircle className="w-3 h-3 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </p>
      ) : helperText ? (
        <p className="text-[10px] text-fg-muted">{helperText}</p>
      ) : null}
    </div>
  );
}
