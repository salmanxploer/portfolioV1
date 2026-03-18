import { create } from "zustand";

type MotionStore = {
  activeCard: number | null;
  expandedCard: number | null;
  cursorHue: number;
  setActiveCard: (index: number | null) => void;
  setExpandedCard: (index: number | null) => void;
  setCursorHue: (hue: number) => void;
};

export const useMotionStore = create<MotionStore>((set) => ({
  activeCard: null,
  expandedCard: null,
  cursorHue: 196,
  setActiveCard: (index) => set({ activeCard: index }),
  setExpandedCard: (index) => set({ expandedCard: index }),
  setCursorHue: (hue) => set({ cursorHue: hue }),
}));
