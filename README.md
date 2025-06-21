# MockingJar - JSON Data Generator

**An AI-Powered Web Application for creating JSON schemas and generating test data.**

1. **[Overview](#overview)**
2. **[Technology Stack](#technology-stack)**
3. **[Project Structure](#project-structure)**
4. **[Core Features](#core-features)**
5. **[Installation & Setup](#installation--setup)**
6. **[Testing](#testing)**
7. **[Contributing](#contributing)**
8. **[MIT License](#mit-license)**
9. **[Support](#support)**

---

## Overview

MockingJar is a modern web application that combines visual schema building with data generation, AI and advanced recovery system. Built with Next.js 15, Material UI, Anthropic Claude, and **[MockingJar Library](https://www.npmjs.com/package/mockingjar-lib)** as the core engine, it enables developers, QA engineers, and data analysts to create complex JSON structures and generate realistic test data through natural language prompts.

**Project Focus**: This application is primarily a frontend project that includes backend API routes for authentication and data generation integration. The core functionality for schema management, data generation, and validation is handled by the **[mockingjar-lib](https://www.npmjs.com/package/mockingjar-lib)** package, while this project provides the visual interface and user experience.

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

### Backend
- **Runtime**: Node.js with Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Core Engine**: **[MockingJar Library](https://www.npmjs.com/package/mockingjar-lib)**

### Development Tools
- **Testing**: Jest with Testing Library for comprehensive test coverage
- **Linting**: ESLint with Next.js config and TypeScript strict mode
- **Formatting**: Prettier for consistent code formatting
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
│   └── schema.prisma                 # Database schema definition
├── src/                              
│   ├── app/                          # Next.js App Router pages
│   │   ├── api/                      # API routes
│   │   └── mockingjar/               # User Interfaces
│   ├── components/                   # React components
│   ├── hooks/                        # Custom React hooks
│   │   └── useSchemas.ts             # Schema management hooks
│   ├── lib/                          # Application-specific utilities
│   │   ├── auth.ts                   # Authentication utilities
│   │   ├── db.ts                     # Database connection utilities
│   │   └── template.ts               # UI template utilities
│   ├── providers/                    # React context providers
│   └── types/                        # TypeScript type definitions
├── package.json                      # Dependencies including mockingjar-lib
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
- **GenerationProgress.tsx**: Real-time progress tracking for data generation

#### `/src/lib/` - Application Utilities
- **auth.ts**: Authentication utilities and session management
- **db.ts**: Database connection and query utilities with Prisma integration
- **template.ts**: UI template utilities and pre-built schema templates

#### `/src/types/` - TypeScript Definitions
- **schema.ts**: Schema field and structure type definitions
- **generation.ts**: Generation process and result types
- **next-auth.d.ts**: Authentication type extensions

#### `/prisma/` - Database Configuration
- **schema.prisma**: Database schema with user and schema tables

---

## Core Features
1. **[Advanced Schema Builder](#advanced-schema-builder)**: Visual interface for creating complex JSON structures
2. **[Data Generation Interface](#data-generation-interface)**: UI for data generation with natural language prompts

### Advanced Schema Builder
The visual schema builder provides a comprehensive interface for creating complex JSON structures:

#### Visual Schema Construction
- **Interactive Tree View**: Hierarchical field structure with expand/collapse controls
- **Real-time Validation**: Immediate feedback on schema structure and constraints
- **Auto-save Functionality**: Automatic schema saving every 5 seconds with visual indicators

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
The web application provides an intuitive interface for data generation:
- **Natural Language Prompts**: Input field for describing desired data characteristics
- **Schema Selection**: Choose from saved schemas for data generation
- **Progress Tracking**: Real-time visual feedback during generation process
- **Result Display**: Formatted JSON output with syntax highlighting
- **Export Options**: Download generated data in various formats

## Installation & Setup

### Prerequisites
- **Node.js**: Version 18.0 or higher
- **PostgreSQL**: Version 12 or higher
- **Anthropic API Key**: Required for AI data generation
- **Git**: For repository cloning

### Environment Variables
Create a `.env.local` file in the project root:
```bash
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/mockingjar"

# Authentication Configuration
NEXTAUTH_SECRET="your-secret-key-minimum-32-characters"
NEXTAUTH_URL="http://localhost:3000"

# AI Integration
ANTHROPIC_API_KEY="your-anthropic-api-key"

# Optional: Development Configuration
NODE_ENV="development"
```

### Installation Steps
```bash
# 1. Clone the repository
git clone https://github.com/firstpersoncode/mockingjar.git
cd mockingjar

# 2. Install dependencies
npm install

# 3. Make sure you have the latest mockingjar-lib package
npm install mockingjar-lib@latest

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# 4. Set up the database
npx prisma migrate dev --name init
npx prisma generate

# 5. Seed the database (optional)
npx prisma db seed

# 6. Run the development server
npm run dev
```

### Available Scripts
```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm start           # Start production server

# Database
npm run db:migrate  # Run database migrations
npm run db:reset    # Reset database
npm run db:studio   # Open Prisma Studio

# Testing
npm test            # Run test suite
npm run test:watch  # Run tests in watch mode
npm run test:coverage # Generate coverage report

# Code Quality
npm run lint        # Run ESLint
npm run lint:fix    # Fix ESLint issues
npm run type-check  # Run TypeScript checks
```

### Docker Setup (Optional)
```bash
# Using Docker Compose for development
docker-compose up -d

# Or build custom image
docker build -t mockingjar .
docker run -p 3000:3000 mockingjar
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
- **Component Tests**: Individual React component testing
- **Integration Tests**: End-to-end workflow validation
- **API Tests**: REST endpoint testing and error handling
- **Authentication Tests**: Session management and security
- **Accessibility Tests**: Screen reader and keyboard navigation
- **Cross-browser Testing**: Chrome, Firefox, Safari, Edge compatibility

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
- Implement comprehensive test coverage
- Follow conventional commit message format
- Maintain code documentation and comments

#### Code Quality Standards
- ESLint configuration compliance
- TypeScript type safety
- React best practices
- Performance optimization
- Security considerations

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
