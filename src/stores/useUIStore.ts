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

export type ThemeMode = 'light' | 'dark';

function applyThemeToDom(theme: ThemeMode) {
  if (typeof document !== 'undefined') {
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.classList.toggle('dark', theme === 'dark');
    root.style.colorScheme = theme;
  }
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem('chaturanga-theme', theme);
    } catch {
      // Ignore storage quota / private mode restrictions
    }
  }
}

interface UIState {
  // Light / Dark Theme Mode
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;

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
  // Theme Mode
  theme: 'dark',
  setTheme: (theme: ThemeMode) => {
    applyThemeToDom(theme);
    set({ theme });
  },
  toggleTheme: () => {
    const next: ThemeMode = get().theme === 'dark' ? 'light' : 'dark';
    applyThemeToDom(next);
    set({ theme: next });
  },

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

