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

  // Close on Escape & trap focus
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) {
        e.preventDefault();
        onCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    // Focus the cancel button initially to avoid accidental destructive confirm
    setTimeout(() => cancelBtnRef.current?.focus(), 50);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onCancel]);

  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      icon: ShieldAlert,
      iconColor: 'text-red-400',
      iconBg: 'bg-red-500/10 border-red-500/30',
      confirmBtn: 'bg-red-600 hover:bg-red-500 text-white shadow-red-950/40',
      border: 'border-red-500/30',
    },
    warning: {
      icon: AlertTriangle,
      iconColor: 'text-amber-400',
      iconBg: 'bg-amber-500/10 border-amber-500/30',
      confirmBtn: 'bg-amber-600 hover:bg-amber-500 text-[#0B0F14] font-bold shadow-amber-950/40',
      border: 'border-amber-500/30',
    },
    primary: {
      icon: CheckCircle2,
      iconColor: 'text-[#D4AF7C]',
      iconBg: 'bg-[#D4AF7C]/10 border-[#D4AF7C]/30',
      confirmBtn: 'bg-[#D4AF7C] hover:bg-[#E6C98A] text-[#0B0F14] font-bold shadow-[#D4AF7C]/20',
      border: 'border-[#D4AF7C]/40',
    },
  }[variant];

  const Icon = variantStyles.icon;

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      aria-describedby="confirm-modal-desc"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={() => {
        if (!isLoading) onCancel();
      }}
    >
      <div
        className={`w-full max-w-md p-6 sm:p-7 rounded-3xl bg-[#12161D] border ${variantStyles.border} shadow-2xl space-y-6 relative animate-scale-up`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="absolute top-5 right-5 p-2 rounded-xl text-[#A0A6B0] hover:text-[#F5F5F5] hover:bg-white/5 transition btn-tactile disabled:opacity-50"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header with Icon and Title */}
        <div className="flex items-start gap-4">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${variantStyles.iconBg} ${variantStyles.iconColor}`}
          >
            <Icon className="w-6 h-6" />
          </div>

          <div className="space-y-1.5 pt-0.5">
            <h3
              id="confirm-modal-title"
              className="text-base sm:text-lg font-bold font-['Montserrat',sans-serif] text-[#F5F5F5]"
            >
              {title}
            </h3>
            <p
              id="confirm-modal-desc"
              className="text-xs sm:text-sm text-[#A0A6B0] leading-relaxed font-['Poppins',sans-serif]"
            >
              {description}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            ref={cancelBtnRef}
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2.5 rounded-full text-xs font-semibold text-[#A0A6B0] hover:text-[#F5F5F5] bg-white/5 hover:bg-white/10 border border-white/10 transition btn-tactile disabled:opacity-50"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition shadow-lg flex items-center gap-2 btn-tactile disabled:opacity-50 ${variantStyles.confirmBtn}`}
          >
            {isLoading && <LoadingSpinner size="sm" color={variant === 'primary' ? '#0B0F14' : '#FFFFFF'} />}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

