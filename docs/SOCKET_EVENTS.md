# CampusMesh — Socket Event Reference

> This document lists every Socket.io event in the system, who sends it, who receives it, and what data it carries. Keep this updated as you add new events.

## Connection Events

| Event | Direction | Payload | Description |
|-------|-----------|---------|-------------|
| `connection` | Client → Server | JWT in `handshake.auth.token` | Client connects to Socket.io |
| `connection_ack` | Server → Client | `{ userId, username }` | Server confirms identity |
| `disconnect` | Client → Server | — | Client disconnects (or loses connection) |

## Room Events

| Event | Direction | Payload | Description |
|-------|-----------|---------|-------------|
| `join_room` | Client → Server | `{ roomId }` | Client wants to join a room |
| `leave_room` | Client → Server | `{ roomId }` | Client wants to leave a room |
| `user_joined` | Server → Room | `{ userId, username, roomId }` | Notify room that someone joined |
| `user_left` | Server → Room | `{ userId, username, roomId }` | Notify room that someone left |

## Message Events

| Event | Direction | Payload | Description |
|-------|-----------|---------|-------------|
| `send_message` | Client → Server | `{ roomId, content, type? }` | Client sends a message |
| `new_message` | Server → Room | `{ _id, room, sender, content, type, createdAt }` | Broadcast message to room |
| `typing_start` | Client → Server | `{ roomId }` | Client starts typing |
| `typing_stop` | Client → Server | `{ roomId }` | Client stops typing |
| `user_typing` | Server → Room | `{ userId, username, roomId }` | Broadcast typing indicator |

## Chat Request Events

| Event | Direction | Payload | Description |
|-------|-----------|---------|-------------|
| `chat_request_sent` | Server → Receiver | `{ requestId, from, message }` | Notify receiver of new request |
| `chat_request_accepted` | Server → Sender | `{ requestId, roomId }` | Notify sender request was accepted |
| `chat_request_rejected` | Server → Sender | `{ requestId }` | Notify sender request was rejected |

## Presence Events

| Event | Direction | Payload | Description |
|-------|-----------|---------|-------------|
| `user_online` | Server → Rooms | `{ userId, username }` | User came online |
| `user_offline` | Server → Rooms | `{ userId, username }` | User went offline |
| `online_users` | Server → Client | `{ roomId, users: [...] }` | List of online users in a room |
