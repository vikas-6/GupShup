import { Server, Socket } from "socket.io";
import User from "../modals/User";
import { generateToken } from "../utils/tokens";
import { UserProps } from "../types";

export function registerUserEvents(io: Server, socket: Socket) {
  socket.on("testSocket", (data) => {
    socket.emit("testSocket", { msg: "realtime updates" });
  });

  socket.on(
    "updateProfile",
    async (data: { name?: string; avatar?: string }) => {
      console.log("Updateprofile event: ", data);

      const userId = socket.data.userId;
      if (!userId) {
        return socket.emit("updateProfileError", {
          success: false,
          msg: "Unauthorized",
        });
      }

      try {
        const updatedUser = await User.findByIdAndUpdate(
          userId,
          { name: data.name, avatar: data.avatar },
          { new: true }
        );

        if (!updatedUser) {
          socket.emit("updateProfileError", {
            success: false,
            msg: "User not found",
          });
          return;
        }

        // get token with updated value
        const newToken = generateToken({
          _id: updatedUser._id.toString(),
          email: updatedUser.email,
          name: updatedUser.name,
          avatar: updatedUser.avatar
        } as unknown as UserProps);

        socket.emit("updateProfileSuccess", {
          success: true,
          data: { token: newToken },
          msg: "profile updated successfully",
        });
      } catch (error) {
        console.log("Error updating profile: ", error);
        socket.emit("updateProfileError", {
          success: false,
          msg: "Error updating profile",
        });
      }
    }
  );

  // Fetch contacts when user connects
  socket.on("getContacts", async () => {
    try {
      const currentUserId = socket.data.userId;
      if (!currentUserId) {
        socket.emit("getContacts", {
          success: false,
          msg: "Unauthorized",
        });
        return;
      }

      const users = await User.find(
        { _id: { $ne: currentUserId } },
        { password: 0 } // exclude password field
      ).lean(); // will fetch js objects

      const contacts = users.map((user) => ({
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        avatar: user.avatar || "",
      }));

      socket.emit("getContacts", {
        success: true,
        data: contacts,
      });
    } catch (error: any) {
      console.log("getContacts error: ", error);
      socket.emit("getContacts", {
        success: false,
        msg: "Error getting contacts",
      });
    }
  });

  socket.on("disconnect", async () => {
    // Don't emit events during disconnect as the socket is already disconnected
    console.log("User disconnected:", socket.data.userId);
  });
}