# Bluntly Socket.io Server

Real-time WebSocket server for the Bluntly social media application, handling live comments, likes, user presence, and notifications.

## Features

- 🔌 **Real-time Comments**: Live comment updates on posts
- ❤️ **Live Reactions**: Real-time like/unlike notifications
- 👥 **User Presence**: Online/offline status tracking
- 🔔 **Push Notifications**: Instant notification delivery
- ⌨️ **Typing Indicators**: Show when users are typing comments
- 🏠 **Room Management**: Efficient post-based room system

## Architecture

This server is designed to work alongside your main REST API:

- **Main API** (Vercel): Authentication, CRUD operations, database
- **Socket Server** (Render): Real-time features only

## Setup for Development

1. **Install dependencies:**

```bash
npm install
```

2. **Create environment file:**

```bash
cp .env.example .env
```

3. **Start development server:**

```bash
npm run dev
```

## Deployment to Render

### Quick Deploy Steps:

1. **Push to GitHub**: Ensure this socket-server folder is in your repository

2. **Create Render Service**:

   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Set **Root Directory**: `socket-server`
   - Set **Build Command**: `npm install`
   - Set **Start Command**: `npm start`

3. **Environment Variables** (in Render dashboard):

   ```
   NODE_ENV=production
   FRONTEND_URL=https://your-app.com
   ```

4. **Deploy**: Render will automatically deploy and provide you a URL

### Health Check

The server includes a `/health` endpoint that Render uses for health checks:

```
GET https://your-render-app.onrender.com/health
```

## API Endpoints

### Health Check

```
GET /health
Response: { status: "OK", activeConnections: 5, activeUsers: 3 }
```

### Trigger Events (for external services)

```
POST /trigger-event
Body: {
  "event": "comment_added",
  "data": { ... },
  "postId": "post123"
}
```

### Keep Alive

```
GET /ping
Response: { pong: true, timestamp: "..." }
```

## Socket Events

### Client → Server

| Event               | Description      | Data                                   |
| ------------------- | ---------------- | -------------------------------------- |
| `user_authenticate` | User login       | `{ userId, username, profilePicture }` |
| `join_post`         | Join post room   | `postId`                               |
| `leave_post`        | Leave post room  | `postId`                               |
| `new_comment`       | Send comment     | `{ postId, comment, author }`          |
| `delete_comment`    | Delete comment   | `{ postId, commentId }`                |
| `post_liked`        | Like/unlike post | `{ postId, isLiked, likesCount }`      |
| `typing_start`      | Start typing     | `{ postId }`                           |
| `typing_stop`       | Stop typing      | `{ postId }`                           |

### Server → Client

| Event               | Description         | Data                                      |
| ------------------- | ------------------- | ----------------------------------------- |
| `authenticated`     | Auth success        | `{ success: true, userId, activeUsers }`  |
| `comment_added`     | New comment         | `{ postId, comment }`                     |
| `comment_deleted`   | Comment deleted     | `{ postId, commentId }`                   |
| `post_like_updated` | Like status changed | `{ postId, userId, isLiked, likesCount }` |
| `user_typing`       | User typing         | `{ userId, username, postId }`            |
| `user_online`       | User came online    | `{ userId, username }`                    |
| `user_offline`      | User went offline   | `{ userId, username }`                    |
| `new_notification`  | New notification    | `{ type, message, from, data }`           |

## Integration with Main Backend

Your Vercel backend can trigger socket events via HTTP:

```javascript
// In your Vercel API route
await fetch("https://your-socket-server.onrender.com/trigger-event", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    event: "comment_added",
    data: { postId, comment },
    postId: postId,
  }),
});
```

## Mobile App Integration

Connect from your React Native app:

```javascript
import io from "socket.io-client";

const socket = io("https://your-socket-server.onrender.com");

// Authenticate user
socket.emit("user_authenticate", {
  userId: currentUser.id,
  username: currentUser.username,
  profilePicture: currentUser.profilePicture,
});

// Join post for live comments
socket.emit("join_post", postId);

// Listen for new comments
socket.on("comment_added", (data) => {
  // Update UI with new comment
});
```

## Performance Notes

- **Free Tier Limitations**: Render free tier spins down after 15 minutes of inactivity
- **Auto-ping**: Server pings itself every 14 minutes to stay alive
- **Connection Limits**: Free tier supports up to 100 concurrent connections
- **Memory**: 512MB RAM limit on free tier

## Monitoring

Monitor your server health:

- Check logs in Render dashboard
- Use `/health` endpoint for status
- Monitor active connections and users

## Scaling

For production with high traffic:

- Upgrade to Render paid plan
- Consider Redis adapter for multiple server instances
- Implement rate limiting
- Add authentication middleware

## Support

For issues or questions about the socket server, check the main Bluntly repository or contact the development team.
