# AI Mock Interview Platform 🚀

A modern, AI-powered interview preparation platform that helps users master their interview skills through personalized mock interviews, real-time feedback, and comprehensive analytics. Built with cutting-edge technologies and a beautiful, responsive design.

## ✨ Features

### 🎯 **Core Interview Experience**
* **Dynamic Interview Generation:** Create personalized mock interviews with AI-generated questions based on job role, description, and experience level
* **Multiple Interview Categories:** Technical, Behavioral, Leadership, Case Study, System Design, Coding, and General interviews
* **Difficulty Levels:** Beginner, Intermediate, and Advanced options tailored to your experience
* **Real-time Interview Simulation:** Interactive interview experience with webcam support and speech-to-text capabilities
* **AI-Powered Feedback:** Instant, detailed feedback on each answer with ratings, strengths, weaknesses, and improvement suggestions

### 🎨 **Modern UI/UX**
* **Beautiful Design:** Modern glass morphism design with gradient backgrounds and smooth animations
* **Responsive Layout:** Fully responsive design that works perfectly on desktop, tablet, and mobile devices
* **Smooth Animations:** Elegant entrance animations, hover effects, and micro-interactions throughout the platform
* **Dark Mode Support:** Automatic dark/light mode detection with seamless theme switching
* **Accessibility:** Built with accessibility in mind, including reduced motion support

### 📊 **Advanced Analytics & Insights**
* **Performance Dashboard:** Comprehensive overview of your interview performance with key metrics
* **Progress Tracking:** Monitor your improvement over time with detailed analytics
* **Score Breakdown:** Detailed scoring across technical, communication, problem-solving, and confidence areas
* **Practice Analytics:** Track total practice time, streaks, and improvement rates
* **Strengths & Weaknesses:** AI-identified areas of strength and improvement opportunities

### 🔧 **Enhanced Functionality**
* **Interview Templates:** Quick-start templates for different interview categories
* **Search & Filter:** Advanced search and filtering capabilities for managing interview history
* **Detailed Feedback:** Comprehensive feedback including preferred answers, suggestions, and score breakdowns
* **Interview History:** Complete history of all interviews with detailed results and analytics
* **User Preferences:** Customizable interview settings and preferences

### 🔐 **Security & Authentication**
* **Secure Authentication:** JWT-based authentication with bcrypt password hashing
* **User Sessions:** Persistent login sessions with secure token management
* **Data Privacy:** Secure storage and handling of user data and interview responses

## 🛠️ Tech Stack

### **Frontend**
* **Framework:** [Next.js 14](https://nextjs.org/) with App Router
* **Styling:** [Tailwind CSS](https://tailwindcss.com/) with custom animations
* **UI Components:** [Shadcn/ui](https://ui.shadcn.com/) with Radix UI primitives
* **Icons:** [Lucide React](https://lucide.dev/) for beautiful, consistent icons
* **Animations:** Custom CSS animations and Tailwind CSS Animate plugin

### **Backend & AI**
* **AI Model:** [Google Gemini AI](https://ai.google.dev/) for intelligent question generation and feedback
* **Database:** [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/) ODM
* **Authentication:** JWT tokens with bcryptjs for secure password handling
* **API:** Next.js API Routes with comprehensive error handling

### **Libraries & Tools**
* **HTTP Client:** [Axios](https://axios-http.com/) for API requests
* **Webcam:** [React Webcam](https://github.com/mozmorris/react-webcam) for video recording
* **Speech Recognition:** [react-hook-speech-to-text](https://github.com/Riley-Brown/react-hook-speech-to-text)
* **Notifications:** [Sonner](https://sonner.emilkowal.ski/) for elegant toast notifications

## 🚀 Getting Started

### Prerequisites
* Node.js (v18 or later)
* npm, yarn, or pnpm
* MongoDB instance (local or Atlas)
* Google Gemini AI API key

### Installation

1. **Clone the repository:**
    ```bash
    git clone https://github.com/Lovish-Singlaa/AI-Mock-Interviewer.git
    cd AI-Mock-Interviewer
    ```

2. **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```

3. **Set up environment variables:**
   Create a `.env.local` file in the root directory:
    ```env
    # MongoDB connection string
    MONGO_URI=your_mongodb_connection_string

   # JWT secret for authentication
    JWT_SECRET=your_strong_jwt_secret

    # Google Gemini AI API Key
   GEMINI_API_KEY=your_gemini_api_key

   # Number of questions per interview (default: 5)
    NEXT_PUBLIC_NUMBER_QUESTIONS=5
    ```

4. **Run the development server:**
    ```bash
    npm run dev
    ```

   Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📁 Project Structure

```
my-app/
├── app/
│   ├── _components/          # Landing page, login, signup components
│   ├── api/                  # Backend API routes
│   │   ├── auth/             # Authentication endpoints
│   │   ├── interviews/       # Interview management
│   │   ├── save-user-answer/ # Answer evaluation
│   │   └── user/             # User data management
│   ├── context/              # React context providers
│   ├── dashboard/            # Protected dashboard routes
│   │   ├── interviews/       # Interview management pages
│   │   │   ├── [interviewId]/ # Dynamic interview routes
│   │   │   │   ├── feedback/  # Results and feedback
│   │   │   │   └── start/     # Interview simulation
│   │   │   └── page.jsx       # All interviews list
│   │   └── page.jsx           # Main dashboard
│   ├── globals.css           # Global styles and animations
│   └── layout.js             # Root layout
├── components/
│   └── ui/                   # Reusable UI components (Shadcn)
├── models/                   # Mongoose schemas
│   ├── interviewSchema.js    # Interview data model
│   └── userSchema.js         # User data model
├── utils/                    # Utility functions
│   ├── db.js                 # Database connection
│   └── GeminiAIModal.js      # AI integration
└── hooks/                    # Custom React hooks
```

## 🔌 API Endpoints

### Authentication
* `POST /api/auth/signup` - User registration
* `POST /api/auth/login` - User authentication

### User Management
* `GET /api/user` - Get current user data
* `PUT /api/user` - Update user profile

### Interview Management
* `POST /api/interviews` - Create new interview with AI-generated questions
* `GET /api/get-interviews` - Get user's interview history
* `GET /api/find-interview-by-id/:id` - Get specific interview details
* `POST /api/save-user-answer` - Save answer and get AI feedback
* `PUT /api/save-user-answer` - Re-evaluate answer with AI

## 🎨 Design System

The platform uses a modern design system with:

* **Color Palette:** Gradient backgrounds with blue, purple, and slate tones
* **Typography:** Clean, readable fonts with proper hierarchy
* **Components:** Consistent card designs with glass morphism effects
* **Animations:** Smooth entrance animations and hover effects
* **Icons:** Lucide React icons for consistency
* **Spacing:** Systematic spacing using Tailwind's spacing scale

## 🔧 Key Features Implementation

### Interview Generation
- AI-powered question generation based on job role and experience
- Multiple difficulty levels and interview categories
- Customizable question count (3, 5, 7, or 10 questions)
- Real-time question generation with fallback system

### Feedback System
- Comprehensive AI evaluation of each answer
- Detailed scoring across multiple dimensions
- Personalized improvement suggestions
- Strength and weakness identification

### Analytics Dashboard
- Performance metrics and progress tracking
- Interview history with filtering and search
- Visual progress indicators and charts
- Improvement rate calculations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🙏 Acknowledgments

* [Google Gemini AI](https://ai.google.dev/) for powerful AI capabilities
* [Next.js](https://nextjs.org/) for the amazing React framework
* [Tailwind CSS](https://tailwindcss.com/) for utility-first styling
* [Shadcn/ui](https://ui.shadcn.com/) for beautiful UI components
* [Lucide](https://lucide.dev/) for the icon library

---

**Ready to ace your next interview? Start practicing with AI-powered mock interviews today! 🎯**
