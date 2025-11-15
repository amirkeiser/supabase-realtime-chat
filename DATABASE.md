# Database Schema

## Tables

### `user_profile`

User profile information linked to auth.users.

| Column           | Type                | Nullable | Default      |
| ---------------- | ------------------- | -------- | ------------ |
| id               | uuid                | no       |              |
| created_at       | timestamp           | no       |              |
| name             | varchar             | no       |              |
| image_url        | varchar             | yes      |              |
| role             | user_role           | no       | 'user'       |
| profile_status   | user_profile_status | no       | 'incomplete' |
| photo_url        | varchar             | yes      |              |
| bio              | text                | yes      |              |
| date_of_birth    | date                | yes      |              |
| gender           | gender_type         | yes      |              |
| location         | varchar             | yes      |              |
| religious_info   | jsonb               | yes      | '{}'         |
| preferences      | jsonb               | yes      | '{}'         |
| submitted_at     | timestamp           | yes      |              |
| reviewed_at      | timestamp           | yes      |              |
| reviewed_by      | uuid                | yes      |              |
| rejection_reason | text                | yes      |              |

**Primary Key:** id  
**Foreign Keys:**

- id → auth.users.id
- reviewed_by → user_profile.id

**Enums:**

- `user_role`: 'user', 'admin'
- `user_profile_status`: 'incomplete', 'pending_review', 'approved', 'rejected'
- `gender_type`: 'male', 'female', 'other'

---

### `chat_room`

Chat rooms that can be public or private. Can be linked to connections for private chats.

| Column        | Type      | Nullable |
| ------------- | --------- | -------- |
| id            | uuid      | no       |
| created_at    | timestamp | no       |
| name          | varchar   | no       |
| is_public     | boolean   | no       |
| connection_id | uuid      | yes      |

**Primary Key:** id  
**Foreign Keys:**

- connection_id → connections.id

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

### `connection_requests`

Stores connection requests between users with their status.

| Column       | Type                      | Nullable | Default   |
| ------------ | ------------------------- | -------- | --------- |
| id           | uuid                      | no       |           |
| created_at   | timestamp                 | no       |           |
| sender_id    | uuid                      | no       |           |
| receiver_id  | uuid                      | no       |           |
| status       | connection_request_status | no       | 'pending' |
| responded_at | timestamp                 | yes      |           |

**Primary Key:** id  
**Foreign Keys:**

- sender_id → user_profile.id
- receiver_id → user_profile.id

**Enums:**

- `connection_request_status`: 'pending', 'accepted', 'declined'

**Constraints:**

- unique (sender_id, receiver_id) - prevents duplicate requests
- sender_id != receiver_id - prevents self-requests

---

### `connections`

Stores accepted connections between users. User IDs are ordered (user1_id < user2_id).

| Column                | Type      | Nullable |
| --------------------- | --------- | -------- |
| id                    | uuid      | no       |
| created_at            | timestamp | no       |
| user1_id              | uuid      | no       |
| user2_id              | uuid      | no       |
| connection_request_id | uuid      | no       |
| chat_room_id          | uuid      | yes      |

**Primary Key:** id  
**Foreign Keys:**

- user1_id → user_profile.id
- user2_id → user_profile.id
- connection_request_id → connection_requests.id
- chat_room_id → chat_room.id

**Constraints:**

- user1_id < user2_id - ensures consistent ordering
- unique (user1_id, user2_id) - prevents duplicate connections

---

## Row Level Security (RLS) Policies

### `user_profile`

- **SELECT**:
  - Users can view their own profile (any status)
  - Users can view any approved profile (for matchmaking)
  - Admins can view all profiles
- **UPDATE**:
  - Users can update their own profile **except** the `role` column
  - Users can edit profile even after approval (status doesn't restrict updates)
  - Admins can update any profile including roles
- **INSERT**:
  - Users can only insert their own profile with `role = 'user'`
- **DELETE**:
  - No deletion allowed (use soft delete if needed)

### `chat_room`

- **SELECT**:
  - Users can view public rooms
  - Users can view rooms they're members of
  - Users can view connection-based rooms they're part of

### `chat_room_member`

- **SELECT**: Users can read their own memberships
- **INSERT**:
  - Users can join public rooms (only themselves)
  - System can add users to connection rooms
- **DELETE**: Users can remove themselves from rooms

### `connection_requests`

- **SELECT**: Users can view requests where they are sender or receiver
- **INSERT**: Users can send requests to approved users (not themselves)
- **UPDATE**: Only receivers can update requests (to accept/decline)
- **DELETE**: Users can delete their own pending sent requests

### `connections`

- **SELECT**: Users can view connections they are part of
- **INSERT**: Blocked (must use `create_connection()` function)
- **DELETE**: Users can delete their own connections

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

### `enforce_role_changes`

**Table:** user_profile  
**Event:** Before UPDATE  
**Function:** prevent_role_escalation()  
**Purpose:** Prevents non-admin users from changing the `role` column (privilege escalation protection)

---

## Functions

### `handle_new_user()`

**Returns:** trigger  
**Security:** definer  
Creates a user_profile row with the user's id, name (from metadata or email), and role (default: 'user', or from metadata).

### `broadcast_new_message()`

**Returns:** trigger  
**Security:** definer  
Sends message data to realtime including: id, text, created_at, author_id, author_name, author_image_url.

### `is_profile_completed(user_uuid)`

**Returns:** boolean  
**Security:** definer  
Checks if a user profile is complete.

### `is_admin()`

**Returns:** boolean  
**Security:** definer  
Returns true if the current authenticated user has the 'admin' role.

### `prevent_role_escalation()`

**Returns:** trigger  
**Security:** invoker  
Blocks updates to the `role` column unless the current user is an admin. Raises exception if non-admin attempts to change roles.

### `approve_profile(target_user_id)`

**Returns:** void  
**Security:** definer  
Approves a user profile (admin only). Sets profile_status to 'approved' and records review metadata.

### `reject_profile(target_user_id, reason)`

**Returns:** void  
**Security:** definer  
Rejects a user profile (admin only). Sets profile_status to 'rejected' and optionally stores rejection reason.

### `are_users_connected(user_id1, user_id2)`

**Returns:** boolean  
**Security:** definer  
Checks if two users have an established connection.

### `get_connection_between_users(user_id1, user_id2)`

**Returns:** uuid  
**Security:** definer  
Returns the connection ID between two users if it exists.

### `create_connection(request_id)`

**Returns:** uuid  
**Security:** definer  
Creates a connection when a request is accepted. This function:

- Validates the request is pending and belongs to the current user
- Creates a private chat room
- Creates the connection record
- Updates the request status to 'accepted'
- Adds both users to the chat room
  Returns the connection ID.

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
