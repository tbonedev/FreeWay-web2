# FreeWay - System Design Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack & Framework Selection](#technology-stack--framework-selection)
3. [System Architecture](#system-architecture)
4. [API Design](#api-design)
5. [Database Design](#database-design)
6. [Design Patterns](#design-patterns)
7. [Data Flow](#data-flow)
8. [State Management](#state-management)
9. [Infrastructure Design](#infrastructure-design)
10. [Implemented Features](#implemented-features)
11. [Security Considerations](#security-considerations)
12. [Performance Optimizations](#performance-optimizations)
13. [Trade-offs & Future Improvements](#trade-offs--future-improvements)

---

## Project Overview

**FreeWay** is a full-stack social media platform built with modern web technologies. It's a Twitter/Instagram-like application supporting user interactions, content sharing, real-time notifications, and direct messaging.

**Repository Structure:**
```
FreeWay/
├── api/                  # Backend (NestJS)
├── frontend/             # Frontend (Next.js 14)
└── SYSTEM_DESIGN.md     # This document
```

---

## Technology Stack & Framework Selection

### Backend Stack

| Technology | Version | Purpose | Why This Choice? |
|------------|---------|---------|------------------|
| **NestJS** | 10.3.10 | Backend Framework | - Enterprise-grade architecture with built-in DI<br>- TypeScript-first design<br>- Modular structure scales well<br>- Built-in support for Guards, Interceptors, Pipes<br>- Similar to Angular (familiar patterns) |
| **PostgreSQL** | 15 | Relational Database | - Strong ACID guarantees for social data<br>- Complex relationships (users, posts, follows)<br>- Mature ecosystem<br>- Better for structured data than NoSQL |
| **Prisma** | 5.18.0 | ORM | - Type-safe database queries<br>- Auto-generated TypeScript types<br>- Excellent migration system<br>- Better DX than TypeORM<br>- Built-in connection pooling |
| **Passport.js + JWT** | - | Authentication | - Industry standard for Node.js auth<br>- Strategy pattern allows multiple auth methods<br>- JWT enables stateless authentication<br>- NestJS has first-class support |
| **Bcrypt** | 5.1.1 | Password Hashing | - Adaptive hashing (resistant to brute force)<br>- Widely trusted and audited<br>- Configurable salt rounds |
| **Multer** | - | File Upload | - De-facto standard for multipart/form-data<br>- Built-in validation<br>- NestJS integration out-of-the-box |
| **class-validator** | 0.14.1 | Input Validation | - Decorator-based validation (clean code)<br>- Integrates with NestJS ValidationPipe<br>- Runtime type checking |

### Frontend Stack

| Technology | Version | Purpose | Why This Choice? |
|------------|---------|---------|------------------|
| **Next.js** | 14.1.0 | Frontend Framework | - App Router with React Server Components<br>- Built-in routing, no extra library needed<br>- Server Actions eliminate API route boilerplate<br>- Excellent SEO with SSR<br>- Image optimization built-in |
| **React** | 18 | UI Library | - Industry standard<br>- Large ecosystem<br>- Server Components for better performance<br>- useOptimistic for optimistic updates |
| **TypeScript** | 5 | Type System | - Type safety across entire stack<br>- Better DX with autocomplete<br>- Catches errors at compile time |
| **Tailwind CSS** | 3.3.0 | Styling | - Utility-first (faster development)<br>- No CSS bloat (tree-shaking)<br>- Consistent design system<br>- Excellent with component libraries |
| **shadcn/ui** | - | Component Library | - Copy-paste approach (full control)<br>- Built on Radix UI (accessibility)<br>- Customizable (not locked to library)<br>- No runtime dependency |
| **react-hook-form** | 7.51.0 | Form Management | - Better performance than Formik<br>- Fewer re-renders<br>- Built-in validation with Zod<br>- Small bundle size |
| **Zod** | 3.22.4 | Schema Validation | - Type-safe schemas<br>- Runtime validation<br>- Inferred TypeScript types<br>- Excellent error messages |

### Why NOT Other Options?

**Backend:**
- **Not Express**: Less structured, manual DI setup, no built-in patterns
- **Not Fastify**: Less mature ecosystem for enterprise features
- **Not TypeORM**: Prisma has better DX and type safety

**Frontend:**
- **Not Vite/CRA**: Next.js provides more out-of-the-box (routing, SSR, API)
- **Not Redux**: Server-first architecture eliminates need for global state
- **Not SWR/React Query**: Next.js cache with revalidation tags is built-in
- **Not Styled Components**: Tailwind is faster for rapid development
- **Not Material-UI**: shadcn/ui gives more control and smaller bundle

---

## System Architecture

### Overall Architecture Pattern: **N-Tier Layered Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT (Browser)                        │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                   FRONTEND (Next.js 14)                      │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Presentation Layer (React Components)                 │ │
│  │  - Server Components (SSR)                             │ │
│  │  - Client Components (CSR)                             │ │
│  └────────────────┬───────────────────────────────────────┘ │
│                   │                                          │
│  ┌────────────────▼───────────────────────────────────────┐ │
│  │  Application Layer (Server Actions + Services)         │ │
│  │  - Server Actions (mutations with cache invalidation)  │ │
│  │  - Service Functions (API calls)                       │ │
│  └────────────────┬───────────────────────────────────────┘ │
│                   │                                          │
│  ┌────────────────▼───────────────────────────────────────┐ │
│  │  Infrastructure Layer (API Client)                     │ │
│  │  - api() function (fetch wrapper with auth)            │ │
│  │  - Token management (cookie-based)                     │ │
│  └────────────────┬───────────────────────────────────────┘ │
└───────────────────┼──────────────────────────────────────────┘
                    │ HTTP/JSON (REST API)
                    │ Authorization: Bearer JWT
                    │
┌───────────────────▼──────────────────────────────────────────┐
│                    BACKEND (NestJS 10)                       │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Presentation Layer (Controllers)                      │ │
│  │  - Route handlers (@Get, @Post, @Patch, @Delete)      │ │
│  │  - DTOs (Data Transfer Objects)                        │ │
│  │  - Guards (JwtGuard for auth)                          │ │
│  │  - Interceptors (FileInterceptor for uploads)          │ │
│  └────────────────┬───────────────────────────────────────┘ │
│                   │                                          │
│  ┌────────────────▼───────────────────────────────────────┐ │
│  │  Business Logic Layer (Services)                       │ │
│  │  - Domain logic                                        │ │
│  │  - Service composition                                 │ │
│  │  - Business rules enforcement                          │ │
│  └────────────────┬───────────────────────────────────────┘ │
│                   │                                          │
│  ┌────────────────▼───────────────────────────────────────┐ │
│  │  Data Access Layer (Prisma ORM)                        │ │
│  │  - PrismaService (repository abstraction)              │ │
│  │  - Type-safe queries                                   │ │
│  │  - Transaction support                                 │ │
│  └────────────────┬───────────────────────────────────────┘ │
└───────────────────┼──────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│                   DATABASE (PostgreSQL 15)                   │
│  - User, Post, Comment, Like, Follow, Notification, Message │
└─────────────────────────────────────────────────────────────┘
```

### Is This MVC?

**Not traditional MVC.** Here's the comparison:

| MVC Component | FreeWay Equivalent | Notes |
|---------------|-------------------|-------|
| **Model** | Prisma Entities + Services | Business logic is in Services, not just data models |
| **View** | React Components (Frontend) | Completely separate frontend application |
| **Controller** | NestJS Controllers | Only handles HTTP, doesn't contain business logic |

**Actual Pattern:** **Layered Architecture with Module-Based Organization**

This is more appropriate for modern full-stack applications because:
- Clear separation of concerns (presentation, business, data)
- Frontend and backend are independent deployables
- Each layer has a single responsibility
- Easier to test and maintain

### Backend Module Architecture

```
api/src/
├── app.module.ts               # Root module (imports all feature modules)
│
├── auth/                       # Authentication Feature Module
│   ├── auth.controller.ts     # POST /auth/sign-in, /auth/sign-up
│   ├── auth.service.ts        # JWT generation, credential validation
│   ├── auth.module.ts         # Module definition
│   ├── dto/                   # SignInDto, SignUpDto
│   ├── strategy/              # JwtStrategy (Passport)
│   └── types/                 # TypeScript interfaces
│
├── users/                      # User Management Feature Module
│   ├── users.controller.ts    # GET/PATCH /users
│   ├── users.service.ts       # User CRUD operations
│   ├── users.module.ts
│   ├── dto/                   # EditUserDto
│   └── types/
│
├── posts/                      # Posts Feature Module
│   ├── posts.controller.ts    # POST/GET/PATCH/DELETE /posts
│   ├── posts.service.ts       # Post CRUD + enrichment
│   ├── posts.module.ts
│   ├── dto/                   # CreatePostDto, EditPostDto
│   └── types/
│
├── comments/                   # Comments Feature Module
├── likes/                      # Likes Feature Module
├── follows/                    # Follow System Feature Module
├── notifications/              # Notifications Feature Module
├── conversations/              # Chat/Messaging Feature Module
│
├── prisma/                     # Database Module
│   ├── prisma.service.ts      # PrismaClient wrapper
│   └── prisma.module.ts       # @Global() module
│
└── common/                     # Shared Utilities
    ├── decorators/            # @GetUser() custom decorator
    ├── guards/                # JwtGuard
    └── helpers/               # getImageUrl()
```

**Benefits:**
- Each feature is self-contained (high cohesion)
- Loose coupling between modules
- Easy to add new features (just add a new module)
- Clear boundaries for team collaboration

### Frontend Feature-Sliced Architecture

```
frontend/src/
├── app/                        # Next.js App Router (Routes)
│   ├── layout.tsx             # Root layout with providers
│   ├── (auth)/                # Route group for auth pages
│   │   └── [slug]/page.tsx   # /sign-in, /sign-up
│   ├── (general)/             # Route group for main app
│   │   ├── (home)/page.tsx   # / (home feed)
│   │   ├── post/[slug]/      # /post/:id
│   │   └── user/[slug]/      # /user/:username
│   └── chat/                  # /chat, /chat/:id
│
├── features/                   # Feature Modules (Vertical Slices)
│   ├── auth/
│   │   ├── components/        # LoginForm, RegisterForm
│   │   ├── actions.ts         # loginAction, registerAction
│   │   ├── services.ts        # login(), register() API calls
│   │   ├── types.ts           # TypeScript interfaces
│   │   └── index.ts           # Public API
│   ├── posts/
│   │   ├── components/        # PostItem, PostFormModal, etc.
│   │   ├── actions.ts         # createPostAction, addLikeAction
│   │   ├── services.ts        # getPosts(), createPost()
│   │   └── types.ts
│   ├── users/
│   ├── chat/
│   └── notifications/
│
├── components/                 # Shared UI Components
│   ├── ui/                    # shadcn/ui components (Button, Dialog, etc.)
│   ├── navbar/
│   ├── icons/
│   └── theme-provider/
│
├── lib/                        # Utilities and Configuration
│   ├── api.ts                 # Centralized fetch wrapper
│   ├── utils.ts               # cn() for className merging
│   ├── constant.ts            # App constants
│   └── types.ts               # Global TypeScript types
│
└── hooks/                      # Custom React Hooks
    ├── use-debounce.ts
    └── use-media-query.ts
```

**Why Feature-Sliced Design?**
- **Colocation**: Related code lives together (components, actions, services, types)
- **Encapsulation**: Each feature has a clear public API (index.ts)
- **Scalability**: Easy to add new features without touching existing code
- **Team Collaboration**: Different teams can work on different features
- **Code Splitting**: Next.js can easily split features into separate bundles

---

## API Design

### RESTful API Endpoints

**Base URL:** `http://localhost:8000`

#### Authentication Endpoints

| Method | Endpoint | Auth | Description | Request Body | Response |
|--------|----------|------|-------------|--------------|----------|
| POST | `/auth/sign-in` | No | User login | `{ email, password }` | `{ access_token }` |
| POST | `/auth/sign-up` | No | User registration | `{ email, username, password }` | `{ access_token }` |

#### User Endpoints

| Method | Endpoint | Auth | Description | Query/Body | Response |
|--------|----------|------|-------------|------------|----------|
| GET | `/users/me` | Yes | Get current user | - | `User` |
| GET | `/users` | Yes | Get all users following current user | - | `User[]` |
| POST | `/users` | Yes | Search users by username | `?username={query}` | `User[]` |
| GET | `/users/:username` | Yes | Get user profile | - | `UserWithStatus` |
| PATCH | `/users` | Yes | Update user profile | `FormData(username?, bio?, image?)` | `User` |

#### Post Endpoints

| Method | Endpoint | Auth | Description | Body | Response |
|--------|----------|------|-------------|------|----------|
| GET | `/posts` | Yes | Get all posts (with like status) | - | `PostType[]` |
| GET | `/posts/:id` | Yes | Get single post | - | `PostType` |
| POST | `/posts` | Yes | Create new post | `FormData(content, image)` | `PostType` |
| PATCH | `/posts/:id` | Yes | Update post | `FormData(content?, image?)` | `PostType` |
| DELETE | `/posts/:id` | Yes | Delete post | - | `Post` |

#### Comment Endpoints

| Method | Endpoint | Auth | Description | Body | Response |
|--------|----------|------|-------------|------|----------|
| GET | `/comments` | No | Get comments for post | `?postId={id}` | `Comment[]` |
| POST | `/comments` | Yes | Create comment | `{ content, postId }` | `Comment` |

#### Like Endpoints

| Method | Endpoint | Auth | Description | Response |
|--------|----------|------|-------------|----------|
| POST | `/likes/:postId` | Yes | Like a post | `Like` |
| DELETE | `/likes/:postId` | Yes | Unlike a post | `Like` |

#### Follow Endpoints

| Method | Endpoint | Auth | Description | Response |
|--------|----------|------|-------------|----------|
| POST | `/follows/:followerId` | Yes | Follow a user | `Follow` |
| DELETE | `/follows/:followerId` | Yes | Unfollow a user | `Follow` |

#### Notification Endpoints

| Method | Endpoint | Auth | Description | Response |
|--------|----------|------|-------------|----------|
| GET | `/notifications` | Yes | Get user notifications | `Notification[]` |

#### Conversation Endpoints

| Method | Endpoint | Auth | Description | Response |
|--------|----------|------|-------------|----------|
| GET | `/conversations` | Yes | Get all conversations | `Conversation[]` |
| GET | `/conversations/:id` | Yes | Get specific conversation | `Conversation` |
| POST | `/conversations/:userId` | Yes | Create conversation | `Conversation` |

### API Design Principles

1. **RESTful Resource Naming**
   - Plural nouns for collections: `/posts`, `/users`, `/comments`
   - IDs in URL path for specific resources: `/posts/:id`

2. **HTTP Method Semantics**
   - `GET`: Read operations (idempotent, no side effects)
   - `POST`: Create operations (non-idempotent)
   - `PATCH`: Partial update (idempotent)
   - `DELETE`: Delete operations (idempotent)

3. **Response Enrichment Pattern**
   Backend adds computed fields for frontend convenience:
   ```typescript
   {
     ...post,
     isLiked: boolean,      // Has current user liked this post?
     isEditable: boolean,   // Can current user edit?
     isUpdated: boolean,    // Was post edited after creation?
     _count: {              // Aggregated counts
       likes: number,
       comments: number
     },
     user: {                // Nested user data
       username: string,
       image: string
     }
   }
   ```

4. **Authentication Pattern**
   - JWT Bearer token in `Authorization` header
   - Guards applied at controller/method level with `@UseGuards(JwtGuard)`
   - User automatically injected via `@GetUser()` decorator

5. **Validation Pattern**
   - Global ValidationPipe validates all request bodies
   - DTOs with class-validator decorators
   - Automatic 400 Bad Request on validation failure

6. **Error Handling Pattern**
   - NestJS HTTP exceptions (NotFoundException, ConflictException, etc.)
   - Consistent error format:
     ```json
     {
       "statusCode": 404,
       "message": "Post not found",
       "error": "Not Found"
     }
     ```

### Why This API Design?

**Advantages:**
- **Predictable**: Follows REST conventions
- **Type-Safe**: DTOs ensure contract between frontend and backend
- **Efficient**: Response enrichment prevents multiple round-trips
- **Secure**: JWT authentication with HttpOnly cookies
- **Developer-Friendly**: Clear error messages and status codes

**Trade-offs:**
- **No GraphQL**: REST is simpler for this use case, less overhead
- **No Pagination**: Currently returns all posts (should be improved)
- **No Rate Limiting**: Should be added for production

---

## Database Design

### Database Technology: PostgreSQL 15 + Prisma ORM

**Why PostgreSQL?**
- Strong ACID guarantees (important for social interactions)
- Excellent support for complex relationships
- JSON columns for flexible data (if needed in future)
- Mature ecosystem and tooling

**Why Prisma?**
- Type-safe database queries (no runtime errors)
- Auto-generated TypeScript types from schema
- Excellent migration system (version control for database)
- Better DX than raw SQL or TypeORM

### Entity-Relationship Diagram

```
┌──────────────┐         ┌──────────────┐
│     USER     │────────┼│     POST     │
│              │ 1     * │              │
│ id (PK)      │         │ id (PK)      │
│ username ◈   │         │ content      │
│ email ◈      │         │ image        │
│ password     │         │ userId (FK)  │
│ bio          │         │ createdAt    │
│ image        │         │ updatedAt    │
│ createdAt    │         └──────┬───────┘
│ updatedAt    │                │
└──────┬───────┘                │ 1
       │                        │
       │ 1                      │ *
       │                   ┌────▼──────┐
       │                   │  COMMENT  │
       │                   │           │
       │                   │ id (PK)   │
       │                * │ content   │
       ├──────────────────┤ userId FK │
       │                   │ postId FK │ [CASCADE DELETE]
       │                   │ createdAt │
       │                   └───────────┘
       │
       │ 1                 ┌──────────┐
       │                * │   LIKE   │
       ├──────────────────┤          │
       │                   │ id (PK)  │
       │                   │ userId FK│
       │                   │ postId FK│ [CASCADE DELETE]
       │                   └──────────┘
       │
       │ 1 (follower)      ┌──────────────┐
       │                * │    FOLLOW    │
       ├──────────────────┤              │
       │                   │ id (PK)      │
       │ 1 (following)     │ followerId FK│
       │                * │ followingId FK
       ├──────────────────┤ createdAt    │
       │                   └──────────────┘
       │
       │ 1 (recipient)     ┌────────────────────┐
       │                * │   NOTIFICATION     │
       ├──────────────────┤                    │
       │                   │ id (PK)            │
       │ 1 (sender)        │ type               │
       │                * │ postId (FK, NULL?) │ [SET NULL]
       ├──────────────────┤ userId (FK)        │
       │                   │ senderId (FK)      │
       │                   │ createdAt          │
       │                   └────────────────────┘
       │
       │ *                 ┌────────────────┐
       │                   │ CONVERSATION   │
       └───────────────────┤                │ [Many-to-Many]
                         * │ id (PK)        │
                           │ createdAt      │
                           │ updatedAt      │
                           └────────┬───────┘
                                    │ 1
                                    │
                                    │ *
                           ┌────────▼────────┐
                           │    MESSAGE      │
                           │                 │
                           │ id (PK)         │
                           │ content         │
                           │ senderId (FK)   │
                           │ conversationId FK
                           │ createdAt       │
                           └─────────────────┘

Legend:
  PK = Primary Key
  FK = Foreign Key
  ◈  = Unique Constraint
  [CASCADE DELETE] = Delete related records when parent is deleted
  [SET NULL] = Set to NULL when parent is deleted
```

### Database Schema

#### User Table
```sql
CREATE TABLE "User" (
  id            SERIAL PRIMARY KEY,
  username      TEXT UNIQUE NOT NULL,
  email         TEXT UNIQUE NOT NULL,
  password      TEXT NOT NULL,
  bio           TEXT,
  image         TEXT DEFAULT 'https://example.com/default-avatar.png',
  createdAt     TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  updatedAt     TIMESTAMP(3)
);
```

**Design Decisions:**
- `username` and `email` are UNIQUE (enforced at DB level)
- `password` stores bcrypt hash (never plaintext)
- `image` has default avatar URL
- Timestamps track account creation and updates

#### Post Table
```sql
CREATE TABLE "Post" (
  id            SERIAL PRIMARY KEY,
  content       TEXT NOT NULL,
  image         TEXT NOT NULL,
  createdAt     TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  updatedAt     TIMESTAMP(3),
  userId        INTEGER NOT NULL REFERENCES "User"(id)
);
```

**Design Decisions:**
- `image` is required (no text-only posts currently)
- `userId` foreign key with RESTRICT (can't delete user with posts)
- `updatedAt` differs from `createdAt` when edited

#### Comment Table
```sql
CREATE TABLE "Comment" (
  id            SERIAL PRIMARY KEY,
  content       TEXT NOT NULL,
  createdAt     TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  updatedAt     TIMESTAMP(3),
  userId        INTEGER NOT NULL REFERENCES "User"(id),
  postId        INTEGER NOT NULL REFERENCES "Post"(id) ON DELETE CASCADE
);
```

**Design Decisions:**
- **CASCADE DELETE**: Comments deleted when post is deleted
- No edit functionality (updatedAt exists but unused)

#### Like Table
```sql
CREATE TABLE "Like" (
  id        SERIAL PRIMARY KEY,
  userId    INTEGER NOT NULL REFERENCES "User"(id),
  postId    INTEGER NOT NULL REFERENCES "Post"(id) ON DELETE CASCADE
);
```

**Design Decisions:**
- **CASCADE DELETE**: Likes deleted when post is deleted
- **Missing**: Should have `UNIQUE(userId, postId)` to prevent duplicate likes

#### Follow Table
```sql
CREATE TABLE "Follow" (
  id            SERIAL PRIMARY KEY,
  followerId    INTEGER NOT NULL REFERENCES "User"(id),
  followingId   INTEGER NOT NULL REFERENCES "User"(id),
  createdAt     TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);
```

**Design Decisions:**
- Self-referencing relationship (User → User)
- `followerId` = user who follows
- `followingId` = user being followed
- **Missing**: Should have `UNIQUE(followerId, followingId)` to prevent duplicate follows

#### Notification Table
```sql
CREATE TABLE "Notification" (
  id        SERIAL PRIMARY KEY,
  type      TEXT NOT NULL,          -- 'like', 'comment', 'follow'
  postId    INTEGER REFERENCES "Post"(id) ON DELETE SET NULL,
  userId    INTEGER NOT NULL REFERENCES "User"(id),    -- recipient
  senderId  INTEGER NOT NULL REFERENCES "User"(id),    -- trigger user
  createdAt TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);
```

**Design Decisions:**
- `type` field for polymorphic notifications
- `postId` is optional (NULL for follow notifications)
- **SET NULL**: postId set to NULL if post deleted (keeps notification history)
- **Missing**: No `isRead` field to track read status

#### Conversation Table
```sql
CREATE TABLE "Conversation" (
  id            SERIAL PRIMARY KEY,
  createdAt     TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  updatedAt     TIMESTAMP(3)
);

-- Many-to-many join table
CREATE TABLE "_participants" (
  A INTEGER NOT NULL REFERENCES "Conversation"(id) ON DELETE CASCADE,
  B INTEGER NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  UNIQUE(A, B)
);
CREATE INDEX "_participants_B_index" ON "_participants"(B);
```

**Design Decisions:**
- Many-to-many relationship (supports group chats)
- Implicit join table `_participants` (Prisma convention)
- **CASCADE DELETE**: Removes conversation when user is deleted

#### Message Table
```sql
CREATE TABLE "Message" (
  id              SERIAL PRIMARY KEY,
  content         TEXT NOT NULL,
  senderId        INTEGER NOT NULL REFERENCES "User"(id),
  conversationId  INTEGER NOT NULL REFERENCES "Conversation"(id),
  createdAt       TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);
```

**Design Decisions:**
- Belongs to a conversation (not direct user-to-user)
- **Missing**: No `isRead` field for read receipts

### Database Relationships Summary

| Relationship Type | Example | Cardinality | Notes |
|-------------------|---------|-------------|-------|
| One-to-Many | User → Posts | 1:N | One user has many posts |
| One-to-Many | Post → Comments | 1:N | CASCADE DELETE |
| One-to-Many | Post → Likes | 1:N | CASCADE DELETE |
| Many-to-Many (self-referencing) | User ↔ User (Follow) | N:M | Named relations: follower/following |
| Many-to-Many | User ↔ Conversation | N:M | Via `_participants` join table |
| One-to-Many | Conversation → Messages | 1:N | - |

### Why This Database Design?

**Strengths:**
1. **Normalized**: No data duplication (3NF)
2. **Referential Integrity**: Foreign keys enforce consistency
3. **Cascade Rules**: Automatic cleanup of related data
4. **Timestamps**: Full audit trail for entities
5. **Scalable**: Supports future features (groups, hashtags, etc.)

**Trade-offs:**
1. **No Composite Unique Constraints**: Allows duplicate likes/follows (should be fixed)
2. **No Soft Deletes**: Data is permanently deleted (can't recover)
3. **No Read Status**: Notifications and messages don't track if read
4. **No Indexes on FK**: May have performance issues at scale (PostgreSQL auto-indexes some)
5. **Required Image**: Can't create text-only posts

---

## Design Patterns

### Backend Design Patterns

#### 1. Dependency Injection Pattern
**Implementation:** NestJS built-in DI container

```typescript
// auth.service.ts
@Injectable()
export class AuthService {
  constructor(
    private config: ConfigService,      // Injected
    private prisma: PrismaService,      // Injected
    private usersService: UsersService, // Injected
    private jwtService: JwtService,     // Injected
  ) {}
}
```

**Why?**
- Loose coupling (easy to swap implementations)
- Testability (can mock dependencies)
- Single responsibility (dependencies managed by framework)

#### 2. Repository Pattern
**Implementation:** Prisma ORM as repository abstraction

```typescript
// prisma.service.ts
@Injectable()
export class PrismaService extends PrismaClient {
  constructor(config: ConfigService) {
    super({
      datasources: {
        db: { url: config.get('DATABASE_URL') },
      },
    });
  }
}

// Usage in posts.service.ts
export class PostsService {
  constructor(private prisma: PrismaService) {}

  findAll(): Promise<Post[]> {
    return this.prisma.post.findMany({ ... });
  }
}
```

**Why?**
- Abstracts database operations
- Type-safe queries
- Easy to switch databases (just change Prisma schema)

#### 3. Strategy Pattern
**Implementation:** Passport authentication strategies

```typescript
// jwt.strategy.ts
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(config: ConfigService, private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get('TOKEN_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.usersService.findOneById(payload.sub);
    delete user.password;
    return user;
  }
}
```

**Why?**
- Can easily add OAuth, Local, or other strategies
- Swappable authentication methods
- Follows Open/Closed Principle

#### 4. Decorator Pattern
**Implementation:** Custom parameter decorators

```typescript
// get-user.decorator.ts
export const GetUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    if (data) return request.user[data];
    return request.user;
  },
);

// Usage
@Get()
@UseGuards(JwtGuard)
async findAll(@GetUser() user: User) {
  // user automatically extracted from request
}
```

**Why?**
- Adds functionality without modifying existing code
- Clean controller methods
- Reusable across controllers

#### 5. Guard Pattern
**Implementation:** Authorization guards

```typescript
// jwt.guard.ts
export class JwtGuard extends AuthGuard('jwt') {
  constructor() {
    super();
  }
}

// Usage
@Get()
@UseGuards(JwtGuard)
async findAll() {
  // Only authenticated users can access
}
```

**Why?**
- Separates authorization logic from business logic
- Reusable across routes
- Can be applied at controller or method level

#### 6. DTO (Data Transfer Object) Pattern
**Implementation:** Validation with class-validator

```typescript
// sign-up.dto.ts
export class SignUpDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

// Applied globally via ValidationPipe
app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
```

**Why?**
- Type safety and validation
- Automatic stripping of unknown properties (whitelist: true)
- Declarative validation rules

#### 7. Module Pattern
**Implementation:** Feature modules

```typescript
// auth.module.ts
@Module({
  imports: [PrismaModule, UsersModule, JwtModule.register({ ... })],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
```

**Why?**
- Encapsulation (each feature is self-contained)
- Lazy loading (can load modules on demand)
- Clear boundaries between features

#### 8. Factory Pattern
**Implementation:** Configuration factories

```typescript
// multer-options.config.ts
export const multerOptions: MulterOptions = {
  limits: { fileSize: +process.env.MAX_FILE_SIZE || 10485760 },
  fileFilter(req, file, done) {
    if (file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
      done(null, true);
    } else {
      done(new HttpException(`Unsupported file type`, HttpStatus.BAD_REQUEST), false);
    }
  },
  storage: diskStorage({
    destination: process.env.UPLOAD_DIR,
    filename: (req, file, done) => {
      done(null, `${uuid()}${extname(file.originalname)}`);
    },
  }),
};
```

**Why?**
- Encapsulates object creation logic
- Centralized configuration
- Easy to modify upload rules

### Frontend Design Patterns

#### 1. Server Components Pattern (React 18+)
**Implementation:** Next.js 14 App Router

```typescript
// page.tsx (Server Component by default)
const HomePage = async () => {
  const { data: posts } = await getPosts(); // Async data fetching

  return (
    <div>
      {posts && posts.map((post) => <PostItem key={post.id} post={post} />)}
    </div>
  );
};
```

**Why?**
- Less JavaScript sent to client
- Better SEO (fully rendered HTML)
- Direct database access (if needed)
- Automatic code splitting

#### 2. Server Actions Pattern
**Implementation:** Next.js Server Actions

```typescript
// actions.ts
'use server';

export const createPostAction = async (formData: FormData) => {
  const { error } = await createPost(formData);
  if (error) return error;
  revalidateTag('posts'); // Invalidate cache
};

// Component
const onSubmit = async (data) => {
  const error = await createPostAction(formData);
  if (error) {
    toast({ variant: 'destructive', description: error.message });
  }
};
```

**Why?**
- Type-safe RPC (Remote Procedure Call)
- No API route boilerplate
- Automatic serialization
- Built-in error handling

#### 3. Optimistic UI Pattern
**Implementation:** React 18 useOptimistic

```typescript
// add-like-button.tsx
const [optimisticIsLiked, setOptimisticIsLiked] = useOptimistic(
  isLiked,
  (state) => !state
);

const likeAction = async () => {
  setOptimisticIsLiked(!optimisticIsLiked); // Update UI immediately

  if (optimisticIsLiked) {
    await deleteLikeAction(id); // Then update server
  } else {
    await addLikeAction(id);
  }
};
```

**Why?**
- Instant UI feedback (feels faster)
- Better user experience
- Automatically reverts on error

#### 4. Compound Component Pattern
**Implementation:** shadcn/ui components

```typescript
// button.tsx
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
```

**Why?**
- Flexible composition
- Reusable components
- Type-safe props

#### 5. Custom Hooks Pattern
**Implementation:** Reusable logic extraction

```typescript
// use-debounce.ts
export const useDebounce = (value: string, delay: number = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};

// Usage
const debouncedSearch = useDebounce(searchTerm);
```

**Why?**
- DRY (Don't Repeat Yourself)
- Testable in isolation
- Composable

#### 6. Form Controller Pattern
**Implementation:** react-hook-form + Zod

```typescript
const form = useForm<TCreatePostFormSchema>({
  resolver: zodResolver(createPostFormSchema), // Zod validation
  defaultValues,
});

<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <FormField
      control={form.control}
      name="content"
      render={({ field }) => (
        <FormItem>
          <FormControl>
            <Textarea {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </form>
</Form>
```

**Why?**
- Controlled form state
- Automatic validation
- Better performance (fewer re-renders)

#### 7. Feature-Sliced Design Pattern
**Implementation:** Directory structure

```
features/
├── posts/
│   ├── components/
│   ├── actions.ts
│   ├── services.ts
│   └── types.ts
```

**Why?**
- Colocation (related code together)
- Scalability (easy to add features)
- Encapsulation (clear boundaries)

#### 8. Middleware Pattern
**Implementation:** Next.js middleware for auth

```typescript
// middleware.ts
export const middleware = async (request: NextRequest) => {
  const token = request.cookies.get('token');

  if (token) {
    // Redirect authenticated users away from auth pages
    if (url.pathname === '/sign-in' || url.pathname === '/sign-up') {
      return NextResponse.rewrite(new URL('/', request.url));
    }
  } else {
    // Redirect unauthenticated users to login
    if (protectedRoutes.includes(url.pathname)) {
      return NextResponse.rewrite(new URL('/sign-in', request.url));
    }
  }
};
```

**Why?**
- Route protection at edge (before page renders)
- Centralized auth logic
- Better performance (no client-side checks)

---

## Data Flow

### Complete User Flow: Creating a Post

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. USER INTERACTION                                              │
└─────────────────────────────────────────────────────────────────┘
   User clicks "Create Post" → PostFormModal opens
   User uploads image → react-dropzone stores file in state
   User types content → react-hook-form tracks input
   User clicks "Create Post" → form.handleSubmit(onSubmit)

                              ▼

┌─────────────────────────────────────────────────────────────────┐
│ 2. FRONTEND - Component Layer                                    │
└─────────────────────────────────────────────────────────────────┘
   const onSubmit = async ({ content }) => {
     const formData = new FormData();
     formData.append('image', image);
     formData.append('content', content);

     const error = await createPostAction(formData);
   }

                              ▼

┌─────────────────────────────────────────────────────────────────┐
│ 3. FRONTEND - Server Action Layer                                │
└─────────────────────────────────────────────────────────────────┘
   'use server';
   export const createPostAction = async (formData: FormData) => {
     const { error } = await createPost(formData);
     if (error) return error;
     revalidateTag('posts'); // Cache invalidation
   }

                              ▼

┌─────────────────────────────────────────────────────────────────┐
│ 4. FRONTEND - Service Layer                                      │
└─────────────────────────────────────────────────────────────────┘
   export const createPost = async (formData: FormData) => {
     return await api('posts', {
       method: 'POST',
       body: formData,
     });
   }

                              ▼

┌─────────────────────────────────────────────────────────────────┐
│ 5. FRONTEND - API Client                                         │
└─────────────────────────────────────────────────────────────────┘
   export const api = async (endpoint, init) => {
     const token = await getToken(); // From cookie

     const res = await fetch(`${baseUrl}${endpoint}`, {
       headers: {
         Authorization: `Bearer ${token}`,
       },
       method: 'POST',
       body: formData,
     });

     if (res.ok) return { data: await res.json() };
     return { error: await res.json() };
   }

                              ▼
                    HTTP POST Request
        POST http://localhost:8000/posts
        Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
        Content-Type: multipart/form-data

        Body:
        ------WebKitFormBoundary...
        Content-Disposition: form-data; name="image"; filename="photo.jpg"
        Content-Type: image/jpeg

        [binary data]
        ------WebKitFormBoundary...
        Content-Disposition: form-data; name="content"

        This is my new post!
        ------WebKitFormBoundary...
                              ▼

┌─────────────────────────────────────────────────────────────────┐
│ 6. BACKEND - Guard Layer                                         │
└─────────────────────────────────────────────────────────────────┘
   @UseGuards(JwtGuard)
   ↓
   JwtGuard → JwtStrategy.validate(payload)
   ↓
   const user = await usersService.findOneById(payload.sub);
   delete user.password;
   request.user = user; // Attach user to request

                              ▼

┌─────────────────────────────────────────────────────────────────┐
│ 7. BACKEND - Interceptor Layer                                   │
└─────────────────────────────────────────────────────────────────┘
   @UseInterceptors(FileInterceptor('image', multerOptions))
   ↓
   Multer processes multipart/form-data:
     - Validates MIME type (jpg/jpeg/png/gif)
     - Validates file size (max 10MB)
     - Generates UUID filename: "a1b2c3d4-e5f6-7890.jpg"
     - Saves file to disk: uploads/a1b2c3d4-e5f6-7890.jpg
     - Populates @UploadedFile() parameter

                              ▼

┌─────────────────────────────────────────────────────────────────┐
│ 8. BACKEND - Controller Layer                                    │
└─────────────────────────────────────────────────────────────────┘
   @Post()
   @UseGuards(JwtGuard)
   @UseInterceptors(FileInterceptor('image', multerOptions))
   create(
     @UploadedFile() file: Express.Multer.File,
     @GetUser() user: User,
     @Body() createPostDto: CreatePostDto,
   ): Promise<PostType> {
     return this.postsService.create({
       userId: user.id,
       content: createPostDto.content,
       image: getImageUrl(file.filename),
       // image: "http://localhost:8000/a1b2c3d4-e5f6-7890.jpg"
     });
   }

                              ▼

┌─────────────────────────────────────────────────────────────────┐
│ 9. BACKEND - Service Layer                                       │
└─────────────────────────────────────────────────────────────────┘
   create(data: CreatePost): Promise<Post> {
     return this.prisma.post.create({
       data: {
         userId: data.userId,
         content: data.content,
         image: data.image,
       },
     });
   }

                              ▼

┌─────────────────────────────────────────────────────────────────┐
│ 10. DATABASE - PostgreSQL                                        │
└─────────────────────────────────────────────────────────────────┘
   INSERT INTO "Post" (content, image, userId, createdAt, updatedAt)
   VALUES (
     'This is my new post!',
     'http://localhost:8000/a1b2c3d4-e5f6-7890.jpg',
     123,
     '2025-12-16 10:30:00.000',
     '2025-12-16 10:30:00.000'
   )
   RETURNING *;

                              ▼

┌─────────────────────────────────────────────────────────────────┐
│ 11. RESPONSE FLOW BACK                                           │
└─────────────────────────────────────────────────────────────────┘
   Database → Service → Controller → HTTP Response

   HTTP 201 Created
   {
     "id": 456,
     "content": "This is my new post!",
     "image": "http://localhost:8000/a1b2c3d4-e5f6-7890.jpg",
     "userId": 123,
     "createdAt": "2025-12-16T10:30:00.000Z",
     "updatedAt": "2025-12-16T10:30:00.000Z"
   }

                              ▼

┌─────────────────────────────────────────────────────────────────┐
│ 12. FRONTEND - Receive Response                                  │
└─────────────────────────────────────────────────────────────────┘
   api() function returns { data: post }
   ↓
   Service returns { data: post }
   ↓
   Server Action receives response:
     - revalidateTag('posts') invalidates Next.js cache
   ↓
   Component receives null (no error):
     - Shows success toast: "Post added."
     - form.reset() clears form
     - setIsOpen(false) closes modal

                              ▼

┌─────────────────────────────────────────────────────────────────┐
│ 13. UI UPDATE                                                    │
└─────────────────────────────────────────────────────────────────┘
   Next.js automatically refetches posts with fresh cache
   ↓
   New post appears in feed immediately
   ↓
   User sees their post with image displayed
```

### Authentication Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ LOGIN FLOW                                                       │
└─────────────────────────────────────────────────────────────────┘

User enters email/password → LoginForm component
   ↓
form.handleSubmit(onSubmit)
   ↓
loginAction({ email, password })  [Server Action]
   ↓
login({ email, password })  [Service]
   ↓
api('auth/sign-in', { method: 'POST', body: JSON.stringify(...) })
   ↓
POST http://localhost:8000/auth/sign-in
   ↓
AuthController.signIn(signInDto)
   ↓
AuthService.signIn(signInDto)
   ├─ usersService.findOneByEmail(email)
   ├─ bcrypt.compare(password, user.password)  // Validate password
   ├─ If invalid → throw UnauthorizedException
   └─ If valid → signToken({ sub: user.id, email, username })
      ↓
      jwtService.signAsync(payload, { expiresIn: '365d' })
      ↓
      return { access_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }
   ↓
Response: { access_token: "..." }
   ↓
Server Action receives response:
   cookies().set('token', data.access_token, { expires: 1 year })
   redirect('/')
   ↓
User redirected to home page (authenticated)

┌─────────────────────────────────────────────────────────────────┐
│ AUTHENTICATED REQUEST FLOW                                       │
└─────────────────────────────────────────────────────────────────┘

User makes authenticated request (e.g., GET /posts)
   ↓
Frontend api() function:
   const token = await getToken();  // Reads from cookie
   ↓
   fetch('http://localhost:8000/posts', {
     headers: { Authorization: `Bearer ${token}` }
   })
   ↓
Backend receives request:
   @UseGuards(JwtGuard)
   ↓
   JwtGuard → PassportStrategy('jwt')
   ↓
   ExtractJwt.fromAuthHeaderAsBearerToken()  // Extract token
   ↓
   jwt.verify(token, TOKEN_SECRET)  // Verify signature
   ↓
   JwtStrategy.validate(payload)
   ↓
   usersService.findOneById(payload.sub)  // Load user from database
   ↓
   delete user.password;  // Remove sensitive data
   ↓
   return user;  // Attach to request.user
   ↓
Controller can access user via @GetUser() decorator
   ↓
Request processed with authenticated user context
```

### File Upload Flow (Images)

```
┌─────────────────────────────────────────────────────────────────┐
│ FILE UPLOAD FLOW                                                 │
└─────────────────────────────────────────────────────────────────┘

User drags/drops file → react-dropzone
   ↓
onDrop callback:
   setImage(acceptedFiles[0])  // Store File object
   setImageUrl(URL.createObjectURL(file))  // Create preview URL
   ↓
User sees image preview
   ↓
User submits form:
   const formData = new FormData();
   formData.append('image', image);  // File object
   formData.append('content', content);
   ↓
createPostAction(formData)
   ↓
api('posts', { method: 'POST', body: formData })
   ↓
POST http://localhost:8000/posts
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary...
   ↓
Backend @UseInterceptors(FileInterceptor('image', multerOptions))
   ↓
Multer processes file:
   1. Check MIME type: file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)
      - If invalid → throw HttpException (400 Bad Request)
   2. Check file size: fileSize <= 10MB
      - If too large → reject
   3. Generate filename: uuid() + extname(file.originalname)
      - Example: "a1b2c3d4-e5f6-7890-abcd.jpg"
   4. Save to disk:
      - Destination: process.env.UPLOAD_DIR (e.g., "uploads/")
      - Full path: "uploads/a1b2c3d4-e5f6-7890-abcd.jpg"
   ↓
File saved successfully
   ↓
Controller receives:
   @UploadedFile() file: Express.Multer.File
   file.filename = "a1b2c3d4-e5f6-7890-abcd.jpg"
   ↓
getImageUrl(file.filename)
   → `${process.env.URL}/${filename}`
   → "http://localhost:8000/a1b2c3d4-e5f6-7890-abcd.jpg"
   ↓
Post created with image URL in database
   ↓
Frontend receives response with full image URL
   ↓
Next.js Image component loads image:
   <Image src={post.image} alt="..." />
   ↓
Backend serves static file:
   ServeStaticModule.forRoot({ rootPath: 'uploads' })
   ↓
Image displayed to user
```

---

## State Management

### No Traditional Global State Management

**Key Decision:** No Redux, Zustand, or global Context for application state.

**Why?**
- Next.js 14 Server Components fetch data directly on server
- Server Actions handle mutations
- No need for client-side state synchronization
- Simpler mental model (data flows top-down)

### State Management Strategies

#### 1. Server State (Data from API)
**Implementation:** Next.js Cache API

```typescript
// Service function
export const getPosts = async () => {
  return await api<TPost[]>('posts', {
    next: { tags: ['posts'] },  // Tag for cache invalidation
  });
};

// Server Action (mutation)
export const createPostAction = async (formData: FormData) => {
  const { error } = await createPost(formData);
  if (error) return error;
  revalidateTag('posts');  // Invalidate cache
};

// Server Component (automatic caching)
const HomePage = async () => {
  const { data: posts } = await getPosts();  // Cached on server
  return <div>{posts.map(...)}</div>;
};
```

**Cache Tags Used:**
- `posts` - All posts
- `comments/{postId}` - Comments for specific post
- `users/{username}` - User profile data
- `users/me` - Current user data

**Benefits:**
- Automatic caching (no manual cache logic)
- Granular invalidation (only invalidate what changed)
- No stale data (automatic refetch after mutation)

#### 2. Form State
**Implementation:** react-hook-form + Zod

```typescript
const form = useForm<TCreatePostFormSchema>({
  resolver: zodResolver(createPostFormSchema),
  defaultValues,
});

const onSubmit = async (values: TCreatePostFormSchema) => {
  const formData = new FormData();
  formData.append('content', values.content);

  const error = await createPostAction(formData);

  if (error) {
    toast({ variant: 'destructive', description: error.message });
  } else {
    form.reset();  // Clear form
  }
};
```

**Benefits:**
- Controlled form state
- Automatic validation
- Better performance (fewer re-renders)
- Loading states built-in (`form.formState.isSubmitting`)

#### 3. Local Component State
**Implementation:** useState, useOptimistic

```typescript
// Dialog state
const [isOpen, setIsOpen] = useState(false);

// Optimistic UI updates
const [optimisticIsLiked, setOptimisticIsLiked] = useOptimistic(
  isLiked,
  (state) => !state
);

const likeAction = async () => {
  setOptimisticIsLiked(!optimisticIsLiked);  // Instant UI update
  await addLikeAction(id);  // Then sync with server
};
```

**Benefits:**
- Simple and familiar
- Optimistic updates for better UX
- Automatic rollback on error

#### 4. URL State
**Implementation:** Next.js App Router

```typescript
// Dynamic routes
app/
├── post/[slug]/page.tsx   // /post/123
├── user/[slug]/page.tsx   // /user/johndoe
└── chat/[slug]/page.tsx   // /chat/456

// Route params automatically available
export default async function PostPage({ params }: { params: { slug: string } }) {
  const { data: post } = await getPost(params.slug);
  return <div>{post.content}</div>;
}
```

**Benefits:**
- Shareable URLs
- Browser back/forward works
- SEO-friendly

#### 5. Authentication State
**Implementation:** HTTP-only cookie + middleware

```typescript
// Login sets cookie (Server Action)
cookies().set('token', access_token, { expires: 1 year });

// Middleware checks auth
export const middleware = async (request: NextRequest) => {
  const token = request.cookies.get('token');

  if (!token && protectedRoutes.includes(url.pathname)) {
    return NextResponse.rewrite(new URL('/sign-in', request.url));
  }
};

// API client reads cookie
const getToken = async () => {
  if (typeof window === 'undefined') {
    // Server-side
    const { cookies } = await import('next/headers');
    return cookies().get('token')?.value;
  } else {
    // Client-side
    return document.cookie.replace(/(?:(?:^|.*;\s*)token\s*=\s*([^;]*).*$)|^.*$/, '$1');
  }
};
```

**Benefits:**
- Secure (HttpOnly cookie can't be accessed by JavaScript)
- No need for global auth state
- Works on both server and client

### State Flow Diagram

```
┌───────────────────────────────────────────────────────────────┐
│                      USER INTERACTION                          │
└───────────────────────┬───────────────────────────────────────┘
                        │
                        ▼
┌───────────────────────────────────────────────────────────────┐
│              LOCAL COMPONENT STATE (useState)                  │
│  - Form inputs (react-hook-form)                              │
│  - Modal open/close                                            │
│  - Optimistic UI updates (useOptimistic)                       │
└───────────────────────┬───────────────────────────────────────┘
                        │
                        ▼ (User submits form)
┌───────────────────────────────────────────────────────────────┐
│              SERVER ACTION (Mutation)                          │
│  - Validates input                                             │
│  - Calls backend API                                           │
│  - Invalidates cache tags (revalidateTag)                     │
└───────────────────────┬───────────────────────────────────────┘
                        │
                        ▼
┌───────────────────────────────────────────────────────────────┐
│                     BACKEND API                                │
│  - Processes request                                           │
│  - Updates database                                            │
│  - Returns response                                            │
└───────────────────────┬───────────────────────────────────────┘
                        │
                        ▼
┌───────────────────────────────────────────────────────────────┐
│              NEXT.JS CACHE (Server State)                      │
│  - Cache invalidated by tag                                    │
│  - Next render automatically refetches fresh data              │
└───────────────────────┬───────────────────────────────────────┘
                        │
                        ▼
┌───────────────────────────────────────────────────────────────┐
│              UI RE-RENDERS                                     │
│  - Server Components refetch data                              │
│  - New data displayed to user                                  │
└───────────────────────────────────────────────────────────────┘
```

---

## Infrastructure Design

### Development Environment

```
┌─────────────────────────────────────────────────────────────────┐
│                      LOCAL DEVELOPMENT                           │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Frontend      │     │    Backend      │     │   Database      │
│                 │     │                 │     │                 │
│  Next.js 14     │────▶│   NestJS 10     │────▶│  PostgreSQL 15  │
│  localhost:3000 │     │  localhost:8000 │     │  localhost:5434 │
│                 │     │                 │     │                 │
│  - React 18     │     │  - Prisma ORM   │     │  (Docker)       │
│  - Tailwind     │     │  - JWT Auth     │     │                 │
│  - TypeScript   │     │  - TypeScript   │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                       │
         │                       │
         │                       ▼
         │              ┌─────────────────┐
         │              │  File Storage   │
         │              │                 │
         └─────────────▶│  uploads/       │
                        │  (Local Disk)   │
                        └─────────────────┘
```

**Environment Variables:**

**Backend (.env):**
```env
DATABASE_URL="postgresql://postgres:123@localhost:5434/nest"
TOKEN_SECRET="your-jwt-secret-key"
URL="http://localhost:8000"
UPLOAD_DIR="uploads"
MAX_FILE_SIZE="10485760"
```

**Frontend (.env.local):**
```env
NEXT_PUBLIC_API_URL="http://localhost:8000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Docker Setup

**PostgreSQL Container (docker-compose.yml):**
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    container_name: freeway-db
    ports:
      - "5434:5432"
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: 123
      POSTGRES_DB: nest
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

**Why Docker for Database?**
- Consistent environment across team members
- Easy to reset/recreate database
- No local PostgreSQL installation needed

### File Storage

**Current Implementation:** Local Disk Storage

```
api/
├── uploads/                    # File upload directory
│   ├── a1b2c3d4-e5f6.jpg     # User profile images
│   ├── b2c3d4e5-f6a7.png     # Post images
│   └── ...
```

**Serving Files:**
```typescript
// main.ts
ServeStaticModule.forRoot({
  rootPath: join(__dirname, '..', 'uploads'),
})
```

**Access:** `http://localhost:8000/a1b2c3d4-e5f6.jpg`

**Limitations:**
- Not scalable (files on single server)
- No CDN for fast delivery
- Lost on server restart (if using ephemeral storage)

**Production Recommendation:** Use cloud storage (S3, Cloudinary, etc.)

### Build & Deployment

**Backend Build:**
```bash
npm run build        # Compiles TypeScript to JavaScript
npm run start:prod   # Runs compiled code
```

**Frontend Build:**
```bash
npm run build        # Next.js production build
npm run start        # Starts production server
```

**Deployment Recommendations:**

| Component | Recommended Platform | Why |
|-----------|---------------------|-----|
| **Frontend** | Vercel | - Built for Next.js<br>- Automatic deployments<br>- Edge functions<br>- CDN built-in |
| **Backend** | Railway / Render / AWS EC2 | - Easy NestJS deployment<br>- Database support<br>- Auto-scaling |
| **Database** | Railway / Neon / AWS RDS | - Managed PostgreSQL<br>- Automatic backups<br>- Connection pooling |
| **File Storage** | Cloudinary / AWS S3 | - CDN delivery<br>- Image optimization<br>- Scalable |

---

## Implemented Features

### 1. User Authentication & Authorization
**Implementation:**
- JWT-based authentication with bcrypt password hashing
- HttpOnly cookie storage for security
- Middleware-based route protection
- Role-based access (can edit own posts/profile only)

**Endpoints:**
- `POST /auth/sign-in` - User login
- `POST /auth/sign-up` - User registration

**Files:**
- Backend: `api/src/auth/`
- Frontend: `frontend/src/features/auth/`

---

### 2. User Profiles
**Implementation:**
- View user profiles with posts
- Edit profile (username, bio, profile image)
- Upload profile pictures
- Display follower/following counts
- Show user's post count

**Endpoints:**
- `GET /users/me` - Get current user
- `GET /users/:username` - Get user profile
- `PATCH /users` - Update profile

**Files:**
- Backend: `api/src/users/`
- Frontend: `frontend/src/features/users/`

---

### 3. Posts (CRUD)
**Implementation:**
- Create posts with image and text content
- Edit existing posts (own posts only)
- Delete posts (own posts only)
- View all posts in feed (sorted by recent)
- View single post with all comments
- Track post creation/edit timestamps

**Endpoints:**
- `GET /posts` - Get all posts
- `GET /posts/:id` - Get single post
- `POST /posts` - Create post (with image upload)
- `PATCH /posts/:id` - Edit post
- `DELETE /posts/:id` - Delete post

**Files:**
- Backend: `api/src/posts/`
- Frontend: `frontend/src/features/posts/`

---

### 4. Comments
**Implementation:**
- Comment on posts
- View all comments for a post
- Optimistic UI updates (instant feedback)
- Display commenter's profile info

**Endpoints:**
- `GET /comments?postId={id}` - Get comments
- `POST /comments` - Create comment

**Files:**
- Backend: `api/src/comments/`
- Frontend: `frontend/src/features/posts/components/post-item/comments-list/`

---

### 5. Likes
**Implementation:**
- Like/unlike posts
- Optimistic UI updates (instant heart fill/unfill)
- Real-time like count updates
- Display like counts on posts
- Trigger notifications on like

**Endpoints:**
- `POST /likes/:postId` - Like post
- `DELETE /likes/:postId` - Unlike post

**Files:**
- Backend: `api/src/likes/`
- Frontend: `frontend/src/features/posts/components/post-item/add-like-button/`

---

### 6. Follow System
**Implementation:**
- Follow/unfollow users
- View followers list
- View following list
- Display follow counts on profiles
- Trigger notifications on follow

**Endpoints:**
- `POST /follows/:followerId` - Follow user
- `DELETE /follows/:followerId` - Unfollow user

**Files:**
- Backend: `api/src/follows/`
- Frontend: `frontend/src/features/users/`

---

### 7. Notifications
**Implementation:**
- Notifications for:
  - New likes on posts
  - New comments on posts
  - New followers
- Display notification list
- Include sender information
- Link to related post (if applicable)

**Endpoints:**
- `GET /notifications` - Get user notifications

**Files:**
- Backend: `api/src/notifications/`
- Frontend: `frontend/src/features/notifications/`

**Missing:**
- No real-time notifications (no WebSockets)
- No read/unread status
- No notification deletion

---

### 8. Chat/Messaging
**Implementation:**
- Create conversations with users
- Send messages in conversations
- View conversation list
- View message history
- Support for group conversations (many-to-many)
- User selection modal for starting chats

**Endpoints:**
- `GET /conversations` - Get all conversations
- `GET /conversations/:id` - Get conversation
- `POST /conversations/:userId` - Create conversation

**Files:**
- Backend: `api/src/conversations/`
- Frontend: `frontend/src/features/chat/`

**Missing:**
- No real-time messaging (no WebSockets)
- No read receipts
- No typing indicators
- No message deletion/editing

---

### 9. User Search
**Implementation:**
- Search users by username
- Debounced search (300ms delay)
- Exclude current user from results
- Display matching users with profile images

**Endpoints:**
- `POST /users?username={query}` - Search users

**Files:**
- Frontend: `frontend/src/features/users/hooks/use-search-users.ts`

---

### 10. Image Upload
**Implementation:**
- Drag-and-drop file upload (react-dropzone)
- Image preview before upload
- File validation (MIME type, size)
- UUID-based filename generation
- Local disk storage

**Supported Formats:**
- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)

**Max File Size:** 10MB

**Files:**
- Backend: `api/src/config/multer-options.config.ts`
- Frontend: Uses react-dropzone in various components

---

### 11. Dark Mode
**Implementation:**
- Toggle between light and dark themes
- Persistent theme preference
- System preference detection
- Built with next-themes

**Files:**
- Frontend: `frontend/src/components/theme-provider/`

---

### 12. Responsive Design
**Implementation:**
- Mobile-first design with Tailwind CSS
- Breakpoint-based layouts (sm, md, lg, xl)
- Responsive navigation (drawer on mobile)
- Optimized for various screen sizes

---

## Security Considerations

### 1. Authentication & Authorization

**JWT Security:**
```typescript
// Token stored in HttpOnly cookie (can't be accessed by JavaScript)
cookies().set('token', access_token, {
  httpOnly: true,    // XSS protection
  secure: true,      // HTTPS only (production)
  sameSite: 'strict', // CSRF protection
  expires: expirationDate,
});
```

**Benefits:**
- XSS protection (token not in localStorage)
- CSRF protection (SameSite attribute)
- Secure transmission (HTTPS in production)

**Potential Issues:**
- **Long expiration**: 365 days is excessive (should be 15 minutes with refresh token)
- **No refresh tokens**: Can't invalidate sessions
- **No token rotation**: Same token for entire year

### 2. Password Security

**Bcrypt Hashing:**
```typescript
const hashPassword = await bcrypt.hash(password, 10);  // 10 salt rounds
```

**Benefits:**
- Adaptive hashing (slow by design)
- Unique salt per password
- Resistant to rainbow table attacks

**Potential Issues:**
- **No password strength validation**: Should enforce minimum length, complexity
- **No password history**: Users can reuse old passwords

### 3. Input Validation

**DTO Validation:**
```typescript
export class SignUpDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
```

**Global Pipe:**
```typescript
app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
```

**Benefits:**
- Automatic validation
- Strips unknown properties (whitelist)
- Type coercion

**Potential Issues:**
- **No SQL injection protection needed** (Prisma parameterizes queries)
- **No XSS protection needed on backend** (frontend should sanitize)
- **Should add rate limiting** on authentication endpoints

### 4. File Upload Security

**MIME Type Validation:**
```typescript
fileFilter(req, file, done) {
  if (file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
    done(null, true);
  } else {
    done(new HttpException('Unsupported file type', HttpStatus.BAD_REQUEST), false);
  }
}
```

**File Size Limit:**
```typescript
limits: { fileSize: 10485760 }  // 10MB
```

**Filename Sanitization:**
```typescript
filename: (req, file, done) => {
  done(null, `${uuid()}${extname(file.originalname)}`);
}
```

**Benefits:**
- Prevents malicious file types
- Prevents disk space abuse
- Prevents filename collisions

**Potential Issues:**
- **No virus scanning**: Should scan uploaded files
- **No image metadata stripping**: Could leak EXIF data
- **No file content validation**: MIME type can be spoofed (should validate actual content)

### 5. CORS Configuration

**Current Setup:**
```typescript
app.enableCors();  // Allows all origins
```

**Potential Issues:**
- **Allows all origins**: Should restrict to specific domains in production
- **No credentials handling**: Should set `credentials: true` for cookies

**Production Recommendation:**
```typescript
app.enableCors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
});
```

### 6. Database Security

**Prisma Benefits:**
- Parameterized queries (prevents SQL injection)
- Type-safe queries (prevents errors)

**Potential Issues:**
- **No encryption at rest**: PostgreSQL data not encrypted (should enable in production)
- **No connection string encryption**: DATABASE_URL in plaintext (should use secrets management)

### 7. Error Handling

**Current Implementation:**
```typescript
if (!user) throw new NotFoundException('User not found');
```

**Benefits:**
- Consistent error format
- Appropriate HTTP status codes

**Potential Issues:**
- **Information leakage**: "Credentials incorrect" should be same for email/password errors
- **No error logging**: Should log errors for monitoring
- **No rate limiting**: Attackers can brute force credentials

---

## Performance Optimizations

### 1. Next.js Caching

**Strategy:** Tag-based cache invalidation

```typescript
// Cache data with tags
export const getPosts = async () => {
  return await api('posts', { next: { tags: ['posts'] } });
};

// Invalidate specific tags on mutation
revalidateTag('posts');
```

**Benefits:**
- Reduces API calls
- Faster page loads
- Automatic stale-while-revalidate

### 2. Server Components

**Implementation:** Most components are Server Components

```typescript
// Runs on server, no JavaScript sent to client
const HomePage = async () => {
  const { data: posts } = await getPosts();
  return <PostsList posts={posts} />;
};
```

**Benefits:**
- Less JavaScript shipped to client
- Faster initial page load
- Better SEO

### 3. Optimistic UI Updates

**Implementation:** useOptimistic for likes/comments

```typescript
const [optimisticIsLiked, setOptimisticIsLiked] = useOptimistic(isLiked, state => !state);

const likeAction = async () => {
  setOptimisticIsLiked(!optimisticIsLiked);  // Instant UI update
  await addLikeAction(id);                   // Then sync with server
};
```

**Benefits:**
- Instant feedback (feels faster)
- Better perceived performance

### 4. Image Optimization

**Next.js Image Component:**
```typescript
<Image src={post.image} alt="..." width={500} height={500} />
```

**Benefits:**
- Lazy loading
- Automatic format selection (WebP, AVIF)
- Responsive images
- Blur placeholder

**Potential Issues:**
- **No CDN**: Images served from backend (should use Cloudinary/S3 + CDN)

### 5. Database Query Optimization

**Prisma Include:**
```typescript
this.prisma.post.findMany({
  include: {
    user: { select: { username: true, image: true } },
    _count: { select: { likes: true, comments: true } },
  },
});
```

**Benefits:**
- Prevents N+1 queries
- Single database round-trip
- Aggregations done at database level

**Potential Issues:**
- **No pagination**: Returns all posts (should implement cursor-based pagination)
- **No database indexes**: Should add indexes on foreign keys for faster joins

### 6. Code Splitting

**Automatic:** Next.js automatically splits code by route

**Benefits:**
- Smaller initial bundle
- Faster page loads
- Only loads code for current page

### 7. Bundle Size Optimization

**shadcn/ui:**
- Copy-paste components (no runtime dependency)
- Tree-shaking friendly

**Tailwind CSS:**
- Purges unused CSS in production
- Minimal CSS bundle

**Potential Issues:**
- **No lazy loading of heavy components**: Should lazy load modals, dialogs
- **No bundle analysis**: Should analyze bundle size regularly

---

## Trade-offs & Future Improvements

### Current Limitations

| Limitation | Impact | Recommended Fix |
|------------|--------|-----------------|
| **No WebSocket** | Chat is not real-time | Add Socket.io gateway for live messaging |
| **No pagination** | All posts loaded at once | Implement cursor-based pagination |
| **Local file storage** | Not scalable | Migrate to S3/Cloudinary with CDN |
| **Long JWT expiration** | Can't invalidate sessions | Add refresh tokens (15min access + 7day refresh) |
| **No rate limiting** | Vulnerable to brute force | Add express-rate-limit |
| **No duplicate prevention** | Can like/follow multiple times | Add unique constraints on Like/Follow tables |
| **No soft deletes** | Data permanently lost | Add `deletedAt` field for soft deletes |
| **No read status** | Can't track notification/message read status | Add `isRead`/`readAt` fields |
| **No API documentation** | Hard for frontend devs to understand endpoints | Add Swagger/OpenAPI |
| **No tests** | Can't verify functionality | Add Jest unit tests + e2e tests |

### Future Feature Ideas

1. **Real-time Notifications**
   - Add Socket.io for live notification delivery
   - Toast notifications on new likes/comments/follows

2. **Hashtags & Mentions**
   - Parse hashtags from post content
   - Allow @mentions of users
   - Search posts by hashtag

3. **Media Support**
   - Support video uploads
   - Support multiple images per post
   - Image cropping/editing

4. **Advanced Search**
   - Full-text search with PostgreSQL
   - Filter posts by date, popularity, user
   - Search within comments

5. **Analytics Dashboard**
   - Track post views, likes, engagement
   - User statistics (growth, activity)
   - Most popular posts

6. **Email Notifications**
   - Send email on new followers
   - Weekly digest of activity
   - Password reset emails

7. **Two-Factor Authentication**
   - TOTP-based 2FA
   - SMS verification
   - Backup codes

8. **Admin Panel**
   - Moderate content
   - Ban users
   - View analytics

9. **Infinite Scroll**
   - Load more posts as user scrolls
   - Cursor-based pagination
   - Skeleton loading states

10. **Post Scheduling**
    - Schedule posts for future publication
    - Draft posts (save without publishing)

---

## Interview Talking Points

### "Why did you choose this architecture?"

**Answer:**
"I chose a **layered architecture** for the backend because it provides clear separation of concerns - controllers handle HTTP, services contain business logic, and Prisma handles data access. This makes the code easier to test and maintain. For the frontend, I used **feature-sliced design** where each feature (posts, users, chat) is self-contained with its own components, actions, and services. This scales well as the app grows and makes it easy for teams to work on different features independently."

### "Why NestJS instead of Express?"

**Answer:**
"NestJS provides **enterprise-grade architecture** out of the box with built-in dependency injection, decorators for guards and interceptors, and a modular structure. Express would require manually setting up all these patterns. NestJS is TypeScript-first, which gives me better type safety and autocomplete. It's similar to Angular, so the patterns are familiar and well-documented. The structure also makes the codebase more maintainable as it grows."

### "Why Next.js 14 instead of Create React App or Vite?"

**Answer:**
"Next.js 14 provides **more features out of the box** - routing, SSR, API routes (Server Actions), image optimization, and automatic code splitting. With the new App Router and React Server Components, I can fetch data directly on the server without creating separate API routes. This eliminates the need for global state management like Redux since server components automatically refetch when navigated to. It also has built-in caching with tag-based invalidation, which makes the app feel faster."

### "Why Prisma instead of TypeORM?"

**Answer:**
"Prisma has **better developer experience** - it auto-generates TypeScript types from my database schema, so my code is always in sync with the database. The query API is more intuitive than TypeORM's query builder. Prisma's migration system is excellent - it tracks all schema changes in version control. It also prevents N+1 query problems with its include/select API. The type safety is better too - TypeORM uses decorators that can get out of sync with the database."

### "Why PostgreSQL instead of MongoDB?"

**Answer:**
"FreeWay has **complex relationships** - users follow users, posts have many comments and likes, conversations have many participants. PostgreSQL handles these relationships natively with foreign keys and joins. It also provides ACID guarantees, which are important for social data consistency (like ensuring a user can't double-like a post). MongoDB would require manual reference management and doesn't enforce referential integrity."

### "How does authentication work in your app?"

**Answer:**
"I use **JWT authentication with HttpOnly cookies**. When a user logs in, the backend validates credentials with bcrypt, generates a JWT token containing the user ID, email, and username, and sends it back. The frontend stores it in an HttpOnly cookie, which prevents XSS attacks since JavaScript can't access it. On every API request, the frontend automatically includes this cookie, and the backend validates the JWT with Passport's JWT strategy. This loads the user from the database and attaches it to the request, so controllers can access it with my custom `@GetUser()` decorator."

### "How do you handle file uploads?"

**Answer:**
"I use **Multer** for multipart/form-data handling. When a user uploads an image, react-dropzone on the frontend creates a File object and adds it to FormData. The backend uses FileInterceptor to validate MIME type (jpg/jpeg/png/gif) and file size (max 10MB), generates a UUID filename to prevent collisions, and saves the file to local disk. I then construct a full URL like `http://localhost:8000/{uuid}.jpg` and store that in the database, not the filename. The backend serves static files from the uploads directory."

### "How does state management work in your frontend?"

**Answer:**
"I **don't use Redux or Zustand** because Next.js Server Components handle most state. Server Components fetch data directly and cache it with tags. When I mutate data (like creating a post), I use Server Actions which call the API and then invalidate the cache tag with `revalidateTag('posts')`. Next.js automatically refetches the data on the next render. For form state, I use react-hook-form. For optimistic UI updates (like likes), I use React 18's `useOptimistic` hook, which instantly updates the UI and then syncs with the server."

### "What design patterns did you use?"

**Answer:**
"On the **backend**: Dependency Injection (NestJS DI container), Repository Pattern (Prisma as abstraction), Strategy Pattern (Passport authentication strategies), Decorator Pattern (custom @GetUser decorator), Guard Pattern (JwtGuard for auth), and DTO Pattern (class-validator for validation).

On the **frontend**: Server Components Pattern (data fetching on server), Server Actions Pattern (type-safe mutations), Optimistic UI Pattern (useOptimistic for instant feedback), Custom Hooks Pattern (useDebounce, useSearchUsers), and Feature-Sliced Design (feature-based organization)."

### "What are the main trade-offs you made?"

**Answer:**
"The biggest trade-off is **no real-time features** - I didn't implement WebSockets, so chat and notifications aren't live. This simplified the architecture significantly. I also chose **local file storage** instead of S3, which isn't scalable but was faster to implement. JWT tokens have a **365-day expiration** which is too long for production - I should use refresh tokens. There's **no pagination** on posts, which will be a problem at scale. These were conscious decisions to ship the MVP faster, but I know how to improve them."

### "How would you scale this application?"

**Answer:**
1. **Add WebSockets** (Socket.io) for real-time chat and notifications
2. **Implement pagination** (cursor-based for better performance)
3. **Migrate to cloud storage** (S3 + CloudFront CDN for images)
4. **Add database indexes** on foreign keys and frequently queried columns
5. **Implement caching** (Redis for session data and frequently accessed data)
6. **Add rate limiting** to prevent abuse
7. **Use a load balancer** to distribute traffic across multiple backend instances
8. **Implement refresh tokens** with shorter access token expiration
9. **Add monitoring** (Sentry for errors, Datadog for performance)
10. **Optimize database queries** (analyze slow queries, add indexes)"

---

## Conclusion

FreeWay is a **modern full-stack social media application** built with industry-standard technologies and architectural patterns. The backend uses NestJS with a layered architecture, Prisma ORM for type-safe database access, and JWT authentication. The frontend leverages Next.js 14's App Router with Server Components and Server Actions, eliminating the need for traditional global state management.

The system demonstrates strong separation of concerns, type safety across the entire stack, and follows established design patterns like Dependency Injection, Repository Pattern, and Feature-Sliced Design. While there are areas for improvement (real-time features, pagination, cloud storage), the current implementation provides a solid foundation that can scale as the application grows.

---

**Document Version:** 1.0
**Last Updated:** 2025-12-16
**Author:** System Design Analysis
