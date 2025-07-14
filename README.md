# Bluntly - Social Media Platform

A modern social media platform built with React Native (Expo) for mobile and Node.js/Express for backend, featuring real-time messaging, image sharing, and social authentication.

## 🚀 Features

### Mobile App

- **Authentication**: Social login with Google and GitHub via Clerk
- **Posts**: Create, view, and interact with posts
- **Comments**: Comment on posts with real-time updates
- **Notifications**: Real-time notification system
- **Profile Management**: User profiles with customizable information
- **Image Upload**: Share images with Cloudinary integration
- **Real-time Messaging**: Chat functionality with Socket.io
- **Search**: Find users and content
- **Modern UI**: Built with NativeWind (Tailwind CSS for React Native)

### Backend API

- **RESTful API**: Express.js server with MongoDB
- **Real-time Features**: Socket.io for live updates
- **Authentication**: Clerk integration for secure user management
- **Rate Limiting**: Arcjet middleware for API protection
- **Image Processing**: Cloudinary for media management
- **Database**: MongoDB with Mongoose ODM

## 🛠️ Tech Stack

### Mobile (Frontend)

- **Framework**: React Native with Expo
- **Navigation**: Expo Router (File-based routing)
- **Styling**: NativeWind (Tailwind CSS)
- **State Management**: TanStack Query (React Query)
- **Authentication**: Clerk Expo
- **HTTP Client**: Axios
- **UI Components**: Custom components with React Native
- **Development**: TypeScript

### Backend

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: Clerk Express
- **Real-time**: Socket.io
- **File Upload**: Multer
- **Image Storage**: Cloudinary
- **Security**: Arcjet (Rate limiting & protection)
- **Environment**: dotenv

## 📱 Project Structure

```
Bluntly/
├── mobile/                     # React Native mobile app
│   ├── app/                   # App routes (Expo Router)
│   │   ├── (auth)/           # Authentication screens
│   │   ├── (tabs)/           # Main app tabs
│   │   └── _layout.tsx       # Root layout
│   ├── components/           # Reusable UI components
│   ├── hooks/               # Custom React hooks
│   ├── types/               # TypeScript type definitions
│   ├── utils/               # Utility functions
│   └── assets/              # Static assets
├── backend/                  # Node.js backend API
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   ├── controllers/     # Route controllers
│   │   ├── middlewares/     # Custom middleware
│   │   ├── models/          # MongoDB models
│   │   ├── routes/          # API routes
│   │   └── server.js        # Entry point
│   └── vercel.json          # Vercel deployment config
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MongoDB instance (local or cloud)
- Expo CLI
- Clerk account
- Cloudinary account
- Arcjet account

### Backend Setup

1. **Navigate to backend directory**

   ```bash
   cd backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Create environment file**

   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables**

   ```env
   PORT=3000
   NODE_ENV=development
   MONGO_URI=mongodb://localhost:27017/bluntly

   # Clerk Configuration
   CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key

   # Cloudinary Configuration
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret

   # Arcjet Configuration
   ARCJET_ENV=development
   ARCJET_KEY=your_arcjet_key
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

The backend will be running at `http://localhost:3000`

### Mobile App Setup

1. **Navigate to mobile directory**

   ```bash
   cd mobile
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Create environment file**

   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables**

   ```env
   EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   EXPO_PUBLIC_API_URL=http://localhost:3000
   ```

5. **Start the Expo development server**

   ```bash
   npm start
   ```

6. **Run on device/simulator**

   ```bash
   # iOS
   npm run ios

   # Android
   npm run android

   # Web
   npm run web
   ```

## 🔧 Configuration

### Clerk Setup

1. Create a Clerk application at [clerk.com](https://clerk.com)
2. Configure OAuth providers (Google, GitHub)
3. Set up redirect URLs:
   - Development: `exp://localhost:19000/--/oauth-native-callback`
   - Production: `your-app-scheme://oauth-native-callback`

### Cloudinary Setup

1. Create account at [cloudinary.com](https://cloudinary.com)
2. Get your cloud name, API key, and API secret
3. Configure upload presets for image handling

### Arcjet Setup

1. Create account at [arcjet.com](https://arcjet.com)
2. Get your API key for rate limiting and security

### MongoDB Setup

- **Local**: Install MongoDB locally
- **Cloud**: Use MongoDB Atlas or any cloud provider

## 📚 API Documentation

### Authentication

All API endpoints require authentication via Clerk JWT tokens.

### Endpoints

#### Users

- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/sync` - Sync user data

#### Posts

- `GET /api/posts` - Get all posts
- `POST /api/posts` - Create new post
- `GET /api/posts/:id` - Get specific post
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post

#### Comments

- `GET /api/comments/:postId` - Get post comments
- `POST /api/comments` - Create comment
- `DELETE /api/comments/:id` - Delete comment

#### Notifications

- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark notification as read

## 🚀 Deployment

### Backend (Vercel)

1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel --prod`
3. Configure environment variables in Vercel dashboard

### Mobile App

1. **Build for iOS**: `expo build:ios`
2. **Build for Android**: `expo build:android`
3. **Web deployment**: `expo export:web`

## 🔐 Security Features

- **Rate Limiting**: Arcjet middleware protects against abuse
- **Authentication**: Clerk handles secure user authentication
- **Input Validation**: Server-side validation for all inputs
- **CORS**: Configured for secure cross-origin requests

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📝 Scripts

### Backend

- `npm run dev` - Start development server with hot reload
- `npm start` - Start production server

### Mobile

- `npm start` - Start Expo development server
- `npm run android` - Run on Android
- `npm run ios` - Run on iOS
- `npm run web` - Run on web
- `npm run lint` - Run ESLint

## 📦 Dependencies

### Backend Dependencies

- **express**: Web framework
- **mongoose**: MongoDB ODM
- **@clerk/express**: Authentication middleware
- **socket.io**: Real-time communication
- **cloudinary**: Image management
- **@arcjet/node**: API protection
- **cors**: Cross-origin resource sharing
- **multer**: File upload handling

### Mobile Dependencies

- **expo**: React Native framework
- **@clerk/clerk-expo**: Authentication
- **@tanstack/react-query**: Data fetching
- **expo-router**: File-based routing
- **nativewind**: Tailwind CSS for React Native
- **axios**: HTTP client
- **react-native-reanimated**: Animations

## 🐛 Troubleshooting

### Common Issues

1. **OAuth Callback Error**: Ensure redirect URLs are properly configured in Clerk
2. **Environment Variables**: Check that all required env vars are set
3. **MongoDB Connection**: Verify MongoDB is running and accessible
4. **Metro Bundle Error**: Clear cache with `npx expo start --clear`

### Debug Commands

```bash
# Clear Expo cache
npx expo start --clear

# Reset project
npm run reset-project

# Check dependencies
npm ls
```

## 📄 License

This project is licensed under the ISC License.

## 👨‍💻 Author

**MaximumCell**

- GitHub: [@MaximumCell](https://github.com/MaximumCell)

## 🙏 Acknowledgments

- Clerk for authentication services
- Cloudinary for image management
- Arcjet for API security
- Expo team for the amazing development experience

---

For more information, please refer to the individual package.json files in each directory or contact the development team.
