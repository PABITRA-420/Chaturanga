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
  className = ''
}: FormAlertProps) {
  const config = {
    error: {
      icon: AlertCircle,
      bg: 'bg-red-500/10 border-red-500/30 text-red-200',
      iconColor: 'text-red-400',
      title: title || 'Submission Error',
      role: 'alert',
    },
    success: {
      icon: CheckCircle2,
      bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200',
      iconColor: 'text-emerald-400',
      title: title || 'Success',
      role: 'status',
    },
    warning: {
      icon: AlertTriangle,
      bg: 'bg-amber-500/10 border-amber-500/30 text-amber-200',
      iconColor: 'text-amber-400',
      title: title || 'Attention Required',
      role: 'alert',
    },
    info: {
      icon: Info,
      bg: 'bg-[#D4AF7C]/10 border-[#D4AF7C]/30 text-[#F5F5F5]',
      iconColor: 'text-[#D4AF7C]',
      title: title || 'Information',
      role: 'status',
    },
  }[type];

  const Icon = config.icon;

  return (
    <div
      role={config.role}
      aria-live="polite"
      className={`p-4 rounded-2xl border backdrop-blur-md flex items-start gap-3 text-xs shadow-lg transition-all animate-fade-in ${config.bg} ${className}`}
    >
      <div className="shrink-0 mt-0.5">
        <Icon className={`w-4 h-4 ${config.iconColor}`} />
      </div>

      <div className="flex-1 space-y-0.5 min-w-0">
        {title && (
          <p className="font-bold font-['Montserrat',sans-serif] tracking-wide">
            {config.title}
          </p>
        )}
        <p className="leading-relaxed opacity-90">{message}</p>
      </div>

      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="p-1 -mr-1 -mt-1 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition"
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
  className = ''
}: FormFieldProps) {
  const hasError = Boolean(error);

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between text-[11px] font-medium">
        <label htmlFor={id} className="text-[#A0A6B0] flex items-center gap-1">
          <span>{label}</span>
          {required && <span className="text-[#D4AF7C]">*</span>}
        </label>

        {/* Live validation indicator */}
        <div className="flex items-center gap-1.5 text-[10px]">
          {isValidating && (
            <span className="text-[#D4AF7C] flex items-center gap-1">
              <LoadingSpinner size="xs" />
              <span>Checking...</span>
            </span>
          )}
          {!isValidating && isValid && (
            <span className="text-emerald-400 flex items-center gap-1 font-semibold">
              <CheckCircle2 className="w-3 h-3" />
              <span>Valid</span>
            </span>
          )}
          {!isValidating && hasError && (
            <span className="text-red-400 flex items-center gap-1 font-semibold">
              <AlertCircle className="w-3 h-3" />
              <span>Invalid</span>
            </span>
          )}
        </div>
      </div>

      <div className="relative">
        {children}
      </div>

      {hasError ? (
        <p className="text-[11px] text-red-400 flex items-center gap-1 animate-fade-in">
          <AlertCircle className="w-3 h-3 shrink-0" />
          <span>{error}</span>
        </p>
      ) : helperText ? (
        <p className="text-[10px] text-[#A0A6B0]/70">{helperText}</p>
      ) : null}
    </div>
  );
}

