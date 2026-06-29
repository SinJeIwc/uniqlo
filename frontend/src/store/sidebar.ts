import { create } from "zustand";

type SidebarStore = {
  open: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
};

export const useSidebarStore = create<SidebarStore>()((set) => ({
  open: false,
  openSidebar: () => set({ open: true }),
  closeSidebar: () => set({ open: false }),
}));
