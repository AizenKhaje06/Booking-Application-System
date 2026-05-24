import { create } from "zustand";

interface UiState {
  sidebarOpen: boolean;
  mobileMenuOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setMobileMenuOpen: (open: boolean) => void;
  toggleMobileMenu: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: true,
  mobileMenuOpen: false,
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setMobileMenuOpen: (mobileMenuOpen) => set({ mobileMenuOpen }),
  toggleMobileMenu: () => set((s) => ({ mobileMenuOpen: !s.mobileMenuOpen })),
}));
