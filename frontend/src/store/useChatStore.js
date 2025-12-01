import { create } from "zustand";
import toast from "react-hot-toast";
import { apiClient } from "../lib/axios.js";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
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
    set({ isMessageLoading: true });
    try {
      const response = await apiClient.get(`/messages/${userId}`);
      set({ messages: response.data });
    } catch (error) {
      toast.error("Failed to fetch messages");
      console.error("Get messages error:", error);
    } finally {
      set({ isMessageLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser , messages } = get();

    try {
      const res  = await apiClient.post(`/messages/send/${selectedUser._id}`, messageData);

      set({ messages: [...messages, res.data] });

    } catch (error) {
      toast.error("Failed to send message");
      console.error("Send message error:", error);
    }
  },

  //todo: optimize this one later
  setSelectedUser: (user) => set({ selectedUser: user }),
}));
