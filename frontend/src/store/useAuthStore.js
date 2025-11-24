import { create } from "zustand";
import { apiClient } from "../lib/axios.js";
import { toast } from "react-hot-toast";
export const useAuthStore = create((set) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,

  //check authentication status first page load
  checkAuth: async () => {
    try {
      const res = await apiClient.get("/auth/current-user");
      console.log("✅ checkAuth success:", res.data);
      set({ authUser: res.data.user });

    } catch (error) {
      console.log("❌ error in check auth", error.response?.data || error.message);
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

      toast.success("Account created! Please login");
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

      toast.success("Logged in successfully");
    } catch (error) {
      console.log("error in login", error);
      toast.error("Login failed. Please check your credentials.");
      throw error;
    } finally {
      set({ isLoggingIn: false });
    }
  },
  logout: async () => {
    try {
      await apiClient.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully");
    } catch (error) {
      console.log("error in logout", error);
      toast.error("Logout failed. Please try again.");
      throw error;
    }
  },
}));
