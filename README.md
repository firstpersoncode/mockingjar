# MockingJar - JSON Data Generator

**An AI-Powered Web Application for creating JSON schemas and generating test data.**

1. **[Overview](#overview)**
2. **[Technology Stack](#technology-stack)**
3. **[Project Structure](#project-structure)**
4. **[Core Features](#core-features)**
5. **[Security Implementation](#security-implementation)**
6. **[Installation & Setup](#installation--setup)**
7. **[Testing](#testing)**
8. **[Contributing](#contributing)**
9. **[MIT License](#mit-license)**
10. **[Support](#support)**

---

## Overview

MockingJar is a modern web application that combines visual schema building with AI-powered data generation. Built with Next.js 15, Material UI, and **[MockingJar Library](https://www.npmjs.com/package/mockingjar-lib)** as the core engine, it enables developers, QA engineers, and data analysts to create complex JSON structures and generate realistic test data through natural language prompts.

**Project Focus**: This application provides a complete web interface for JSON schema creation and data generation. The core functionality for schema management, data generation, and validation is handled by the **[mockingjar-lib](https://www.npmjs.com/package/mockingjar-lib)** package, while this project provides the visual interface, user authentication, and data persistence.

---

## Technology Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **UI Library**: Material UI (MUI) v7
- **State Management**: Zustand
- **API State**: TanStack Query (React Query v5)
- **Form Handling**: React Hook Form + Zod validation
- **Icons**: Material UI Icons
- **Code Editor**: Monaco Editor (VS Code editor in browser)

### Backend
- **Runtime**: Node.js with Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with Google OAuth
- **Core Engine**: **[MockingJar Library](https://www.npmjs.com/package/mockingjar-lib)**
- **AI Integration**: Anthropic Claude (via mockingjar-lib)

### Development Tools
- **Testing**: Jest with Testing Library for comprehensive test coverage
- **Linting**: ESLint with Next.js config and TypeScript strict mode
- **Type Checking**: TypeScript strict mode for maximum type safety
- **Package Manager**: npm with lockfile for dependency consistency
- **Database Management**: Prisma CLI for migrations and schema management
- **Development Server**: Next.js fast refresh for rapid development iteration

### Architecture Highlights
- **Type Safety**: Full TypeScript implementation with strict mode
- **Component Architecture**: Reusable, composable React components
- **API Design**: RESTful endpoints with proper error handling
- **Performance**: Optimized bundle size and lazy loading
- **Security**: Secure authentication and data validation

---

## Project Structure

```
mockbird/
├── prisma/
│   └── migrations/                   # Database migration files
├── src/                              
│   ├── app/                          # Next.js App Router pages
│   │   ├── api/                      # API routes
│   │   └── mockingjar/               # Main application interface
│   ├── components/                   # React components
│   ├── hooks/                        # Custom React hooks
│   ├── lib/                          # Application utilities
│   ├── providers/                    # React context providers
│   └── types/                        # TypeScript type definitions
└── README.md                         # Project documentation
```

### Key Directories

#### `/src/app/` - Next.js App Router
- **Pages**: Route-based page components using App Router
- **API Routes**: Server-side API endpoints for authentication, schemas, and generation
- **Layouts**: Shared layout components for different sections

#### `/src/components/` - React Components
**Main Application Components:**
- **SchemaBuilder.tsx**: Visual schema editor with tree view and field management
- **SchemaList.tsx**: Schema library interface with grid layout and management actions  
- **DataGenerator.tsx**: Data generation interface with natural language prompts
- **SideBar.tsx**: Navigation sidebar with route-based active states
- **AppBar.tsx**: Application header with page context and actions
- **GitHubButton.tsx**: Component for linking to the GitHub repository
- **NPMButton.tsx**: Component for linking to the NPM package

#### `/src/lib/` - Application Utilities
- **auth.ts**: NextAuth.js configuration with Google OAuth provider
- **db.ts**: Prisma database client initialization and connection utilities
- **template.ts**: UI template utilities and pre-built schema templates

#### `/src/types/` - TypeScript Definitions
- **schema.ts**: Schema field and structure type definitions
- **next-auth.d.ts**: NextAuth.js type extensions for user sessions

#### `/prisma/` - Database Configuration
- **schema.prisma**: Database schema with User, Schema, and NextAuth tables
- **migrations/**: Database migration history and files

---

## Core Features
1. **[Advanced Schema Builder](#advanced-schema-builder)**: Visual interface for creating complex JSON structures
2. **[Data Generation Interface](#data-generation-interface)**: AI-powered data generation with natural language prompts
3. **[User Authentication](#user-authentication)**: Secure Google OAuth authentication
4. **[Schema Management](#schema-management)**: Save, edit, and organize your schemas

### Advanced Schema Builder
The visual schema builder provides a comprehensive interface for creating complex JSON structures:

#### Visual Schema Construction
- **Interactive Tree View**: Hierarchical field structure with expand/collapse controls
- **Real-time Validation**: Immediate feedback on schema structure and constraints
- **Auto-save Functionality**: Automatic schema saving with visual indicators

#### Comprehensive Field Type System
Support for all essential data types with full constraint configuration:
- **text**: String values with optional length constraints and patterns
- **number**: Numeric values with min/max range validation
- **boolean**: True/false values
- **date**: Date/time values in various formats
- **email**: Email address validation
- **url**: URL format validation
- **array**: Arrays with configurable item types and size constraints
- **object**: Nested objects with child field definitions
- **schema**: References to existing saved schemas for complex reuse and composition

#### Schema Reference System
A powerful feature that enables schema composition and reuse:

**Schema Field Type:**
- Select "schema" as a field type in any dropdown menu
- Opens dedicated schema selection dialog with visual schema browser
- Automatically populates field with selected schema's complete structure

**Schema Selection Dialog:**
- **Visual Browser**: Card-based interface matching main schema list design
- **Filtering**: Current schema excluded to prevent circular references
- **Field Inheritance**: Selected schema's fields become children of the current field

**Schema Composition Benefits:**
- **Maximum Reusability**: Eliminate duplication of common schema patterns
- **Enhanced Maintainability**: Centralized schema definitions for easier updates
- **Structural Consistency**: Standardized patterns across related schemas
- **Modular Architecture**: Build complex schemas from manageable, reusable components

**Real-World Use Cases:**
- **User Profile Schema**: Referenced across authentication, settings, and social features
- **Address Schema**: Reused in shipping, billing, and contact forms
- **Product Schema**: Referenced in catalogs, orders, and inventory systems
- **Metadata Schema**: Common fields shared across multiple entity types

**Example Schema Composition Workflow:**
```
Base Schema: "Address"
├── street (text)
├── city (text)
├── state (text)
└── zipCode (text)

New Schema: "Customer"
├── name (text)
├── email (email)
├── shippingAddress (schema) → Select "Address" → Inherits all Address fields
└── billingAddress (schema) → Select "Address" → Inherits all Address fields
```

### Data Generation Interface
The web application provides an intuitive interface for AI-powered data generation:
- **Natural Language Prompts**: Input field for describing desired data characteristics in plain English
- **Schema Selection**: Choose from your saved schemas for data generation
- **Intelligent Generation**: Powered by the mockingjar-lib with AI fallback capabilities
- **Result Display**: Formatted JSON output with Monaco Editor syntax highlighting
- **Copy to Clipboard**: Easy copying of generated data for immediate use
- **Error Handling**: Clear feedback when generation fails with helpful error messages

### User Authentication
Secure user authentication system:
- **Google OAuth**: Sign in with your Google account
- **Session Management**: Persistent sessions with automatic renewal
- **User Profiles**: Access your saved schemas across sessions
- **Security**: Secure token handling with NextAuth.js

### Schema Management
Comprehensive schema organization and management:
- **Personal Library**: All your schemas saved and organized
- **CRUD Operations**: Create, read, update, and delete schemas
- **Search and Filter**: Find schemas quickly in your library
- **Metadata Tracking**: Creation and modification timestamps
- **Data Persistence**: PostgreSQL database with Prisma ORM

---

## Security Implementation

MockingJar implements a comprehensive, multi-layered security architecture that protects user data and prevents unauthorized access. The security system combines session-based authentication with CSRF protection to ensure all API operations are secure.

### 🔒 Security Architecture

#### Multi-Layer Protection System
1. **Edge Middleware**: First line of defense at the request level
2. **Session Authentication**: Database-backed user session validation
3. **CSRF Protection**: Token-based protection against cross-site request forgery
4. **API Route Guards**: Granular protection for each endpoint

#### Core Security Components

**Authentication Layer:**
- **NextAuth.js Integration**: Industry-standard authentication with Google OAuth
- **Database Sessions**: Persistent sessions stored in PostgreSQL for security and scalability
- **JWT Tokens**: Secure token handling with automatic refresh
- **Session Validation**: Real-time session verification on every protected request

**CSRF Protection:**
- **Token Generation**: Cryptographically secure CSRF tokens for each session
- **Double Submit Pattern**: Tokens validated in both cookies and headers
- **Automatic Integration**: Frontend utilities handle token management transparently
- **State-Change Protection**: CSRF validation on POST, PUT, DELETE, and PATCH operations

**Middleware Protection:**
- **Edge-Level Security**: Authentication checks before requests reach application logic
- **Automatic Redirects**: Seamless user experience with callback URL preservation
- **Route-Based Logic**: Different protection levels for API routes vs. application pages
- **Performance Optimized**: Minimal overhead with intelligent request filtering

#### Page Protection
- **Protected Routes**: All `/mockingjar/*` pages require authentication
- **Automatic Redirects**: Unauthenticated users redirected to signin with callback URLs
- **Session Persistence**: Login state maintained across browser sessions

### 🔧 Security Configuration

#### Environment Variables
```bash
# Authentication Security
NEXTAUTH_SECRET="your-secure-nextauth-secret-key"
CSRF_SECRET="your-secure-csrf-secret-key"

# Production Security
NEXTAUTH_URL="https://yourdomain.com"
NODE_ENV="production"
```

#### Security Best Practices Implemented
- **HTTPS Enforcement**: Secure cookies in production environments
- **SameSite Cookies**: Protection against cross-site request forgery
- **HTTP-Only Cookies**: Prevention of XSS token theft
- **Secure Token Generation**: Cryptographically random secrets
- **Session Isolation**: User data access restricted to authenticated user only
- **Input Validation**: Comprehensive request validation and sanitization

For detailed security implementation information, see [SECURITY.md](./SECURITY.md).

---

## Installation & Setup

### Prerequisites
- **Node.js**: Version 18.0 or higher
- **PostgreSQL**: Version 12 or higher
- **Google OAuth**: Google Cloud Console project for authentication
- **Git**: For repository cloning

### Environment Variables
Create a `.env.local` file in the project root:
```bash
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/mockingjar"

# Authentication Configuration
NEXTAUTH_SECRET="your-secret-key-minimum-32-characters"
NEXTAUTH_URL="http://localhost:3000"

# Security Configuration (Required)
CSRF_SECRET="your-secure-csrf-secret-key"

# Google OAuth Configuration (Required)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# AI Integration (Required for data generation)
ANTHROPIC_API_KEY="your-anthropic-api-key"

# Optional: Development Configuration
NODE_ENV="development"
```

### Google OAuth Setup
To enable Google authentication, you need to set up OAuth credentials:

1. **Go to Google Cloud Console**: Visit [console.cloud.google.com](https://console.cloud.google.com)
2. **Create/Select Project**: Create a new project or select an existing one
3. **Enable Google+ API**: Navigate to APIs & Services > Library, search for "Google+ API" and enable it
4. **Create OAuth Credentials**:
   - Go to APIs & Services > Credentials
   - Click "Create Credentials" > "OAuth client ID"
   - Select "Web application"
   - Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
   - For production: `https://yourdomain.com/api/auth/callback/google`
5. **Copy Credentials**: Copy the Client ID and Client Secret to your `.env` file
```

### Installation Steps
```bash
# 1. Clone the repository
git clone https://github.com/firstpersoncode/mockingjar.git
cd mockingjar

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# 4. Set up the database
npx prisma migrate dev --name init
npx prisma generate

# 5. Run the development server
npm run dev
```

The application will be available at `http://localhost:3000`

### Available Scripts
```bash
# Development
npm run dev          # Start development server with Prisma generation
npm run build        # Build for production with Prisma generation
npm start           # Start production server with Prisma generation

# Testing
npm test            # Run test suite
npm run test:watch  # Run tests in watch mode
npm run test:coverage # Generate coverage report

# Code Quality
npm run lint        # Run ESLint
```

---

## Testing

### Test Coverage
Test suite covers the web application components and integration:
- **UI Component Tests**: React components and user workflows
- **Integration Tests**: End-to-end workflow validation
- **API Tests**: Backend API endpoints and database operations
- **Authentication Tests**: User authentication and session management

### Testing Strategy
- **Component Tests**: Individual React component testing with React Testing Library
- **Integration Tests**: End-to-end workflow validation
- **API Tests**: REST endpoint testing and error handling
- **Authentication Tests**: Session management and security testing

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode for development
npm run test:watch

# Generate coverage report
npm run test:coverage
```

---

## Contributing

**MockingJar thrives on community collaboration!** We believe great software comes from diverse perspectives and shared expertise.

### 🌟 Ways to Contribute

**Everyone is welcome, regardless of experience level:**

- 🐛 **Report Bugs** - Found something broken? Help us fix it!
- 💡 **Suggest Features** - Share your ideas for improvements
- 📝 **Improve Documentation** - Help others understand the project better
- 🔧 **Submit Code** - Fix bugs, add features, or optimize performance
- 🧪 **Write Tests** - Help us maintain reliability and quality
- 🎨 **Design & UX** - Enhance the user interface and experience
- 🌍 **Spread the Word** - Share MockingJar with your network

### 🚀 Getting Started

1. **Fork the repository** and clone it locally
2. **Read our code** - explore the codebase to understand the structure
3. **Check Issues** - look for "good first issue" labels
4. **Join Discussions** - participate in feature planning and design decisions
5. **Submit PRs** - start small and grow your contributions over time

#### Development Guidelines
- Follow TypeScript strict mode requirements
- Use Material UI design system components
- Implement comprehensive test coverage for new features
- Follow conventional commit message format
- Maintain code documentation and comments
- Ensure responsive design principles

#### Code Quality Standards
- ESLint configuration compliance
- TypeScript type safety with strict mode
- React best practices and hooks patterns
- Performance optimization considerations
- Security best practices for authentication and data handling

### 💬 Community Guidelines

- **Be respectful** and inclusive in all interactions
- **Ask questions** - no question is too basic
- **Share knowledge** - help others learn and grow
- **Stay curious** - explore, experiment, and innovate

**Ready to contribute?** Open an issue, submit a pull request, or simply star the project to show your support!

*Together, we're building the future of JSON data generation.*

---

## MIT License

Copyright (c) 2025 MockingJar (Mockbird)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---

## Support

For technical support, feature requests, or bug reports, please contact the development team or create an issue in the project repository.

---

*MockingJar - Transforming JSON schema creation and data generation.*
