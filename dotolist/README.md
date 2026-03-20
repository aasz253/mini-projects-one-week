# AlwaysFront - Student Task Manager

<div align="center">
  <img src="https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react" alt="React">
  <img src="https://img.shields.io/badge/Node.js-Express-green?style=for-the-badge&logo=nodedotjs" alt="Node.js">
  <img src="https://img.shields.io/badge/MongoDB-4.4-green?style=for-the-badge&logo=mongodb" alt="MongoDB">
  <img src="https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS">
</div>

> **AlwaysFront** is a modern, production-ready To-Do List application designed specifically for university students (comrades). It helps you manage tasks, track deadlines, plan study sessions, and achieve academic success.

## Features

### Core Features
- **User Authentication**: Sign up, login, logout with secure JWT tokens
- **Google Sign-In**: Quick authentication with Google OAuth 2.0
- **Password Reset**: Secure password recovery via email

### Task Management
- Create, edit, delete tasks with full CRUD operations
- Mark tasks as complete/incomplete with visual feedback
- **Priority Levels**: Low, Medium, High with color-coded badges
- **Categories**: Assignments, Exams, Personal, Projects, Study, Other
- Due dates and deadline tracking
- Task descriptions and notes
- Subtasks support for complex tasks
- Tags for flexible organization
- Favorite/important tasks marking
- Drag-and-drop task reordering
- Search and filter tasks

### Student-Focused Features
- **Course-based grouping**: Link tasks to specific courses (e.g., BCS 221, BCS 225)
- **Exam countdown timer**: Track upcoming exams with days remaining
- **Assignment deadline alerts**: Never miss a deadline again
- **Study session planner (Pomodoro)**: Built-in 25/5 Pomodoro timer
- **Notes section**: Per-course notes for study materials

### Smart Features
- **Daily reminders and notifications**: Browser push notifications
- **Auto-sort**: Tasks sorted by deadline and priority
- **Progress tracking**: % completion rate dashboard
- **Smart suggestions**: AI-powered reminders ("You have exams tomorrow!")

### UI/UX Design
- Modern dashboard with statistics
- **Dark/Light mode toggle**: Easy on the eyes
- Responsive sidebar navigation
- Clean card-based layout
- Smooth animations and transitions
- Mobile-friendly design

### Advanced Features
- **Offline mode support**: Works without internet (PWA)
- **Export tasks**: Download tasks as text file
- **Calendar view**: Visual deadline calendar
- **Drag-and-drop**: Reorder tasks with ease
- **Collaboration**: Share tasks with classmates

## Tech Stack

### Frontend
- React.js 18.2 with Hooks
- Tailwind CSS 3.4 for styling
- React Router v6 for navigation
- Context API for state management
- @hello-pangea/dnd for drag-and-drop
- date-fns for date manipulation
- react-hot-toast for notifications

### Backend
- Node.js with Express.js
- MongoDB with Mongoose ODM
- JWT for authentication
- bcryptjs for password hashing
- Google Auth Library for OAuth

## Project Structure

```
alwaysfront/
├── client/                 # React Frontend
│   ├── public/
│   │   ├── index.html
│   │   └── manifest.json
│   └── src/
│       ├── components/     # Reusable UI components
│       ├── context/        # React Context providers
│       ├── hooks/          # Custom React hooks
│       ├── pages/          # Page components
│       ├── utils/          # Utility functions
│       ├── App.js
│       └── index.js
├── server/                 # Node.js Backend
│   ├── config/             # Configuration files
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Express middleware
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   └── index.js            # Server entry point
├── package.json
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js 16+ installed
- MongoDB running locally or MongoDB Atlas account
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd alwaysfront
   ```

2. **Install root dependencies**
   ```bash
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd client
   npm install
   ```

4. **Install server dependencies**
   ```bash
   cd ../server
   npm install
   ```

5. **Configure environment variables**
   
   Create a `.env` file in the `server/` directory:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/alwaysfront
   JWT_SECRET=your_super_secret_key_here
   JWT_EXPIRE=7d
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   ```

6. **Configure Google OAuth (Optional)**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add redirect URI: `http://localhost:3000`

### Running the Application

**Development mode (runs both client and server)**
```bash
npm run dev
```

**Or run individually:**
```bash
# Terminal 1 - Start server
cd server
npm run dev

# Terminal 2 - Start client
cd client
npm start
```

Access the app at: `http://localhost:3000`

## Sample UI Preview

### Dashboard
The dashboard provides an at-a-glance view of your productivity:
- Greeting with personalized message
- Task statistics cards (Total, Pending, High Priority, Completion Rate)
- Smart suggestions based on your tasks
- Upcoming deadlines
- Quick actions to add tasks, start study sessions, or view calendar

### Tasks Page
Full task management interface:
- Search bar for quick task lookup
- Category and priority filters
- List and grid view toggle
- Drag-and-drop task reordering
- Task cards with priority badges, due dates, and course tags

### Courses Page
Course management for university students:
- Course cards with exam countdown
- Color-coded courses
- Schedule information
- Credits tracking
- Instructor details

### Pomodoro Timer
Built-in study session planner:
- 25-minute focus sessions
- 5-minute short breaks
- 15-minute long breaks
- Session tracking
- Course-linked study time

### Calendar View
Visual deadline calendar:
- Monthly calendar view
- Color-coded task indicators
- Exam countdown display
- Date selection for task details

## Monetization Ideas for Students in Kenya

### Free Tier (Basic)
- Full task management
- Course grouping
- Basic Pomodoro timer
- Calendar view

### Premium Tier (KES 99/month ~ $0.70)
- **M-Pesa Integration**: Local payment via M-Pesa STK push
- Unlimited courses
- Advanced analytics
- Export to PDF
- Priority support
- Cloud sync

### Premium Features:
1. **Cloud Sync**: Sync across devices
2. **PDF Export**: Professional task reports
3. **Shared Tasks**: Collaborate with classmates
4. **Study Analytics**: Detailed study time tracking
5. **Offline Mode**: Full PWA support
6. **Custom Themes**: Premium color schemes
7. **Widgets**: Home screen widgets
8. **Integration**: Import from other apps

### Potential Revenue Streams:
- University partnerships
- Student group discounts
- Freemium model
- Affiliate marketing (books, stationery)
- Premium study resources

## Performance Optimization

The app is optimized for low internet usage:
- Lazy loading components
- Minimal API calls
- Local storage caching
- Compressed assets
- Service worker caching (PWA)
- Optimistic UI updates

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/google` - Google OAuth
- `POST /api/auth/forgot-password` - Password reset request
- `GET /api/auth/me` - Get current user

### Tasks
- `GET /api/tasks` - Get all tasks (with filters)
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `PUT /api/tasks/:id/toggle-complete` - Toggle completion
- `PUT /api/tasks/:id/toggle-favorite` - Toggle favorite
- `GET /api/tasks/stats` - Get task statistics

### Courses
- `GET /api/courses` - Get all courses
- `POST /api/courses` - Create new course
- `PUT /api/courses/:id` - Update course
- `DELETE /api/courses/:id` - Delete course
- `GET /api/courses/exams` - Get upcoming exams

### Timer
- `POST /api/timer/start` - Start study session
- `PUT /api/timer/:id/complete` - Complete session
- `GET /api/timer/history` - Get session history
- `GET /api/timer/weekly` - Get weekly stats

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Acknowledgments

- Inspired by Notion, Todoist, and Trello
- Built for university students
- Designed with accessibility in mind

---

**Built with ❤️ for university students everywhere**
