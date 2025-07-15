# Group Discussion Platform

A full-stack MERN (MongoDB, Express.js, React, Node.js) application for real-time group discussions with voice communication and AI integration.

## 🚀 Features

### Core Functionality
- **User Authentication**: Secure registration and login with JWT tokens
- **Real-time Communication**: Socket.io powered chat and voice communication
- **Voice Chat**: WebRTC-based peer-to-peer voice communication
- **AI Agent Integration**: OpenAI-powered discussion facilitation and feedback
- **Responsive Design**: Mobile-first responsive UI design
- **Session Management**: Create, join, and manage discussion sessions

### Key Features
- 🔐 **Secure Authentication** with password strength validation
- 💬 **Real-time Messaging** with typing indicators and reactions
- 🎤 **Voice Communication** with microphone controls
- 🤖 **AI Assistant** for discussion insights and moderation
- 📱 **Responsive Design** for all devices
- 🎨 **Modern UI** with animations and smooth transitions
- 🔄 **Real-time Updates** for participants and session status

## 🛠 Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **Socket.io** - Real-time communication
- **JWT** - Authentication
- **OpenAI API** - AI integration
- **bcryptjs** - Password hashing

### Frontend
- **React** - UI library
- **React Router** - Navigation
- **Socket.io Client** - Real-time communication
- **Styled Components** - CSS-in-JS styling
- **Framer Motion** - Animations
- **Lucide React** - Icons
- **Axios** - HTTP client

## 📦 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- OpenAI API key

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd group-discussion-platform
   ```

2. **Install backend dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   # Database
   MONGO_URI=mongodb://localhost:27017/group-discussion-platform
   
   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRES_IN=30d
   
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   CLIENT_URL=http://localhost:3000
   
   # OpenAI Configuration
   OPENAI_API_KEY=your-openai-api-key-here
   ```

4. **Start the backend server**
   ```bash
   npm start          # Production
   npm run dev        # Development with nodemon
   ```

### Frontend Setup

1. **Navigate to client directory**
   ```bash
   cd client
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Start the frontend development server**
   ```bash
   npm start
   ```

### Full Development Setup

Run both backend and frontend concurrently:
```bash
npm run dev:full
```

## 🚀 Usage

### Getting Started

1. **Access the Application**
   - Open your browser and navigate to `http://localhost:3000`
   - The backend API runs on `http://localhost:5000`

2. **Create an Account**
   - Click "Sign up for free" on the login page
   - Fill in your username, email, and password
   - The system includes password strength validation

3. **Dashboard**
   - After login, you'll see the main dashboard
   - View active discussion sessions
   - Create new sessions or join existing ones

4. **Join a Discussion**
   - Click "Join" on any active session
   - Enable your microphone for voice communication
   - Start chatting and interacting with other participants

5. **AI Assistant**
   - Use the AI panel to ask questions
   - Get discussion summaries and insights
   - Receive moderation suggestions

### API Endpoints

#### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile

#### Sessions
- `POST /api/sessions` - Create new session
- `GET /api/sessions` - Get all sessions
- `GET /api/sessions/:id` - Get session by ID
- `POST /api/sessions/:id/join` - Join session
- `POST /api/sessions/:id/leave` - Leave session
- `PUT /api/sessions/:id/voice` - Update voice status

#### Messages
- `POST /api/messages` - Send message
- `GET /api/messages/:sessionId` - Get session messages
- `PUT /api/messages/:id` - Edit message
- `DELETE /api/messages/:id` - Delete message
- `POST /api/messages/:id/reaction` - Add/remove reaction

#### AI Features
- `POST /api/ai/response` - Generate AI response
- `POST /api/ai/summary/:sessionId` - Generate session summary
- `POST /api/ai/insights/:sessionId` - Generate discussion insights
- `GET /api/ai/feedback/:sessionId` - Get AI feedback

## 🎯 Key Components

### Backend Architecture

```
├── controllers/           # Request handlers
│   ├── authController.js
│   ├── sessionController.js
│   ├── messageController.js
│   └── aiController.js
├── models/               # Database schemas
│   ├── User.js
│   ├── Session.js
│   ├── Message.js
│   └── AIFeedback.js
├── routes/               # API routes
│   ├── authRoutes.js
│   ├── sessionRoutes.js
│   ├── messageRoutes.js
│   └── aiRoutes.js
├── middleware/           # Custom middleware
│   ├── auth.js
│   └── socketAuth.js
├── socket/               # Socket.io handlers
│   └── socketHandlers.js
└── server.js            # Main server file
```

### Frontend Architecture

```
├── src/
│   ├── components/       # React components
│   │   ├── auth/        # Authentication components
│   │   ├── dashboard/   # Dashboard components
│   │   ├── session/     # Session components
│   │   └── shared/      # Reusable components
│   ├── contexts/        # React contexts
│   │   ├── AuthContext.js
│   │   └── SocketContext.js
│   ├── styles/          # Styled components
│   │   └── GlobalStyles.js
│   └── App.js           # Main app component
```

## 🔧 Configuration

### MongoDB Setup

**Local MongoDB:**
```bash
# Start MongoDB service
sudo systemctl start mongod

# Connect to MongoDB
mongo
```

**MongoDB Atlas:**
1. Create a cluster on MongoDB Atlas
2. Get your connection string
3. Update `MONGO_URI` in `.env`

### OpenAI Setup

1. Get an API key from OpenAI
2. Add it to your `.env` file as `OPENAI_API_KEY`
3. Ensure you have sufficient credits for API usage

## 🚀 Deployment

### Backend Deployment (Vercel/Heroku)

1. **Environment Variables**: Set all required environment variables
2. **Build Command**: `npm install`
3. **Start Command**: `npm start`

### Frontend Deployment (Vercel/Netlify)

1. **Build Command**: `npm run build`
2. **Publish Directory**: `build`
3. **Environment Variables**: Set `REACT_APP_SERVER_URL`

### Docker Deployment

```dockerfile
# Dockerfile example for backend
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 🧪 Testing

### Backend Testing
```bash
# Run backend tests
npm test

# Test API endpoints
curl http://localhost:5000/api/health
```

### Frontend Testing
```bash
cd client
npm test
```

## 📱 Mobile Responsiveness

The application is built with a mobile-first approach:
- Responsive breakpoints: 768px (tablet), 1024px (desktop)
- Touch-friendly interface
- Optimized for various screen sizes
- Progressive Web App capabilities

## 🔒 Security Features

- **JWT Authentication** with secure token handling
- **Password Hashing** using bcryptjs
- **Rate Limiting** to prevent abuse
- **CORS Protection** for cross-origin requests
- **Input Validation** on both client and server
- **Helmet.js** for security headers

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   ```bash
   # Check if MongoDB is running
   sudo systemctl status mongod
   
   # Restart MongoDB
   sudo systemctl restart mongod
   ```

2. **Port Already in Use**
   ```bash
   # Kill process on port 5000
   lsof -ti:5000 | xargs kill
   ```

3. **Socket Connection Issues**
   - Check if backend server is running
   - Verify CORS settings
   - Check firewall settings

4. **OpenAI API Errors**
   - Verify API key is correct
   - Check API usage limits
   - Ensure sufficient credits

### Performance Optimization

- **Enable gzip compression**
- **Use MongoDB indexing**
- **Implement caching strategies**
- **Optimize bundle size**
- **Use CDN for static assets**

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the troubleshooting section

## 🙏 Acknowledgments

- React team for the amazing library
- Socket.io for real-time communication
- OpenAI for AI capabilities
- MongoDB for the database solution
- All contributors and open-source libraries used

---

**Happy Discussing! 🎉**
