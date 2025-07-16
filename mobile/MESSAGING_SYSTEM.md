# Real-Time Messaging System

This document describes the implementation of a real-time messaging system for the Bluntly mobile app.

## Features

### ✅ Real-Time Messaging

- **Socket.IO Integration**: Real-time bidirectional communication between users
- **Message Delivery**: Instant message delivery with fallback to HTTP API
- **Connection Status**: Visual indicator showing connection status (connected/connecting/failed)
- **Online Users**: Real-time tracking of online users with visual indicators

### ✅ User Interface

- **Modern Chat UI**: Clean, Twitter-like messaging interface
- **Message Bubbles**: Distinct styling for sent vs received messages
- **Auto-Scroll**: Automatic scrolling to latest messages
- **Keyboard Handling**: Proper keyboard avoidance for better UX
- **Pull-to-Refresh**: Refresh conversations with pull gesture

### ✅ User Search & Discovery

- **User Search Modal**: Search for users by name, username, or email
- **Start New Conversations**: Begin conversations with any user
- **User Profiles**: Display user avatars, names, and verification status

### ✅ Message Management

- **Message History**: Persistent message storage and retrieval
- **Unread Count**: Badge showing unread message count per conversation
- **Message Timestamps**: Relative time formatting (e.g., "2 hours ago")
- **Delete Conversations**: Long-press to delete entire conversations

### ✅ Backend Integration

- **Message API**: RESTful endpoints for message CRUD operations
- **User Search**: API endpoint for finding users
- **Socket Events**: Real-time event handling for messages and user status
- **Authentication**: Secure message sending with user authentication

## Architecture

### Frontend Components

```
mobile/
├── app/(tabs)/messages.tsx          # Main messages screen
├── components/UserSearchModal.tsx   # User search and selection
├── hooks/useMessages.ts             # Message management logic
├── services/socket.ts               # Socket.IO service
└── utils/api.ts                     # API client functions
```

### Backend Components

```
backend/
├── src/routes/message.route.js      # Message API routes
├── src/controllers/user.controller.js # User search functionality
├── src/models/message.model.js      # Message data model
└── src/libs/socket.js               # Socket.IO server logic
```

## API Endpoints

### Messages

- `GET /api/messages/conversations` - Get all conversations for current user
- `GET /api/messages/:userId` - Get messages with specific user
- `POST /api/messages` - Send a new message
- `DELETE /api/messages/conversation/:userId` - Delete conversation

### Users

- `GET /api/users/search?q=query` - Search for users

## Socket Events

### Client → Server

- `user_connected` - User comes online
- `send_message` - Send a message
- `update_activity` - Update user activity status

### Server → Client

- `receive_message` - Receive a new message
- `message_sent` - Confirmation of sent message
- `user_connected` - User came online
- `user_disconnected` - User went offline
- `users_online` - List of online users

## Data Models

### Message

```javascript
{
  _id: string,
  senderId: string,
  receiverId: string,
  content: string,
  read: boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Conversation

```javascript
{
  _id: string,
  user: {
    _id: string,
    username: string,
    name: string,
    avatar: string,
    verified: boolean
  },
  lastMessage: Message,
  unreadCount: number,
  updatedAt: Date
}
```

## Usage

### Starting a New Conversation

1. Tap the edit icon in the messages header
2. Search for a user by name or username
3. Select a user from the search results
4. Start messaging immediately

### Sending Messages

1. Open an existing conversation or start a new one
2. Type your message in the input field
3. Tap the send button or press enter
4. Message is sent via Socket.IO for real-time delivery

### Managing Conversations

- **Open**: Tap on any conversation to view messages
- **Delete**: Long-press on a conversation to delete it
- **Search**: Use the search bar to filter conversations

## Implementation Details

### Real-Time Communication

The system uses Socket.IO for real-time messaging with HTTP API as fallback. Messages are stored in MongoDB and synchronized across all connected clients.

### State Management

React Query is used for server state management, providing caching, background updates, and optimistic updates for better UX.

### Error Handling

Comprehensive error handling for network issues, authentication failures, and message delivery problems.

### Performance Optimizations

- Message pagination for large conversations
- Efficient socket connection management
- Optimized re-renders with React memo and callbacks

## Security

- All API endpoints require authentication
- Message content is validated and sanitized
- Socket connections are authenticated
- User permissions are checked before message operations

## Future Enhancements

- [ ] Message reactions and emojis
- [ ] File and image sharing
- [ ] Message encryption
- [ ] Group messaging
- [ ] Message status indicators (sent/delivered/read)
- [ ] Push notifications for new messages
- [ ] Message search functionality
- [ ] Voice messages
- [ ] Video calling integration
