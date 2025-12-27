# Sygnal Backend API

A comprehensive NestJS backend for Sygnal - A Reputation & Prediction Market Social Network.

## 🚀 Features

- **Authentication & Authorization**: JWT-based auth with refresh tokens
- **User Management**: Profiles, following system, credibility scoring
- **Signals**: Core prediction content with consensus calculation
- **Convictions**: Weighted voting system with point mechanics
- **Challenges**: 1v1 duels with stake-based resolution
- **Thesis Attachments**: External content scraping and metadata
- **Real-time Analytics**: User accuracy tracking and market sentiment
- **Trending System**: Redis-cached trending feeds and narratives
- **Notifications**: Auto-generated user notifications
- **Search**: Full-text search across signals, users, and topics
- **Achievements**: Gamification system with unlockable badges

## 🛠 Tech Stack

- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Passport JWT + bcrypt
- **Queue System**: BullMQ for background jobs
- **Caching**: Redis for trending feeds
- **Validation**: class-validator for DTOs
- **Scraping**: metadata-scraper for external content

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Redis 6+
- npm or yarn

## 🔧 Installation

1. **Clone and install dependencies**:
```bash
git clone <repository>
cd sygnal-backend
npm install
```

2. **Environment setup**:
```bash
cp .env.example .env
# Edit .env with your database and Redis credentials
```

3. **Database setup**:
```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed initial data
npm run prisma:seed
```

4. **Start the application**:
```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user profile

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `POST /api/users/follow/:userId` - Follow user
- `GET /api/users/:userId/stats` - Get user statistics

### Signals (Core Content)
- `GET /api/signals/feed` - Get paginated signal feed
- `POST /api/signals` - Create new signal
- `POST /api/signals/:id/remix` - Remix existing signal
- `GET /api/signals/:id` - Get signal details

### Interactions
- `POST /api/signals/:id/conviction` - Add conviction (vote)
- `POST /api/signals/:id/comment` - Add comment
- `GET /api/signals/:id/comments` - Get signal comments

### Challenges (Duels)
- `POST /api/signals/:id/challenge` - Create challenge
- `POST /api/challenges/:id/accept` - Accept challenge
- `POST /api/challenges/:id/resolve` - Resolve challenge

### Trending & Discovery
- `GET /api/trending/signals` - Get trending signals
- `GET /api/trending/narratives` - Get trending narratives
- `GET /api/trending/users` - Get trending users

### Analytics
- `GET /api/analytics/user-accuracy/:userId` - User accuracy metrics
- `GET /api/analytics/signal-performance/:signalId` - Signal performance
- `GET /api/analytics/market-sentiment` - Overall market sentiment

## 🏗 Architecture

### Module Structure
```
src/
├── auth/           # Authentication & authorization
├── users/          # User management
├── signals/        # Core signal functionality
├── interactions/   # Convictions & comments
├── challenges/     # Challenge system
├── thesis/         # External content scraping
├── trending/       # Trending feeds with caching
├── analytics/      # User & market analytics
├── notifications/  # Notification system
├── search/         # Search functionality
├── achievements/   # Gamification system
└── prisma/         # Database service
```

### Key Design Patterns

**Conviction System**: 
- Users spend daily points to make convictions
- Weighted by user credibility score
- Real-time consensus calculation
- Momentum tracking via BullMQ

**Challenge System**:
- Stake-based 1v1 duels
- Transactional point management
- Credibility score adjustments
- Oracle-based resolution

**Caching Strategy**:
- Redis caching for expensive queries
- 5-minute TTL for trending data
- Cache invalidation on updates

## 🔒 Security Features

- JWT access tokens (15min) + refresh tokens (7d)
- Password hashing with bcrypt (12 rounds)
- Rate limiting with @nestjs/throttler
- Input validation with class-validator
- SQL injection protection via Prisma

## 📊 Database Schema

Key entities and relationships:
- **Users**: Credibility scoring, daily points, streaks
- **Signals**: Core content with consensus tracking
- **Convictions**: Weighted votes with point costs
- **Challenges**: Stake-based duels between users
- **Notifications**: Polymorphic notification system

## 🚦 Development

```bash
# Run tests
npm run test

# Run e2e tests
npm run test:e2e

# Lint code
npm run lint

# Format code
npm run format

# Database operations
npm run prisma:studio    # Open Prisma Studio
npm run prisma:reset     # Reset database
```

## 📈 Performance Considerations

- **Database Indexing**: Optimized queries with proper indexes
- **Caching**: Redis for frequently accessed data
- **Pagination**: All list endpoints support pagination
- **Background Jobs**: Heavy calculations moved to queues
- **Connection Pooling**: Prisma connection management

## 🔮 Future Enhancements

- WebSocket integration for real-time updates
- Advanced ML-based consensus algorithms
- Oracle integration for automated resolution
- Mobile push notifications
- Advanced analytics dashboard
- Multi-language support

## 📄 License

MIT License - see LICENSE file for details.

---

Built with ❤️ using NestJS and modern TypeScript patterns."# sygnal-backend" 
