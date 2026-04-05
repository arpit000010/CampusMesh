// ============================================================
// Presence Handler — online/offline socket events
// ============================================================
// On connect: mark online, notify rooms
// On disconnect: mark offline (if last socket), notify rooms
//
// WHY broadcast to rooms instead of everyone?
// ──────────────────────────────────────────
// If Arpit goes online, only people IN HIS ROOMS care.
// Random users in other rooms don't need to know.
// So we broadcast to each room Arpit is a member of.
// ============================================================

import { SOCKET_EVENTS } from "../../../shared/constants.js";
import {
  addUser,
  removeUser,
  getOnlineUsersFromList,
} from "../modules/presence/presence.service.js";
import Room from "../models/Room.js";

export const registerPresenceHandlers = (io, socket) => {
  const userId = socket.user._id.toString();
  const username = socket.user.username;

  // ── Mark user as online ────────────────────────────────────
  const justCameOnline = addUser(userId, socket.id);

  // Only broadcast if this is their FIRST socket (not a 2nd tab)
  if (justCameOnline) {
    // Get all rooms this user is in and notify members
    Room.find({ members: socket.user._id, isActive: true })
      .select("_id")
      .then((rooms) => {
        rooms.forEach((room) => {
          socket.to(room._id.toString()).emit(SOCKET_EVENTS.USER_ONLINE, {
            userId,
            username,
          });
        });
      });
  }

  // ── Client requests online users for a specific room ───────
  socket.on(SOCKET_EVENTS.ONLINE_USERS, async ({ roomId }) => {
    try {
      const room = await Room.findById(roomId).select("members");
      if (!room) return;

      const memberIds = room.members.map((id) => id.toString());
      const onlineMembers = getOnlineUsersFromList(memberIds);

      socket.emit(SOCKET_EVENTS.ONLINE_USERS, {
        roomId,
        users: onlineMembers,
      });
    } catch (error) {
      console.error("Error fetching online users:", error.message);
    }
  });

  // ── Handle disconnect ──────────────────────────────────────
  socket.on(SOCKET_EVENTS.DISCONNECT, (reason) => {
    console.log(`🔴 User disconnected: ${username} (${reason})`);
    const wentOffline = removeUser(userId, socket.id);

    // Only broadcast if ALL their sockets are gone
    if (wentOffline) {
      Room.find({ members: socket.user._id, isActive: true })
        .select("_id")
        .then((rooms) => {
          rooms.forEach((room) => {
            socket.to(room._id.toString()).emit(SOCKET_EVENTS.USER_OFFLINE, {
              userId,
              username,
            });
          });
        });
    }
  });
};
