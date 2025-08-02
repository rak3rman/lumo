# Lumo Travel Recommendation API

A dream-inspired travel recommendation system that uses personality quizzes to generate personalized travel suggestions.

## Features

- **Dream-inspired Personality Quiz**: 10 questions that reveal travel preferences through dream scenarios
- **AI-Powered Analysis**: Uses DeepSeek AI to analyze responses and generate user preferences
- **Personalized Travel Recommendations**: Suggests destinations based on user preferences
- **Dynamic Itinerary Generation**: Creates 1-day itineraries for selected locations
- **Auto-Generated User IDs**: No authentication required - backend generates unique user IDs

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set Environment Variables**
   ```bash
   export DEEPSEEK_API_KEY="your_deepseek_api_key_here"
   export DATABASE_URL="your_neon_database_url_here"
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```

## API Endpoints

### Quiz Management

#### GET `/api/quiz/questions`
Get all quiz questions.
```json
{
  "questions": [...],
  "total": 10
}
```

#### POST `/api/quiz/start`
Start a new quiz session. **No body required** - backend auto-generates user ID.
```json
{
  "message": "Quiz session started",
  "userId": "user_abc123def456",
  "currentQuestion": 1,
  "totalQuestions": 10
}
```

#### POST `/api/quiz/response`
Submit a quiz response.
```json
{
  "userId": "user_abc123def456",
  "questionNumber": 1,
  "selectedOption": "A"
}
```

### User Management

#### GET `/api/user/:userId/status`
Get user quiz status.
```json
{
  "userId": "user_abc123def456",
  "isCompleted": false,
  "currentQuestion": 3,
  "totalQuestions": 10,
  "hasPreferences": false
}
```

#### GET `/api/user/:userId/preferences`
Get user preferences (after quiz completion).
```json
{
  "userId": "user_abc123def456",
  "preferences": {
    "travelStyle": "adventurous",
    "preferredActivities": ["hiking", "photography"],
    "accommodationPreference": "boutique hotels",
    "budgetPriority": "mid-range",
    "pacePreference": "moderate",
    "foodPreference": "local cuisine",
    "socialPreference": "solo exploration",
    "adventureLevel": "high",
    "culturalInterest": "high"
  },
  "isCompleted": true
}
```

### Travel Recommendations

#### GET `/api/user/:userId/recommendations`
Get travel recommendations for a user.
```json
{
  "userId": "user_abc123def456",
  "recommendations": [
    {
      "locationName": "Kyoto",
      "country": "Japan",
      "description": "Perfect for your dreamy, cultural preferences...",
      "bestTimeToVisit": "March-May",
      "estimatedBudgetRange": "$100-200/day",
      "keyAttractions": ["Fushimi Inari", "Arashiyama Bamboo Grove"],
      "reasoning": "Matches your preference for cultural experiences..."
    }
  ]
}
```

#### POST `/api/user/:userId/itinerary`
Generate a 1-day itinerary for a specific location.
```json
{
  "locationName": "Kyoto"
}
```

## Data Storage

The API uses in-memory storage for demonstration purposes. In production, you would integrate with a database.

### Data Structure

**Users:**
- `userId`: Auto-generated user identifier (e.g., "user_abc123def456")
- `quizResponses`: Concatenated string of responses (e.g., "1:0,2:1,3:2...")
- `userPreferences`: JSON object with travel preferences
- `isCompleted`: Boolean indicating if quiz is complete
- `createdAt`, `updatedAt`: Timestamps

**Recommendations & Itineraries:**
- Stored in memory with user-specific keys
- Automatically generated based on quiz responses
- Include real-time scraped data from Wikipedia, Reddit, and weather APIs

## Development

The API integrates with a Python DeepSeek agent (`src/deepseek_agent.py`) that handles:
- Quiz response analysis
- User preference generation
- Travel location suggestions
- Itinerary generation

The Python script can be called independently for testing:
```bash
python3 src/deepseek_agent.py
```

## Example Usage

### Frontend Integration Flow

1. **Start Quiz Session** (Frontend calls this first)
   ```javascript
   const response = await fetch('/api/quiz/start', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' }
   });
   const { userId } = await response.json();
   // Store userId in localStorage or state
   ```

2. **Submit Quiz Responses** (Repeat for all 10 questions)
   ```javascript
   await fetch('/api/quiz/response', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       userId: 'user_abc123def456',
       stepNumber: 1,
       selectedOption: 0  // 0, 1, 2, or 3 for the 4 options
     })
   });
   ```

3. **Get Travel Recommendations**
   ```javascript
   const response = await fetch('/api/user/user_abc123def456/recommendations');
   const { recommendations } = await response.json();
   ```

4. **Generate Itinerary**
   ```javascript
   const response = await fetch('/api/user/user_abc123def456/itinerary', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ locationName: 'Kyoto' })
   });
   const { itinerary } = await response.json();
   ```

### cURL Examples

```bash
# 1. Start quiz session (no body needed)
curl -X POST http://localhost:3000/api/quiz/start

# 2. Submit quiz responses (use the userId from step 1)
curl -X POST http://localhost:3000/api/quiz/response \
  -H "Content-Type: application/json" \
  -d '{"userId": "user_abc123def456", "stepNumber": 1, "selectedOption": 0}'

# 3. Get travel recommendations
curl http://localhost:3000/api/user/user_abc123def456/recommendations

# 4. Generate itinerary
curl -X POST http://localhost:3000/api/user/user_abc123def456/itinerary \
  -H "Content-Type: application/json" \
  -d '{"locationName": "Kyoto"}'
```

## Key Benefits

- **No Authentication Required**: Backend auto-generates unique user IDs
- **Simple Frontend Integration**: Just store the returned userId and use it for subsequent calls
- **Stateless Design**: Each API call is independent
- **AI-Powered**: DeepSeek analyzes responses and generates personalized recommendations
- **Caching**: Recommendations and itineraries are stored in database for faster subsequent access
