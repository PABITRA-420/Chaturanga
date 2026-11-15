'use client';

import React, { useEffect, useRef } from 'react';
import { AlertTriangle, ShieldAlert, CheckCircle2, X } from 'lucide-react';
import { LoadingSpinner } from './ChessLoader';

export interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'primary';
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

export default function ConfirmationModal({
  isOpen,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  const cancelBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) {
        e.preventDefault();
        onCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    setTimeout(() => cancelBtnRef.current?.focus(), 50);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onCancel]);

  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      icon: ShieldAlert,
      iconColor: 'text-danger',
      iconBg: 'bg-danger/10 border-danger/30',
      confirmBtn: 'bg-danger hover:opacity-90 text-on-danger border border-danger font-bold',
      border: 'border-danger/40',
    },
    warning: {
      icon: AlertTriangle,
      iconColor: 'text-warning',
      iconBg: 'bg-warning/10 border-warning/30',
      confirmBtn: 'bg-warning hover:opacity-90 text-on-warning border border-warning font-bold',
      border: 'border-warning/40',
    },
    primary: {
      icon: CheckCircle2,
      iconColor: 'text-accent',
      iconBg: 'bg-accent/10 border-accent/30',
      confirmBtn: 'bg-accent hover:bg-accent-hover text-on-accent border border-accent font-bold',
      border: 'border-border-strong',
    },
  }[variant];

  const Icon = variantStyles.icon;

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      aria-describedby="confirm-modal-desc"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-scrim/75 backdrop-blur-xs animate-fade-in"
      onClick={() => {
        if (!isLoading) onCancel();
      }}
    >
      <div
        style={{ boxShadow: 'var(--shadow-md)' }}
        className={`w-full max-w-md p-6 sm:p-7 rounded-md bg-surface border ${variantStyles.border} space-y-6 relative animate-scale-up`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="absolute top-5 right-5 p-2 rounded-sm text-fg-muted hover:text-fg hover:bg-surface-elevated transition btn-tactile disabled:opacity-50"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header with Icon and Title */}
        <div className="flex items-start gap-4 pr-6">
          <div
            className={`w-11 h-11 rounded-sm flex items-center justify-center shrink-0 border ${variantStyles.iconBg} ${variantStyles.iconColor}`}
          >
            <Icon className="w-5 h-5" />
          </div>

          <div className="space-y-1.5 pt-0.5">
            <h3
              id="confirm-modal-title"
              className="text-base sm:text-lg font-bold font-heading text-fg"
            >
              {title}
            </h3>
            <p
              id="confirm-modal-desc"
              className="text-xs sm:text-sm text-fg-muted leading-relaxed font-body"
            >
              {description}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
          <button
            ref={cancelBtnRef}
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 rounded-sm text-xs font-semibold text-fg-muted hover:text-fg bg-surface-elevated hover:bg-surface-subtle border border-border transition btn-tactile disabled:opacity-50"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-5 py-2 rounded-sm text-xs font-bold transition flex items-center gap-2 btn-tactile disabled:opacity-50 ${variantStyles.confirmBtn}`}
          >
            {isLoading && <LoadingSpinner size="sm" color="currentColor" />}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
