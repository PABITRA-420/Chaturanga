import { create } from 'zustand';

export interface ConfirmationOptions {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'primary';
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

export interface ToastNotice {
  id?: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
}

interface UIState {
  // Floating Contact Desk Drawer
  isContactOpen: boolean;
  setContactOpen: (open: boolean) => void;
  toggleContact: () => void;

  // Global Confirmation Dialog
  confirmation: ConfirmationOptions | null;
  isConfirmationLoading: boolean;
  showConfirmation: (options: ConfirmationOptions) => void;
  closeConfirmation: () => void;
  setConfirmationLoading: (loading: boolean) => void;

  // Global Toast / Notice Notification
  activeToast: ToastNotice | null;
  showToast: (toast: ToastNotice, durationMs?: number) => void;
  clearToast: () => void;
}

let toastTimer: ReturnType<typeof setTimeout> | null = null;

export const useUIStore = create<UIState>((set, get) => ({
  // Contact Drawer
  isContactOpen: false,
  setContactOpen: (open: boolean) => set({ isContactOpen: open }),
  toggleContact: () => set((state) => ({ isContactOpen: !state.isContactOpen })),

  // Confirmation
  confirmation: null,
  isConfirmationLoading: false,
  showConfirmation: (options: ConfirmationOptions) =>
    set({ confirmation: options, isConfirmationLoading: false }),
  closeConfirmation: () => {
    const current = get().confirmation;
    if (current?.onCancel) current.onCancel();
    set({ confirmation: null, isConfirmationLoading: false });
  },
  setConfirmationLoading: (loading: boolean) => set({ isConfirmationLoading: loading }),

  // Toast
  activeToast: null,
  showToast: (toast: ToastNotice, durationMs = 4000) => {
    if (toastTimer) clearTimeout(toastTimer);
    set({ activeToast: toast });
    toastTimer = setTimeout(() => {
      set({ activeToast: null });
    }, durationMs);
  },
  clearToast: () => {
    if (toastTimer) clearTimeout(toastTimer);
    set({ activeToast: null });
  },
}));

