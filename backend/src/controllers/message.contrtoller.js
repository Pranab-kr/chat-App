import { Message } from "../models/message.model.js";
import { User } from "../models/user.model.js";
import cloudinary from "../utils/cloudinary.js";
import { getRecipientSocketId } from "../utils/socket.js";
import { io } from "../utils/socket.js";

// Get users for sidebar excluding the logged-in user
export const getUserForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    const fileredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");

    res.status(200).json(fileredUsers);
  } catch (error) {
    console.error("Error fetching users for sidebar:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get messages between logged-in user and another user
export const getMessagesBetweenUsers = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const otherUserId = req.params.id;

    const messages = await Message.find({
      $or: [
        { senderId: loggedInUserId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: loggedInUserId },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages between users:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Send message to another user
export const sendMessageToUser = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const receiverId = req.params.id;
    const { text, image } = req.body;

    let imageUrl = null;

    if (image) {
      const uploadResult = await cloudinary.uploader.upload(image, {
        folder: "chatApp/messages",
      });
      imageUrl = uploadResult.secure_url;
    }

    const newMessage = new Message({
      senderId: loggedInUserId,
      receiverId,
      text,
      image: imageUrl,
    });

    await newMessage.save();

    //todo: realtime functionality using sockets.io here
    const recevierSocketId = getRecipientSocketId(receiverId);

    if (recevierSocketId) {
      io.to(recevierSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error sending message to user:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
