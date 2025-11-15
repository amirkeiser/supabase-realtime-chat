# Database Schema

## Tables

### `user_profile`

User profile information linked to auth.users.

| Column     | Type      | Nullable |
| ---------- | --------- | -------- |
| id         | uuid      | no       |
| created_at | timestamp | no       |
| name       | varchar   | no       |
| image_url  | varchar   | yes      |

**Primary Key:** id  
**Foreign Key:** id → auth.users.id

---

### `chat_room`

Chat rooms that can be public or private.

| Column     | Type      | Nullable |
| ---------- | --------- | -------- |
| id         | uuid      | no       |
| created_at | timestamp | no       |
| name       | varchar   | no       |
| is_public  | boolean   | no       |

**Primary Key:** id

---

### `chat_room_member`

Join table linking users to chat rooms.

| Column       | Type      | Nullable |
| ------------ | --------- | -------- |
| created_at   | timestamp | no       |
| member_id    | uuid      | no       |
| chat_room_id | uuid      | no       |

**Primary Key:** (member_id, chat_room_id)  
**Foreign Keys:**

- member_id → user_profile.id
- chat_room_id → chat_room.id

---

### `message`

Messages sent in chat rooms.

| Column       | Type      | Nullable |
| ------------ | --------- | -------- |
| id           | uuid      | no       |
| created_at   | timestamp | no       |
| text         | text      | no       |
| chat_room_id | uuid      | no       |
| author_id    | uuid      | no       |

**Primary Key:** id  
**Foreign Keys:**

- chat_room_id → chat_room.id
- author_id → user_profile.id

---

## Row Level Security (RLS) Policies

### `chat_room`

- **SELECT**: Authenticated users can read public rooms

### `chat_room_member`

- **SELECT**: Users can read their own memberships
- **INSERT**: Users can join public rooms (only themselves)
- **DELETE**: Users can remove themselves from rooms

### `realtime.messages`

Channel pattern: `room:${roomId}:messages`

- **SELECT**: Users can read realtime messages for rooms they're members of
- **INSERT**: Users can send realtime messages to rooms they're members of

---

## Triggers

### `on_auth_user_created`

**Table:** auth.users  
**Event:** After INSERT  
**Function:** handle_new_user()  
**Purpose:** Automatically creates a user_profile when a new user signs up

### `on_message_created`

**Table:** message  
**Event:** After INSERT  
**Function:** broadcast_new_message()  
**Purpose:** Broadcasts new messages to realtime channel `room:${roomId}:messages` with event "INSERT"

---

## Functions

### `handle_new_user()`

**Returns:** trigger  
**Security:** definer  
Creates a user_profile row with the user's id and name (from metadata or email).

### `broadcast_new_message()`

**Returns:** trigger  
**Security:** definer  
Sends message data to realtime including: id, text, created_at, author_id, author_name, author_image_url.

### `is_profile_completed(user_uuid)`

**Returns:** boolean  
**Security:** definer  
Checks if a user profile is complete.

---

## Realtime Channels

### Message Channel

**Pattern:** `room:${roomId}:messages`  
**Config:** `{ private: true }`  
**Events:**

- `INSERT` - New message created

**Payload:**

```json
{
  "id": "uuid",
  "text": "string",
  "created_at": "timestamp",
  "author_id": "uuid",
  "author_name": "string",
  "author_image_url": "string"
}
```
