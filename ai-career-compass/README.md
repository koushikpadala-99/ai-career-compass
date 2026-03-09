# AI Career Compass

AI-powered career guidance platform that helps you discover your ideal career path through intelligent interest analysis and personalized learning roadmaps.

## 🎯 Features

- **AI Career Matching**: Analyze interests and match with suitable careers
- **Question-Based Quiz**: 8 structured questions for accurate matching
- **Personalized Roadmaps**: Generate custom learning paths with milestones
- **Progress Tracking**: Track points, levels, streaks, and achievements
- **Study Tools**: Pomodoro timer, flashcards, document analysis
- **LLM Integration**: Optional OpenAI/Anthropic for advanced analysis

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.10+ (for backend)

### Frontend Setup

```sh
# Navigate to frontend directory
cd ai-career-compass

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will run at `http://localhost:5173`

### Backend Setup

```sh
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment (Windows)
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Populate career data
python manage.py populate_careers

# Start server
python manage.py runserver
```

Backend will run at `http://localhost:8000`

## 📚 Documentation

- [Complete Setup Guide](README.md)
- [Backend Architecture](backend/ARCHITECTURE.md)
- [API Integration Guide](API_INTEGRATION_GUIDE.md)
- [Quiz Format Guide](QUIZ_FORMAT_GUIDE.md)
- [Project Overview](PROJECT_OVERVIEW.md)

## 🛠️ Tech Stack

### Frontend
- React + TypeScript
- Vite
- TailwindCSS + shadcn/ui
- React Router
- Framer Motion

### Backend
- Django + Django REST Framework
- JWT Authentication
- SQLite (dev) / PostgreSQL (prod)
- OpenAI GPT / Anthropic Claude (optional)

## 📝 License

MIT License
