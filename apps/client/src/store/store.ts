import { create } from "zustand";

type State = {
  isSearchOpen: boolean;

  setIsSearchOpen: (isSearchOpen: boolean) => void;
};

export const useStore = create<State>((set) => ({
  isSearchOpen: false,

  setIsSearchOpen: (isSearchOpen) => {
    set({ isSearchOpen });
  },
}));
