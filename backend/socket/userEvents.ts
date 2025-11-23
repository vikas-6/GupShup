import { Server, Socket } from "socket.io";
import User from "../models/User";
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
        const newToken = generateToken(updatedUser);

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
}