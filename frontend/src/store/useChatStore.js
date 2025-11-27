import { create } from "zustand";
import toast from 'react-hot-toast'
import { apiClient } from "../lib/axios.js";

export const useChatStore = create((set) => ({
  messages: [],
  users: [],
  seletedUser: null,
  isUserLoading: false,
  isMessageLoading: false,

  getUsers: async () => {
    set({ isUserLoading: true });
    try {
      const response = await apiClient.get("/messages/users");
      set({ users: response.data });
    } catch (error) {
      toast.error("Failed to fetch users");
    } finally {
      set({ isUserLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessageLoading: true, seletedUser: userId });
    try {
      const response = await apiClient.get(`/messages/${userId}`);
      set({ messages: response.data });
    } catch (error) {
      toast.error("Failed to fetch messages");
    } finally {
      set({ isMessageLoading: false });
    }
  },

}));
