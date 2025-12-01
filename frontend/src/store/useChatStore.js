import { create } from "zustand";
import toast from "react-hot-toast";
import { apiClient } from "../lib/axios.js";
import { useAuthStore } from "./useAuthStore.js";

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
    const { selectedUser, messages } = get();

    try {
      const res = await apiClient.post(
        `/messages/send/${selectedUser._id}`,
        messageData
      );

      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error("Failed to send message");
      console.error("Send message error:", error);
    }
  },

  subcribeToNewMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.on("newMessage", (newMessage) => {
      const { messages, selectedUser } = get(); // Get current state when event fires

      //only add message if it's from/to the selected user
      if (
        selectedUser &&
        (newMessage.senderId === selectedUser._id ||
          newMessage.receiverId === selectedUser._id)
      ) {
        set({ messages: [...messages, newMessage] });
      }
    });
  },

  unscribeFromNewMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.off("newMessage");
  },

  setSelectedUser: (user) => set({ selectedUser: user }),
}));
