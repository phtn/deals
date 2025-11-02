import { create } from 'zustand'
import { User } from 'firebase/auth'

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthed: boolean;
  createUser: (user: User) => void;
  updateUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setAuthed: (authed: boolean) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthed: false,
  createUser: (user) => set({ user }),
  updateUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
  setAuthed: (isAuthed) => set({ isAuthed }),
  reset: () =>
    set({
      user: null,
      isLoading: false,
      isAuthed: false,
    }),
}))
