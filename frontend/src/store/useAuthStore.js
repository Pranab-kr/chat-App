import { create } from "zustand";
import { apiClient } from "../lib/axios.js";

export const useAuthStore = create((set) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,

  checkAuth: async () => {
    try {
      const res = await apiClient.get("/auth/current-user");

      set({ authUser: res.data.user });
    } catch (error) {
      console.log("error in check auth", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (formData) => {
    set({ isSigningUp: true });
    try {
      await apiClient.post("/auth/signup", formData);
      // Don't set authUser here - user needs to login to get cookies
      set({ authUser: null });
    } catch (error) {
      console.log("error in signup", error);
      set({ authUser: null });
      throw error;
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (formData) => {
    set({ isLoggingIn: true });
    try {
      const res = await apiClient.post("/auth/login", formData);

      set({ authUser: res.data.user });
    } catch (error) {
      console.log("error in login", error);
      throw error;
    } finally {
      set({ isLoggingIn: false });
    }
  },
}));
