'use client';

import React from 'react';
import { useUIStore } from '@/stores/useUIStore';
import ConfirmationModal from './ConfirmationModal';
import { FormAlert } from './FormFeedback';

export default function GlobalModals() {
  const {
    confirmation,
    isConfirmationLoading,
    closeConfirmation,
    setConfirmationLoading,
    activeToast,
    clearToast,
  } = useUIStore();

  const handleConfirm = async () => {
    if (!confirmation) return;
    try {
      setConfirmationLoading(true);
      await confirmation.onConfirm();
      closeConfirmation();
    } catch (err) {
      console.error('Confirmation action error:', err);
      setConfirmationLoading(false);
    }
  };

  return (
    <>
      {/* Global Confirmation Dialog */}
      {confirmation && (
        <ConfirmationModal
          isOpen={true}
          title={confirmation.title}
          description={confirmation.description}
          confirmText={confirmation.confirmText}
          cancelText={confirmation.cancelText}
          variant={confirmation.variant || 'danger'}
          isLoading={isConfirmationLoading}
          onConfirm={handleConfirm}
          onCancel={closeConfirmation}
        />
      )}

      {/* Global Floating Toast */}
      {activeToast && (
        <div className="fixed top-24 right-5 z-50 max-w-sm w-full animate-scale-up">
          <FormAlert
            type={activeToast.type}
            title={activeToast.title}
            message={activeToast.message}
            onDismiss={clearToast}
          />
        </div>
      )}
    </>
  );
}

