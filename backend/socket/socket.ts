import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { Server as SocketIOServer, Socket } from "socket.io";
import user from "../modals/User";
import { registerUserEvents } from "./userEvents";
import { registerChatEvents } from "./ChatEvents";
import Conversation from "../modals/Conversation";

dotenv.config();

export function initializeSocket(server: any): SocketIOServer {
  const io = new SocketIOServer(server, {
    cors: {
      origin: "*", // allow all origins
    },
  }); // socket io server instance

  // authentication middleware
  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication error"));
    }

    jwt.verify(
      token,
      process.env.JWT_SECRET as string,
      (err: any, decoded: any) => {
        if (err) {
          return next(new Error("Authentication error"));
        }

        // attach user data to the socket
        let userData = decoded.user; // Changed from decoded.User to decoded.user
        socket.data = userData;
        socket.data.userId = userData.id; // This should work with the token structure
        next();
      }
    );
  });

  // when socket connects, register events
  io.on("connection", async (socket: Socket) => {
    const userId = socket.data.userId;
    console.log(`User connected: ${userId}, username: ${socket.data.name}`);

    // register events
    registerChatEvents(io, socket);
    registerUserEvents(io, socket);

    // join all the conversations the user is part of
    try {
      const conversation = await Conversation.find({
        participants: userId,
      }).select("_id");

      conversation.forEach((conversation) => {
        socket.join(conversation._id.toString());
      });
    } catch (error: any) {
      console.log(`Error joining conversations: ${error.message}`);
    }

    socket.on("disconnect", () => {
      // user logs out
      console.log(`User disconnected: ${userId}`);
    });
  });

  return io;
}
