export interface User {
  _id: string;
  username: string;
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
}

export interface Message {
  _id: string;
  senderId: string | User;
  receiverId: string | User;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  userId: string;
  username: string;
  lastMessage?: Message;
  unreadCount?: number;
  isOnline?: boolean;
  activity?: string;
}

export interface SocketUser {
  _id: string;
  username: string;
}

export interface Comment {
  _id: string;
  content: string;
  createdAt: string;
  user: User;
}

export interface Post {
  _id: string;
  content: string;
  image?: string;
  createdAt: string;
  user: User;
  likes: string[];
  comments: Comment[];
}

export interface Notification {
  _id: string;
  from: {
    username: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
  };
  to: string;
  type: "like" | "comment" | "follow";
  post?: {
    _id: string;
    content: string;
    image?: string;
  };
  comment?: {
    _id: string;
    content: string;
  };
  createdAt: string;
}