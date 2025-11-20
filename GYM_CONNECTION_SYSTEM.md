# GrappleMap Network - Gym Connection System

## Overview

The GrappleMap Network Gym Connection System is a comprehensive platform that connects BJJ practitioners with gyms across London, similar to the ClassPass business model. It enables users to discover gyms, book classes, build their training network, and track their progress.

## Key Features

### 1. User Authentication & Profiles
- **Email/Password Authentication** using NextAuth.js v5
- **User Profiles** with BJJ-specific fields:
  - Belt rank (white, blue, purple, brown, black)
  - Stripes (0-4)
  - Weight and weight class
  - Years of training
  - Training goals and preferences
  - Home gym association
  - Public/private profile settings

### 2. Gym Profiles & Management
- **Enhanced Gym Profiles** with:
  - Description and facilities
  - Contact information and social media
  - Pricing information (drop-in, monthly membership)
  - Gallery images
  - Verified status
- **Gym Dashboard** for gym owners/administrators to:
  - Create and manage classes
  - View booking statistics
  - Track attendance

### 3. Class Management
- **Class Types**: Gi, No-Gi, Open Mat, Fundamentals, Advanced, All Levels, etc.
- **Recurring or One-time Classes**
- **Capacity Management** with real-time booking counts
- **Flexible Pricing**:
  - Pay-per-session
  - Free for network members
  - Membership-based access
- **Scheduling** by day of week and time

### 4. Booking System
- **Browse and Filter Classes** by type, day, location
- **Real-time Availability** tracking
- **Simple Booking Flow**
- **Booking Management**:
  - View upcoming bookings
  - Cancel bookings
  - Check-in tracking
- **Payment Integration** (Stripe-ready)

### 5. Social Features
- **User Connections** - Follow other grapplers
- **Activity Feed**:
  - See who's training where
  - View connection activity
  - Track your own training history
- **Public Profiles** for networking
- **Training Visibility** to connect with training partners

## Technical Architecture

### Database Schema

#### New Tables
1. **user_profiles** - Extended user information with BJJ-specific fields
2. **classes** - Class schedules and details
3. **bookings** - User class bookings and attendance
4. **user_connections** - Social connections between users
5. **activity_feed** - Social activity tracking
6. **gym_admins** - Gym administrator relationships
7. **gym_profiles** - Enhanced gym information

#### Enhanced Tables
- **users** - Added authentication fields (passwordHash, role, emailVerified)

### API Endpoints

#### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/[...nextauth]` - NextAuth.js handler

#### User Management
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile

#### Classes
- `GET /api/classes` - List all classes (with filters)
- `POST /api/classes` - Create new class (gym admins)
- `GET /api/gyms/[id]/classes` - Get classes for specific gym

#### Bookings
- `GET /api/bookings` - Get user's bookings
- `POST /api/bookings` - Create new booking
- `DELETE /api/bookings?id={id}` - Cancel booking

#### Social Features
- `GET /api/connections` - Get user connections
- `POST /api/connections` - Follow a user
- `DELETE /api/connections?userId={id}` - Unfollow user
- `GET /api/activity-feed` - Get activity feed

#### Gym Profiles
- `GET /api/gyms/[id]/profile` - Get gym profile
- `PUT /api/gyms/[id]/profile` - Update gym profile

### Frontend Pages

1. **Authentication**
   - `/auth/signin` - Sign in page
   - `/auth/signup` - Registration page

2. **User Features**
   - `/profile` - User profile management
   - `/discover` - Main discovery/dashboard page
   - `/classes` - Browse and book classes
   - `/bookings` - View and manage bookings
   - `/feed` - Activity feed

3. **Gym Features**
   - `/gym-dashboard` - Gym class management
   - `/gyms/[id]` - Individual gym pages (to be implemented)

### Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Authentication**: NextAuth.js v5 (Auth.js)
- **Database**: PostgreSQL with Drizzle ORM
- **Password Hashing**: bcryptjs
- **Payments**: Stripe (integrated for existing features, extensible for bookings)
- **Mapping**: Leaflet (existing feature)

## User Journeys

### New User Journey
1. Visit site → Sign up (`/auth/signup`)
2. Create account with email/password
3. Complete profile (`/profile`) with belt rank, weight, goals
4. Discover gyms and classes (`/discover`)
5. Browse available classes (`/classes`)
6. Book first class
7. Connect with other grapplers (`/feed`)

### Returning User Journey
1. Sign in (`/auth/signin`)
2. View dashboard (`/discover`) with stats
3. Check upcoming bookings (`/bookings`)
4. Browse activity feed (`/feed`)
5. Book additional classes

### Gym Owner Journey
1. Sign up as gym admin
2. Create gym profile (enhanced with details)
3. Add classes to schedule (`/gym-dashboard`)
4. View bookings and manage capacity
5. Track attendance and revenue

## Business Model (ClassPass-style)

### For Users
- **Membership Tiers** (already implemented in existing code):
  - Network Standard ($29/month)
  - Network Pro ($59/month)
  - Network Academy ($99/month)
- **Pay-per-class** option for non-members
- **Credits System** (future enhancement)

### For Gyms
- **Revenue Share** from network bookings
- **Increased Exposure** to wider audience
- **Automated Payments** via Stripe Connect (existing)
- **Analytics Dashboard** for booking trends

## Key Differentiators

1. **BJJ-Specific**:
   - Belt rank tracking
   - Training goals alignment
   - Gi/No-Gi class filtering

2. **Social Network**:
   - Connect with training partners
   - See who's training where
   - Build your BJJ community

3. **London-Focused**:
   - Comprehensive gym coverage
   - Borough-based filtering
   - Transport information integration

4. **Flexible Access**:
   - Drop-in friendly
   - Multi-gym access
   - Trial options

## Future Enhancements

### Short-term
1. Email notifications for bookings
2. QR code check-in integration (leverage existing open_mats system)
3. Class reviews and ratings
4. Advanced search filters
5. Mobile-responsive improvements

### Medium-term
1. Mobile app (React Native)
2. Credits-based system
3. Personal training marketplace
4. Competition calendar integration
5. Seminar bookings

### Long-term
1. AI-powered gym recommendations
2. Training progress analytics
3. Video content library
4. International expansion
5. Integration with major BJJ organizations

## Setup Instructions

### Prerequisites
- Node.js 20+
- PostgreSQL database
- Stripe account (for payments)

### Environment Variables
```bash
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### Installation
```bash
# Install dependencies
pnpm install

# Generate database migrations
cd packages/db
npx drizzle-kit generate

# Run migrations
npx drizzle-kit migrate

# Start development server
cd ../../apps/grapplemap-web
pnpm dev
```

### Database Setup
The migrations will create all necessary tables. You can optionally seed with demo data.

## Security Considerations

1. **Password Security**: Passwords are hashed using bcryptjs (10 salt rounds)
2. **Session Management**: JWT-based sessions with NextAuth.js
3. **Authorization**: Middleware protects authenticated routes
4. **SQL Injection**: Drizzle ORM provides protection
5. **XSS**: React's built-in escaping

## API Documentation

### Authentication Required
Most endpoints require authentication via NextAuth session. Include credentials in requests.

### Error Responses
```json
{
  "error": "Error message description"
}
```

### Success Responses
```json
{
  "data": { ... },
  "message": "Success message"
}
```

## Support & Maintenance

### Monitoring
- Vercel Analytics (existing)
- Error tracking (recommend Sentry integration)
- Database performance monitoring

### Backups
- Automated database backups (configure with hosting provider)
- Regular data exports

## License & Credits

Built on top of the existing GrappleMap project, extending it with comprehensive gym connection and social networking features.

## Contact

For questions or support regarding the Gym Connection System, please refer to the main project documentation.
