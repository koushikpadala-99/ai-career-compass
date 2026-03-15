# AI-Powered Study System Architecture

## Overview
All study features will be powered by Gemini API for dynamic, personalized content generation.

## API Integration Points

### 1. Flashcard Generation (AI-Powered)
**Current:** Static rule-based generation
**New:** Gemini API generates contextual flashcards

```typescript
// API Call
POST https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent

Request:
{
  "contents": [{
    "parts": [{
      "text": `Generate 10 flashcards for the topic: "${topic}".
      
      Format as JSON array:
      [
        {
          "front": "Question or concept",
          "back": "Answer or explanation",
          "difficulty": "easy|medium|hard",
          "tags": ["tag1", "tag2"]
        }
      ]
      
      Make them educational, clear, and progressively challenging.`
    }]
  }],
  "generationConfig": {
    "temperature": 0.7,
    "maxOutputTokens": 2000
  }
}
```

### 2. Quiz Generation (AI-Powered)
**New Feature:** Generate multiple-choice quizzes

```typescript
Request:
{
  "contents": [{
    "parts": [{
      "text": `Generate a 10-question multiple choice quiz on: "${topic}".
      
      Format as JSON:
      {
        "questions": [
          {
            "question": "Question text",
            "options": ["A", "B", "C", "D"],
            "correctAnswer": 0,
            "explanation": "Why this is correct",
            "difficulty": "easy|medium|hard",
            "points": 10
          }
        ]
      }
      
      Include varied difficulty levels and detailed explanations.`
    }]
  }]
}
```

### 3. Study Plan Generation (AI-Powered)
**New Feature:** Personalized study roadmap

```typescript
Request:
{
  "contents": [{
    "parts": [{
      "text": `Create a personalized study plan for: "${careerGoal}".
      
      User Profile:
      - Current Level: ${userLevel}
      - Available Time: ${hoursPerWeek} hours/week
      - Learning Style: ${learningStyle}
      - Weak Areas: ${weakAreas.join(', ')}
      
      Format as JSON:
      {
        "plan": {
          "duration_weeks": 12,
          "weekly_schedule": [
            {
              "week": 1,
              "topics": ["topic1", "topic2"],
              "goals": ["goal1", "goal2"],
              "resources": [
                {
                  "type": "video|article|practice",
                  "title": "Resource title",
                  "url": "URL or description",
                  "duration": "30 mins"
                }
              ],
              "milestones": ["milestone1"]
            }
          ],
          "assessment_schedule": ["Week 4", "Week 8", "Week 12"]
        }
      }`
    }]
  }]
}
```

### 4. Content Summarization (AI-Powered)
**New Feature:** Summarize study materials

```typescript
Request:
{
  "contents": [{
    "parts": [{
      "text": `Summarize this content for studying:
      
      ${content}
      
      Provide:
      1. Key Points (bullet points)
      2. Main Concepts (with explanations)
      3. Important Terms (with definitions)
      4. Practice Questions (3-5 questions)
      
      Format as JSON.`
    }]
  }]
}
```

### 5. Weak Area Analysis (AI-Powered)
**New Feature:** Identify learning gaps

```typescript
Request:
{
  "contents": [{
    "parts": [{
      "text": `Analyze this student's performance data:
      
      Quiz Results: ${JSON.stringify(quizResults)}
      Study History: ${JSON.stringify(studyHistory)}
      Time Spent: ${JSON.stringify(timeSpent)}
      
      Identify:
      1. Weak areas (topics with low scores)
      2. Strong areas (topics with high scores)
      3. Recommended focus areas
      4. Suggested study strategies
      5. Estimated time to mastery
      
      Format as JSON with actionable recommendations.`
    }]
  }]
}
```

### 6. Practice Problem Generation (AI-Powered)
**New Feature:** Generate practice exercises

```typescript
Request:
{
  "contents": [{
    "parts": [{
      "text": `Generate 5 practice problems for: "${topic}".
      
      Difficulty: ${difficulty}
      Problem Type: ${type} // coding, math, conceptual, scenario
      
      Format as JSON:
      {
        "problems": [
          {
            "problem": "Problem statement",
            "hints": ["hint1", "hint2"],
            "solution": "Step-by-step solution",
            "difficulty": "easy|medium|hard",
            "estimated_time": "15 mins"
          }
        ]
      }`
    }]
  }]
}
```

### 7. Study Tips & Strategies (AI-Powered)
**New Feature:** Personalized study advice

```typescript
Request:
{
  "contents": [{
    "parts": [{
      "text": `Provide personalized study tips for:
      
      Topic: ${topic}
      User's Learning Style: ${learningStyle}
      Available Time: ${availableTime}
      Current Challenges: ${challenges.join(', ')}
      
      Provide:
      1. Specific study techniques
      2. Time management strategies
      3. Resource recommendations
      4. Common pitfalls to avoid
      5. Motivation tips
      
      Format as JSON with actionable advice.`
    }]
  }]
}
```

### 8. Progress Insights (AI-Powered)
**New Feature:** AI-generated progress analysis

```typescript
Request:
{
  "contents": [{
    "parts": [{
      "text": `Analyze this study progress:
      
      ${JSON.stringify(progressData)}
      
      Provide:
      1. Overall assessment
      2. Improvement trends
      3. Areas of concern
      4. Predictions for goal achievement
      5. Recommended adjustments
      
      Be encouraging but realistic. Format as JSON.`
    }]
  }]
}
```

## Service Architecture

### Gemini Service (`src/services/gemini.ts`)
```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export class GeminiService {
  private model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  async generateFlashcards(topic: string, count: number = 10) {
    const prompt = `Generate ${count} educational flashcards for: "${topic}"...`;
    const result = await this.model.generateContent(prompt);
    return this.parseJSON(result.response.text());
  }

  async generateQuiz(topic: string, difficulty: string, count: number = 10) {
    const prompt = `Generate a ${count}-question ${difficulty} quiz on: "${topic}"...`;
    const result = await this.model.generateContent(prompt);
    return this.parseJSON(result.response.text());
  }

  async generateStudyPlan(params: StudyPlanParams) {
    const prompt = `Create a personalized study plan...`;
    const result = await this.model.generateContent(prompt);
    return this.parseJSON(result.response.text());
  }

  async analyzeWeakAreas(performanceData: PerformanceData) {
    const prompt = `Analyze performance and identify weak areas...`;
    const result = await this.model.generateContent(prompt);
    return this.parseJSON(result.response.text());
  }

  async generatePracticeProblems(topic: string, type: string, count: number = 5) {
    const prompt = `Generate ${count} ${type} practice problems for: "${topic}"...`;
    const result = await this.model.generateContent(prompt);
    return this.parseJSON(result.response.text());
  }

  async getStudyTips(params: StudyTipsParams) {
    const prompt = `Provide personalized study tips...`;
    const result = await this.model.generateContent(prompt);
    return this.parseJSON(result.response.text());
  }

  async analyzeProgress(progressData: ProgressData) {
    const prompt = `Analyze study progress and provide insights...`;
    const result = await this.model.generateContent(prompt);
    return this.parseJSON(result.response.text());
  }

  async summarizeContent(content: string) {
    const prompt = `Summarize this content for studying...`;
    const result = await this.model.generateContent(prompt);
    return this.parseJSON(result.response.text());
  }

  private parseJSON(text: string) {
    // Extract JSON from markdown code blocks if present
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]);
    }
    return JSON.parse(text);
  }
}

export const geminiService = new GeminiService();
```

## Data Flow

### 1. Flashcard Generation Flow
```
User enters topic
  ↓
Call geminiService.generateFlashcards(topic)
  ↓
Gemini API generates contextual flashcards
  ↓
Parse JSON response
  ↓
Save to Supabase (flashcard_decks table)
  ↓
Display to user
  ↓
Track usage in study_sessions
```

### 2. Quiz Flow
```
User selects topic & difficulty
  ↓
Call geminiService.generateQuiz(topic, difficulty)
  ↓
Gemini generates quiz questions
  ↓
User answers questions
  ↓
Calculate score
  ↓
Save results to Supabase (quiz_results table)
  ↓
Call geminiService.analyzeWeakAreas(results)
  ↓
Show personalized feedback
```

### 3. Study Plan Flow
```
User completes career assessment
  ↓
Gather user profile data
  ↓
Call geminiService.generateStudyPlan(profile)
  ↓
Gemini creates personalized plan
  ↓
Save to Supabase (study_plans table)
  ↓
Display weekly schedule
  ↓
Track progress
  ↓
Adjust plan based on performance
```

## Supabase Tables for API-Driven Features

### flashcard_decks
```sql
CREATE TABLE flashcard_decks (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id),
  topic TEXT NOT NULL,
  generated_by TEXT DEFAULT 'ai', -- ai or manual
  cards JSONB NOT NULL, -- AI-generated cards
  difficulty TEXT,
  tags TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  last_studied TIMESTAMP,
  mastery_level INTEGER DEFAULT 0
);
```

### quiz_results
```sql
CREATE TABLE quiz_results (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id),
  topic TEXT NOT NULL,
  difficulty TEXT,
  questions JSONB NOT NULL, -- AI-generated questions
  answers JSONB NOT NULL, -- User's answers
  score INTEGER,
  total_questions INTEGER,
  time_taken INTEGER, -- seconds
  weak_areas JSONB, -- AI-identified weak areas
  created_at TIMESTAMP DEFAULT NOW()
);
```

### study_plans
```sql
CREATE TABLE study_plans (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id),
  career_goal TEXT NOT NULL,
  plan_data JSONB NOT NULL, -- AI-generated plan
  current_week INTEGER DEFAULT 1,
  progress INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  status TEXT DEFAULT 'active'
);
```

### practice_problems
```sql
CREATE TABLE practice_problems (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id),
  topic TEXT NOT NULL,
  problem_type TEXT,
  problem_data JSONB NOT NULL, -- AI-generated problem
  user_solution TEXT,
  is_correct BOOLEAN,
  attempts INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### study_insights
```sql
CREATE TABLE study_insights (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id),
  insight_type TEXT, -- weak_areas, progress, tips
  insight_data JSONB NOT NULL, -- AI-generated insights
  created_at TIMESTAMP DEFAULT NOW(),
  is_read BOOLEAN DEFAULT FALSE
);
```

## API Rate Limiting & Caching

### Rate Limiting Strategy
```typescript
class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private limit = 60; // requests per minute
  
  canMakeRequest(userId: string): boolean {
    const now = Date.now();
    const userRequests = this.requests.get(userId) || [];
    
    // Remove requests older than 1 minute
    const recentRequests = userRequests.filter(time => now - time < 60000);
    
    if (recentRequests.length >= this.limit) {
      return false;
    }
    
    recentRequests.push(now);
    this.requests.set(userId, recentRequests);
    return true;
  }
}
```

### Caching Strategy
```typescript
class CacheService {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private ttl = 3600000; // 1 hour
  
  get(key: string) {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }
  
  set(key: string, data: any) {
    this.cache.set(key, { data, timestamp: Date.now() });
  }
}
```

## Error Handling

```typescript
class APIError extends Error {
  constructor(
    message: string,
    public code: string,
    public retryable: boolean = false
  ) {
    super(message);
  }
}

async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1 || !(error as APIError).retryable) {
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  throw new Error('Max retries exceeded');
}
```

## Cost Optimization

### Token Usage Optimization
```typescript
const TOKEN_LIMITS = {
  flashcards: 1500,    // ~10 cards
  quiz: 2000,          // ~10 questions
  studyPlan: 3000,     // Comprehensive plan
  analysis: 1000,      // Quick analysis
  tips: 800,           // Brief tips
  summary: 1200        // Content summary
};

function optimizePrompt(prompt: string, maxTokens: number): string {
  // Truncate if needed
  // Remove unnecessary details
  // Keep essential information
  return prompt;
}
```

### Batch Processing
```typescript
async function batchGenerateFlashcards(topics: string[]) {
  const prompt = `Generate flashcards for multiple topics:
  ${topics.map((t, i) => `${i + 1}. ${t}`).join('\n')}
  
  Format as JSON with topic keys...`;
  
  const result = await geminiService.model.generateContent(prompt);
  return parseMultiTopicResponse(result);
}
```

## Implementation Checklist

- [ ] Install @google/generative-ai package
- [ ] Create GeminiService class
- [ ] Implement flashcard generation
- [ ] Implement quiz generation
- [ ] Implement study plan generation
- [ ] Implement weak area analysis
- [ ] Implement practice problem generation
- [ ] Implement study tips generation
- [ ] Implement progress insights
- [ ] Add rate limiting
- [ ] Add caching
- [ ] Add error handling
- [ ] Create Supabase tables
- [ ] Update UI components
- [ ] Add loading states
- [ ] Add error messages
- [ ] Test all API integrations
- [ ] Optimize token usage
- [ ] Monitor API costs

