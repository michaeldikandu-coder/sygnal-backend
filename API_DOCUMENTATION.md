# Sygnal API Documentation

A comprehensive REST API for Sygnal - Reputation & Prediction Market Social Network.

**Base URL:** `http://localhost:3000/api`

## 📋 Table of Contents

- [Authentication](#authentication)
- [Users](#users)
- [Signals](#signals)
- [Interactions](#interactions)
- [Challenges](#challenges)
- [Trending & Discovery](#trending--discovery)
- [Analytics](#analytics)
- [Notifications](#notifications)
- [Search](#search)
- [Real-World Feeds](#real-world-feeds)
- [Categories & Topics](#categories--topics)
- [Credibility System](#credibility-system)
- [Achievements](#achievements)
- [Error Handling](#error-handling)

---

## 🔐 Authentication

### Register User
```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe",
  "handle": "johndoe"
}
```

**Response (201):**
```json
{
  "user": {
    "id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "email": "user@example.com",
    "name": "John Doe",
    "handle": "johndoe",
    "verified": false,
    "credibilityScore": 50.0,
    "dailyPoints": 100
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Login User
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "email": "user@example.com",
    "name": "John Doe",
    "handle": "johndoe",
    "credibilityScore": 75.5,
    "dailyPoints": 85
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Refresh Token
```http
POST /api/auth/refresh
Authorization: Bearer <refresh_token>
```

**Response (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "id": "64f8a1b2c3d4e5f6a7b8c9d0",
  "email": "user@example.com",
  "name": "John Doe",
  "handle": "johndoe",
  "avatar": "https://example.com/avatar.jpg",
  "verified": true,
  "credibilityScore": 75.5,
  "accuracy": 68.2,
  "dailyPoints": 85,
  "streak": 7,
  "_count": {
    "followers": 42,
    "following": 18,
    "signals": 156
  }
}
```

### Logout
```http
POST /api/auth/logout
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

---

## 👥 Users

### Get User Profile
```http
GET /api/users/profile
Authorization: Bearer <access_token>
```

### Update Profile
```http
PUT /api/users/profile
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "name": "John Smith",
  "handle": "johnsmith",
  "avatar": "https://example.com/new-avatar.jpg"
}
```

### Get User by ID
```http
GET /api/users/{userId}
```

**Response (200):**
```json
{
  "id": "64f8a1b2c3d4e5f6a7b8c9d0",
  "name": "John Doe",
  "handle": "johndoe",
  "avatar": "https://example.com/avatar.jpg",
  "verified": true,
  "credibilityScore": 75.5,
  "accuracy": 68.2,
  "streak": 7,
  "_count": {
    "followers": 42,
    "following": 18,
    "signals": 156,
    "convictions": 892
  }
}
```

### Search Users
```http
GET /api/users/search?q={query}
```

**Query Parameters:**
- `q` (required): Search query (minimum 2 characters)

**Response (200):**
```json
[
  {
    "id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "name": "John Doe",
    "handle": "johndoe",
    "avatar": "https://example.com/avatar.jpg",
    "verified": true,
    "credibilityScore": 75.5,
    "_count": {
      "followers": 42
    }
  }
]
```

### Follow User
```http
POST /api/users/follow/{userId}
Authorization: Bearer <access_token>
```

### Unfollow User
```http
DELETE /api/users/unfollow/{userId}
Authorization: Bearer <access_token>
```

### Get Followers
```http
GET /api/users/followers/{userId}
```

### Get Following
```http
GET /api/users/following/{userId}
```

### Get User Stats
```http
GET /api/users/{userId}/stats
```

**Response (200):**
```json
{
  "credibilityScore": 75.5,
  "accuracy": 68.2,
  "dailyPoints": 85,
  "streak": 7,
  "_count": {
    "signals": 156,
    "convictions": 892,
    "challengesCreated": 23,
    "followers": 42,
    "following": 18
  },
  "resolvedSignals": 89,
  "correctPredictions": 61
}
```

### Get Credibility History
```http
GET /api/users/{userId}/credibility-history
```

### Get User Predictions
```http
GET /api/users/{userId}/predictions
```

### Get User Challenges
```http
GET /api/users/{userId}/challenges
```

---

## 🎯 Signals

### Get Signal Feed
```http
GET /api/signals/feed?page={n}&limit={n}&sortBy={sort}&category={cat}&timeframe={tf}&userId={id}
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 50)
- `sortBy` (optional): Sort order (`newest`, `momentum`, `consensus`, `participants`)
- `category` (optional): Filter by category
- `timeframe` (optional): Filter by timeframe
- `userId` (optional): Show feed for specific user's following

**Response (200):**
```json
{
  "signals": [
    {
      "id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "content": "Will Bitcoin reach $100,000 by end of 2024?",
      "topic": "Bitcoin Price Prediction",
      "category": "Finance",
      "timeframe": "1y",
      "consensus": 67.5,
      "momentum": 23.8,
      "participantCount": 156,
      "createdAt": "2024-01-15T10:30:00Z",
      "user": {
        "id": "64f8a1b2c3d4e5f6a7b8c9d0",
        "name": "John Doe",
        "handle": "johndoe",
        "avatar": "https://example.com/avatar.jpg",
        "verified": true,
        "credibilityScore": 75.5
      },
      "_count": {
        "convictions": 156,
        "comments": 23,
        "remixes": 8,
        "shares": 12
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1250,
    "totalPages": 63,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Create Signal
```http
POST /api/signals
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "content": "Will Tesla stock reach $300 by Q2 2024?",
  "topic": "Tesla Stock Prediction",
  "category": "Finance",
  "timeframe": "6m"
}
```

**Response (201):**
```json
{
  "id": "64f8a1b2c3d4e5f6a7b8c9d0",
  "content": "Will Tesla stock reach $300 by Q2 2024?",
  "topic": "Tesla Stock Prediction",
  "category": "Finance",
  "timeframe": "6m",
  "consensus": 50.0,
  "momentum": 0.0,
  "participantCount": 0,
  "createdAt": "2024-01-15T10:30:00Z",
  "user": {
    "id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "name": "John Doe",
    "handle": "johndoe",
    "verified": true,
    "credibilityScore": 75.5
  }
}
```

### Get Signal by ID
```http
GET /api/signals/{signalId}
```

**Response (200):**
```json
{
  "id": "64f8a1b2c3d4e5f6a7b8c9d0",
  "content": "Will Bitcoin reach $100,000 by end of 2024?",
  "topic": "Bitcoin Price Prediction",
  "category": "Finance",
  "consensus": 67.5,
  "momentum": 23.8,
  "participantCount": 156,
  "user": {
    "id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "name": "John Doe",
    "handle": "johndoe",
    "credibilityScore": 75.5
  },
  "convictions": [
    {
      "id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "value": 75.0,
      "createdAt": "2024-01-15T11:00:00Z",
      "user": {
        "id": "64f8a1b2c3d4e5f6a7b8c9d0",
        "name": "Jane Smith",
        "handle": "janesmith",
        "credibilityScore": 82.3
      }
    }
  ],
  "thesis": [
    {
      "id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "url": "https://example.com/bitcoin-analysis",
      "title": "Bitcoin Technical Analysis 2024",
      "source": "example.com",
      "clicks": 45
    }
  ]
}
```

### Update Signal
```http
PUT /api/signals/{signalId}
Authorization: Bearer <access_token>
```

### Delete Signal
```http
DELETE /api/signals/{signalId}
Authorization: Bearer <access_token>
```

### Remix Signal
```http
POST /api/signals/{signalId}/remix
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "content": "Actually, will Bitcoin reach $150,000 by end of 2024? The original prediction seems too conservative."
}
```

### Get Signal Remixes
```http
GET /api/signals/{signalId}/remixes
```

### Share Signal
```http
POST /api/signals/{signalId}/share
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "platform": "twitter"
}
```

---

## 💪 Interactions

### Add Conviction (Vote)
```http
POST /api/signals/{signalId}/conviction
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "value": 75.0
}
```

**Response (201):**
```json
{
  "id": "64f8a1b2c3d4e5f6a7b8c9d0",
  "signalId": "64f8a1b2c3d4e5f6a7b8c9d0",
  "userId": "64f8a1b2c3d4e5f6a7b8c9d0",
  "value": 75.0,
  "weight": 0.755,
  "points": 0,
  "createdAt": "2024-01-15T11:00:00Z"
}
```

**Note:** Users can now freely express convictions without point restrictions. The system encourages unlimited participation in predictions.
```

### Get User Conviction
```http
GET /api/signals/{signalId}/conviction
Authorization: Bearer <access_token>
```

### Add Comment
```http
POST /api/signals/{signalId}/comment
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "content": "Great analysis! I agree with this prediction based on current market trends.",
  "parentId": "64f8a1b2c3d4e5f6a7b8c9d0"
}
```

### Get Signal Comments
```http
GET /api/signals/{signalId}/comments
```

**Response (200):**
```json
[
  {
    "id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "content": "Great analysis! I agree with this prediction.",
    "createdAt": "2024-01-15T11:30:00Z",
    "user": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "Jane Smith",
      "handle": "janesmith",
      "avatar": "https://example.com/avatar2.jpg",
      "credibilityScore": 82.3
    },
    "replies": [
      {
        "id": "64f8a1b2c3d4e5f6a7b8c9d1",
        "content": "Thanks! What's your conviction level?",
        "createdAt": "2024-01-15T11:45:00Z",
        "user": {
          "id": "64f8a1b2c3d4e5f6a7b8c9d0",
          "name": "John Doe",
          "handle": "johndoe"
        }
      }
    ],
    "_count": {
      "replies": 3
    }
  }
]
```

---

## ⚔️ Challenges

### Create Challenge
```http
POST /api/signals/{signalId}/challenge
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "targetId": "64f8a1b2c3d4e5f6a7b8c9d0",
  "stakeAmount": 50
}
```

**Response (201):**
```json
{
  "id": "64f8a1b2c3d4e5f6a7b8c9d0",
  "signalId": "64f8a1b2c3d4e5f6a7b8c9d0",
  "challengerId": "64f8a1b2c3d4e5f6a7b8c9d0",
  "targetId": "64f8a1b2c3d4e5f6a7b8c9d1",
  "stakeAmount": 50,
  "status": "PENDING",
  "createdAt": "2024-01-15T12:00:00Z",
  "signal": {
    "id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "content": "Will Bitcoin reach $100,000 by end of 2024?",
    "consensus": 67.5
  },
  "challenger": {
    "id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "name": "John Doe",
    "handle": "johndoe",
    "credibilityScore": 75.5
  },
  "target": {
    "id": "64f8a1b2c3d4e5f6a7b8c9d1",
    "name": "Jane Smith",
    "handle": "janesmith",
    "credibilityScore": 82.3
  }
}
```

### Get Challenge by ID
```http
GET /api/challenges/{challengeId}
```

### Accept Challenge
```http
POST /api/challenges/{challengeId}/accept
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "id": "64f8a1b2c3d4e5f6a7b8c9d0",
  "status": "ACCEPTED",
  "updatedAt": "2024-01-15T12:30:00Z",
  "signal": {
    "id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "content": "Will Bitcoin reach $100,000 by end of 2024?",
    "consensus": 67.5
  },
  "challenger": {
    "id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "name": "John Doe",
    "handle": "johndoe"
  },
  "target": {
    "id": "64f8a1b2c3d4e5f6a7b8c9d1",
    "name": "Jane Smith",
    "handle": "janesmith"
  }
}
```

### Resolve Challenge
```http
POST /api/challenges/{challengeId}/resolve
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "winnerId": "64f8a1b2c3d4e5f6a7b8c9d0"
}
```

---

## 📈 Trending & Discovery

### Get Trending Signals
```http
GET /api/trending/signals
```

**Response (200):**
```json
[
  {
    "id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "content": "Will AI replace 50% of jobs by 2030?",
    "category": "Technology",
    "consensus": 72.3,
    "momentum": 45.6,
    "participantCount": 234,
    "user": {
      "name": "Tech Analyst",
      "handle": "techanalyst",
      "credibilityScore": 89.2
    },
    "_count": {
      "convictions": 234,
      "comments": 67,
      "remixes": 12,
      "shares": 28
    }
  }
]
```

### Get Trending Narratives
```http
GET /api/trending/narratives
```

**Response (200):**
```json
[
  {
    "category": "Technology",
    "totalMomentum": 156.7,
    "signalCount": 23,
    "averageConsensus": 68.4
  },
  {
    "category": "Finance",
    "totalMomentum": 134.2,
    "signalCount": 45,
    "averageConsensus": 55.8
  }
]
```

### Get Trending Users
```http
GET /api/trending/users
```

### Discover Signals
```http
GET /api/discover/signals?category={cat}&timeframe={tf}
```

**Query Parameters:**
- `category` (optional): Filter by category
- `timeframe` (optional): Time range (`1h`, `24h`, `7d`, `30d`)

---

## 📊 Analytics

### Get Signal Performance
```http
GET /api/analytics/signal-performance/{signalId}
```

**Response (200):**
```json
{
  "signal": {
    "id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "content": "Will Bitcoin reach $100,000 by end of 2024?",
    "currentConsensus": 67.5,
    "momentum": 23.8,
    "participantCount": 156
  },
  "performance": {
    "convictionHistory": [
      {
        "timestamp": "2024-01-15T10:30:00Z",
        "value": 75.0,
        "weight": 0.823,
        "userCredibility": 82.3
      }
    ],
    "consensusHistory": [
      {
        "timestamp": "2024-01-15T10:30:00Z",
        "consensus": 50.0,
        "participantCount": 1
      },
      {
        "timestamp": "2024-01-15T11:00:00Z",
        "consensus": 67.5,
        "participantCount": 2
      }
    ],
    "totalEngagement": 199,
    "shareCount": 12
  }
}
```

### Get User Accuracy
```http
GET /api/analytics/user-accuracy/{userId}
```

**Response (200):**
```json
{
  "user": {
    "id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "name": "John Doe",
    "handle": "johndoe",
    "credibilityScore": 75.5,
    "accuracy": 68.2
  },
  "accuracy": {
    "percentage": 68.2,
    "correctPredictions": 61,
    "totalPredictions": 89
  },
  "predictionHistory": [
    {
      "signalId": "64f8a1b2c3d4e5f6a7b8c9d0",
      "content": "Will Tesla reach $250 by Q1 2024?",
      "userConviction": 80.0,
      "resolvedValue": 85.0,
      "isCorrect": true,
      "resolvedAt": "2024-03-31T23:59:59Z"
    }
  ],
  "heatmapData": [
    {
      "date": "2024-01-15",
      "intensity": 0.75,
      "count": 4
    }
  ]
}
```

### Get Market Sentiment
```http
GET /api/analytics/market-sentiment
```

**Response (200):**
```json
{
  "overall": {
    "totalSignals": 1250,
    "averageConsensus": 62.3,
    "averageMomentum": 18.7,
    "sentiment": "bullish"
  },
  "categories": [
    {
      "category": "Technology",
      "signalCount": 234,
      "averageConsensus": 68.4,
      "averageMomentum": 25.6,
      "totalParticipants": 1456
    },
    {
      "category": "Finance",
      "signalCount": 456,
      "averageConsensus": 55.8,
      "averageMomentum": 22.1,
      "totalParticipants": 2341
    }
  ]
}
```

---

## 🔔 Notifications

### Get Notifications
```http
GET /api/notifications?page={n}
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "notifications": [
    {
      "id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "type": "CONVICTION",
      "title": "New Conviction on Your Signal",
      "message": "Jane Smith added a conviction to your Bitcoin prediction",
      "read": false,
      "signalId": "64f8a1b2c3d4e5f6a7b8c9d0",
      "fromUserId": "64f8a1b2c3d4e5f6a7b8c9d1",
      "createdAt": "2024-01-15T11:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

### Mark Notification as Read
```http
POST /api/notifications/mark-read/{notificationId}
Authorization: Bearer <access_token>
```

### Mark All as Read
```http
POST /api/notifications/mark-all-read
Authorization: Bearer <access_token>
```

### Get Unread Count
```http
GET /api/notifications/unread-count
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "count": 7
}
```

---

## 🔍 Search

### Search Signals
```http
GET /api/search/signals?q={query}&filters={filters}
```

**Query Parameters:**
- `q` (required): Search query (minimum 2 characters)
- `filters` (optional): JSON string with filters `{"category":"Technology","timeframe":"7d"}`

### Search Users
```http
GET /api/search/users?q={query}
```

### Search Topics
```http
GET /api/search/topics?q={query}
```

---

## 🌍 Real-World Feeds

### Sync All Real-World Events
```http
POST /api/feeds/sync
```

**Response (200):**
```json
{
  "message": "Successfully synced 47 real-world events",
  "signals": 47
}
```

### Get News Events
```http
GET /api/feeds/news
```

### Get Financial Events
```http
GET /api/feeds/financial
```

### Get Sports Events
```http
GET /api/feeds/sports
```

### Get Crypto Events
```http
GET /api/feeds/crypto
```

**Response (200):**
```json
[
  {
    "id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "content": "Will Bitcoin continue rising by 10% in the next 7 days?\n\nCurrent: $45,230\n24h Change: 3.45%",
    "topic": "Bitcoin Price Prediction",
    "category": "Finance",
    "timeframe": "7d",
    "consensus": 55.0,
    "momentum": 17.25,
    "user": {
      "name": "Sygnal AI",
      "handle": "sygnal_ai",
      "verified": true
    }
  }
]
```

### Get Weather Events
```http
GET /api/feeds/weather
```

---

## 📂 Categories & Topics

### Get Categories
```http
GET /api/categories
```

**Response (200):**
```json
[
  {
    "id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "name": "Technology",
    "description": "Tech trends and predictions",
    "color": "#3B82F6",
    "icon": "💻",
    "createdAt": "2024-01-01T00:00:00Z"
  },
  {
    "id": "64f8a1b2c3d4e5f6a7b8c9d1",
    "name": "Finance",
    "description": "Market and economic predictions",
    "color": "#10B981",
    "icon": "💰"
  }
]
```

### Get Trending Topics
```http
GET /api/topics/trending
```

**Response (200):**
```json
[
  {
    "id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "name": "AI Revolution",
    "category": "Technology",
    "trending": true,
    "momentum": 85.5,
    "createdAt": "2024-01-01T00:00:00Z"
  }
]
```

---

## 🏆 Credibility System

### Get Leaderboard
```http
GET /api/credibility/leaderboard
```

**Response (200):**
```json
[
  {
    "rank": 1,
    "id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "name": "Top Predictor",
    "handle": "toppredictor",
    "verified": true,
    "credibilityScore": 95.8,
    "accuracy": 87.3,
    "_count": {
      "signals": 234,
      "convictions": 1456,
      "followers": 892
    }
  }
]
```

### Get User Score
```http
GET /api/credibility/user/{userId}/score
```

### Get Credibility Transactions
```http
GET /api/credibility/transactions/{userId}
```

---

## 🎖️ Achievements

### Get User Achievements
```http
GET /api/achievements/user/{userId}
```

**Response (200):**
```json
[
  {
    "id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "unlockedAt": "2024-01-15T10:30:00Z",
    "achievement": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "First Signal",
      "description": "Created your first signal",
      "icon": "🎯",
      "category": "signals",
      "points": 10
    }
  }
]
```

### Check and Unlock Achievements
```http
POST /api/achievements/unlock
Authorization: Bearer <access_token>
```

---

## 🔗 Thesis Attachments

### Add Thesis to Signal
```http
POST /api/signals/{signalId}/thesis
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "url": "https://example.com/bitcoin-analysis-2024"
}
```

**Response (201):**
```json
{
  "id": "64f8a1b2c3d4e5f6a7b8c9d0",
  "signalId": "64f8a1b2c3d4e5f6a7b8c9d0",
  "url": "https://example.com/bitcoin-analysis-2024",
  "title": "Bitcoin Technical Analysis 2024",
  "source": "example.com",
  "imageUrl": "https://example.com/og-image.jpg",
  "clicks": 0,
  "createdAt": "2024-01-15T12:00:00Z"
}
```

### Get Signal Thesis
```http
GET /api/signals/{signalId}/thesis
```

### Track Thesis Click
```http
PUT /api/thesis/{thesisId}/click
```

---

## ❌ Error Handling

### Standard Error Response Format

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### HTTP Status Codes

- **200** - Success
- **201** - Created
- **400** - Bad Request (validation errors)
- **401** - Unauthorized (invalid/missing token)
- **402** - Payment Required (insufficient points for challenges/stakes)
- **403** - Forbidden (insufficient permissions)
- **404** - Not Found
- **409** - Conflict (duplicate resource)
- **422** - Unprocessable Entity
- **429** - Too Many Requests (rate limited)
- **500** - Internal Server Error

### Common Error Scenarios

#### Insufficient Points
```json
{
  "statusCode": 402,
  "message": "Insufficient points. Available: 25, Required: 50",
  "error": "Payment Required"
}
```

#### Invalid Conviction Range
```json
{
  "statusCode": 400,
  "message": "Conviction value must be between -100 and 100",
  "error": "Bad Request"
}
```

#### Unauthorized Access
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

#### Rate Limiting
```json
{
  "statusCode": 429,
  "message": "Too Many Requests",
  "error": "ThrottlerException"
}
```

---

## 🔧 Development & Testing

### Environment Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Setup environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your database and API keys
   ```

3. **Setup database:**
   ```bash
   npm run prisma:generate
   npx prisma db push
   npm run prisma:seed
   ```

4. **Start development server:**
   ```bash
   npm run start:dev
   ```

### API Testing with cURL

#### Register and Login
```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","name":"Test User","handle":"testuser"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'
```

#### Create Signal
```bash
curl -X POST http://localhost:3000/api/signals \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{"content":"Will AI replace 50% of jobs by 2030?","category":"Technology","timeframe":"5y"}'
```

#### Add Conviction
```bash
curl -X POST http://localhost:3000/api/signals/SIGNAL_ID/conviction \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{"value":75}'
```

---

## 📝 Notes

- All timestamps are in ISO 8601 format (UTC)
- All monetary values and scores are floating-point numbers
- User handles must be unique and contain only letters, numbers, and underscores
- Daily points are only used for challenges and staking, not for convictions
- Conviction values range from -100 (strongly disagree) to +100 (strongly agree)
- Users can express unlimited convictions without point restrictions
- Consensus scores are calculated as weighted averages based on user credibility
- Real-world events are automatically synced every hour via background jobs

---

**Last Updated:** December 26, 2024  
**API Version:** 1.0.0  
**Base URL:** `http://localhost:3000/api`