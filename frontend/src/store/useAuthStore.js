import { create } from "zustand";
import { apiClient } from "../lib/axios.js";
import { toast } from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL =
  import.meta.env.MODE === "development" ? "http://localhost:8000/" : "/";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,

  //check authentication status first page load
  checkAuth: async () => {
    try {
      const res = await apiClient.get("/auth/current-user");
      // console.log("✅ checkAuth success:", res.data);
      set({ authUser: res.data.user });

      get().connectSocket();
    } catch (error) {
      console.log(
        "❌ error in check auth",
        error.response?.data || error.message
      );

      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  //signup
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

  //login
  login: async (formData) => {
    set({ isLoggingIn: true });
    try {
      const res = await apiClient.post("/auth/login", formData);

      set({ authUser: res.data.user });

      toast.success("Logged in successfully");

      get().connectSocket();
    } catch (error) {
      console.log("error in login", error);
      toast.error("Login failed. Please check your credentials.");
      throw error;
    } finally {
      set({ isLoggingIn: false });
    }
  },

  //logout
  logout: async () => {
    try {
      await apiClient.post("/auth/logout");
      set({ authUser: null });

      toast.success("Logged out successfully");

      get().disconnectSocket();
    } catch (error) {
      console.log("error in logout", error);
      toast.error("Logout failed. Please try again.");
      throw error;
    }
  },

  //update profile
  updateProfile: async (formData) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await apiClient.patch("/auth/update-profile", formData);

      set({ authUser: res.data.user });

      toast.success("Profile updated successfully");
    } catch (error) {
      console.log("error in update profile", error);
      toast.error("Profile update failed. Please try again.");

      throw error;
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  // connect socket
  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    const socket = io(BASE_URL, {
      autoConnect: false,
      query: { userId: authUser._id },
    });
    set({ socket });

    socket.connect();

    // Remove any existing listeners before adding new ones
    socket.off("getOnlineUsers");

    socket.on("getOnlineUsers", (onlineUsers) => {
      set({ onlineUsers });
    });
  },

  // disconnect socket
  disconnectSocket: () => {
    const socket = get().socket;
    if (socket?.connected) {
      socket.off("getOnlineUsers"); // Remove listeners
      socket.disconnect();
    }
    set({ socket: null });
  },
}));
