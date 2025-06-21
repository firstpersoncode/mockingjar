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

MockingJar is a modern web application that combines visual schema building with data generation, AI and advanced recovery system. Built with Next.js 15, Material UI, and Anthropic Claude, it enables developers, QA engineers, and data analysts to create complex JSON structures and generate realistic test data through natural language prompts.

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
- **AI Integration**: Anthropic Claude SDK

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
│   ├── lib/                          # Core business logic
│   │   └── __tests__/                # Unit tests
│   ├── providers/                    # React context providers
│   └── types/                        # TypeScript type definitions
└──  README.md                        # Project documentation
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

#### `/src/lib/` - Core Business Logic
- **generator.ts**: Data generation engine with error recovery and surgical fix mechanisms
- **validation.ts**: Comprehensive JSON validation system with detailed error reporting
- **schema.ts**: Schema manipulation and conversion utilities with field management
- **template.ts**: Pre-built schema templates for common use cases and quick starts
- **anthropic.ts**: AI integration layer with Anthropic Claude API
- **auth.ts**: Authentication utilities and session management
- **db.ts**: Database connection and query utilities with Prisma integration

#### Core Library Features
- **Field Management**: Add, update, and remove fields with deep nesting support
- **Schema Validation**: Comprehensive type checking and constraint validation  
- **Error Recovery**: Surgical regeneration of failed fields during generation
- **Template System**: Quick-start templates for common schema patterns
- **Database Abstraction**: Clean database operations with type safety

#### `/src/types/` - TypeScript Definitions
- **schema.ts**: Schema field and structure type definitions
- **generation.ts**: Generation process and result types
- **next-auth.d.ts**: Authentication type extensions

#### `/prisma/` - Database Configuration
- **schema.prisma**: Database schema with user and schema tables

---

## Core Features
1. **[Advanced Schema Builder](#advanced-schema-builder)**: Visual interface for creating complex JSON structures
2. **[Data Generation](#data-generation)**: Surgical error recovery system that preserves valid data
3. **[Validation System](#validation-system)**: Comprehensive JSON validation engine
4. **[User Interface](#user-interface)**: Complete application interface and navigation system

### Advanced Schema Builder
The visual schema builder provides a comprehensive interface for creating complex JSON structures:

#### Visual Schema Construction
- **Interactive Tree View**: Hierarchical field structure with expand/collapse controls
- **Drag-and-Drop Organization**: Intuitive field reordering and structure management *(future feature)*
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
- Select "schema" as a field type in any dropdown menu across the interface
- Opens dedicated schema selection dialog with visual schema browser
- Automatically populates field with selected schema's complete structure

**Schema Selection Dialog:**
- **Visual Browser**: Card-based interface matching main schema list design
- **Filtering**: Current schema excluded to prevent circular references
- **Field Inheritance**: Selected schema's fields become children of the current field
- **Type Conversion**: Target field automatically converts to object type to contain schema structure

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

#### Schema Structure
```typescript
interface SchemaField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'boolean' | 'date' | 'email' | 'url' | 'array' | 'object' | 'schema';
  logic?: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: string;
    enum?: string[];
    minItems?: number;
    maxItems?: number;
  };
  children?: SchemaField[]; // For object type
  arrayItemType?: SchemaField; // For array type
  description?: string;
}
```

### Data Generation
Data generation with surgical error recovery:

#### Generation Process
- **Initial Generation**: Generate complete JSON structure based on schema
- **Validation**: Comprehensive schema validation with detailed error reporting
- **Surgical Error Recovery**: Fix only invalid fields while preserving all valid data
- **Context Preservation**: Keep correct data intact during error correction
- **Targeted Regeneration**: Inform the system which fields are correct and which need fixing

#### Generation Features
- **Natural Language Prompts**: Generate contextually relevant data
- **Schema Compliance**: Adherence to defined structure and constraints
- **Selective Error Handling**: Fix specific problems without affecting working parts
- **Progress Tracking**: Real-time generation progress feedback
- **Metadata**: Detailed generation statistics and field tracking

#### Surgical Fix Strategy Details
1. **Initial Generation**: Generate complete JSON structure with comprehensive prompt
2. **Validation Phase**: Comprehensive validation against schema rules and constraints
3. **Surgical Error Recovery**: Preserve valid data and regenerate only problematic fields
4. **Targeted Regeneration**: Focus correction efforts on specific invalid fields with context

#### Generation Result
```typescript
interface GenerationResult {
  success: boolean;
  data?: Record<string, unknown>;
  errors?: string[];
  progress?: GenerationProgress;
  metadata?: {
    totalFields: number;
    validFields: number;
    regeneratedFields: string[];
    attempts: number;
    generationTime: number;
  };
}
```

### Validation System
Comprehensive JSON validation engine with:
- **Type & Constraint Validation**: Strict checking for all field types, lengths, ranges, patterns
- **Structure Validation**: Nested object and array structure verification  
- **Field Detection**: Identification of missing required fields and extra unidentified fields
- **Array Validation**: Item-level validation with error tracking

```typescript
interface ValidationError {
  parent: string | null;
  affectedField: string;
  reason: string;
  structure: SchemaField | null;
}
```

### User Interface

#### Application Architecture
MockingJar is built as a **Single Page Application (SPA)** using Next.js 15 App Router with protected routes requiring authentication. The interface follows Material UI design principles with responsive layouts optimized for both desktop and mobile experiences.

#### Authentication Flow
- **Entry Point**: Landing page (`/`) with application overview
- **Authentication Check**: Automatic redirect to sign-in if not authenticated
- **Session Management**: Persistent authentication using NextAuth.js
- **Protected Routes**: All main application features require valid session

#### Main Application Pages

##### 1. Landing Page (`/`)
**Purpose**: Application introduction and entry point
- **Features**:
  - Next.js welcome interface with project branding
  - Direct link to MockingJar application (`/mockingjar`)

##### 2. Authentication Redirect (`/mockingjar`)
**Purpose**: Smart routing based on authentication status
- **Authenticated Users**: Automatically redirected to Schema Library
- **Unauthenticated Users**: Automatically redirected to Sign In page
- **Loading State**: Displays loading spinner during session check
- **No Direct Content**: Acts as intelligent routing middleware

##### 3. Sign In Page (`/mockingjar/auth/signin`)
**Purpose**: User authentication and account access
- **Features**:
  - **Form Validation**: Email and password validation using Zod schema
  - **Error Handling**: Clear error messages for authentication failures
  - **Loading States**: Visual feedback during authentication process
  - **Responsive Design**: Optimized for mobile and desktop
  - **Security**: Secure credential handling with NextAuth.js
- **Layout**: Centered card design with Material UI components
- **Validation Rules**:
  - Valid email address format required
  - Password field mandatory
  - Real-time form validation feedback

##### 4. Schema Library (`/mockingjar/schema`)
**Purpose**: Manage and organize saved JSON schemas
- **Features**:
  - **Schema List View**: Responsive grid display of all saved schemas
  - **Create New Schema**: Quick access to schema builder with template options
  - **Schema Management**: Edit, delete, and duplicate existing schemas
  - **Schema Templates**: Access to pre-built schema templates for common use cases
  - **Schema Cards**: Visual cards showing schema metadata and field counts
  - **Schema Actions**: Context menus for schema operations
  - **Responsive Design**: Optimal viewing on desktop, tablet, and mobile
- **Schema Card Information**:
  - Schema name and description
  - Field count indicator
  - Creation date
  - Last modified date
  - Quick edit access
- **Layout**: Sidebar navigation + main content area
- **Components**:
  - `SchemaList` - Displays schema cards with metadata and actions
  - `SideBar` - Navigation between application sections
  - `AppBar` - Page title and contextual actions
  - Template selection modal for new schema creation

##### 5. Schema Builder (`/mockingjar/schema/[id]` or `/mockingjar/schema/new`)
**Purpose**: Visual JSON schema creation and editing interface
- **Features**:
  - **Visual Schema Tree**: Hierarchical field structure with expand/collapse
  - **Field Type Support**: Text, number, boolean, date, email, URL, array, object, schema
  - **Schema References**: Select and embed existing schemas as field types
  - **Schema Selection Dialog**: Visual schema browser with filtering (excludes current schema)
  - **Constraint Configuration**: Required fields, length limits, patterns, enums
  - **Nested Structures**: Full support for objects and arrays with unlimited depth
  - **Real-time Preview**: Live JSON structure preview
  - **Validation Feedback**: Immediate validation of schema structure
  - **Auto-save**: Automatic saving of schema changes every 5 seconds
  - **Export Options**: Download schema definition
  - **Field Management**: Add, edit, delete, and reorder fields
  - **Collapsible Tree View**: Organize complex schemas with expand/collapse controls
- **Schema Reference Features**:
  - **Smart Selection**: Browse existing schemas in a card-based dialog
  - **Circular Reference Prevention**: Current schema excluded from selection
  - **Field Inheritance**: Selected schema fields automatically become children
  - **Visual Consistency**: Selection dialog matches main schema list design
  - **No Action Buttons**: Clean, selection-focused interface in dialog
- **Dynamic Routing**:
  - `/schema/new` - Create new schema from scratch
  - `/schema/[id]` - Edit existing schema by ID
- **Components**:
  - `SchemaBuilder` - Main schema editing interface
  - Field property panels for each data type
  - Schema selection dialog with card-based layout
  - Field tree view with inline editing
  - Context menus for field operations

##### 6. Data Generator (`/mockingjar/generator`)
**Purpose**: Realistic data generation with natural language prompts
- **Features**:
  - **Schema Selection**: Choose from saved schemas for data generation
  - **Natural Language Prompts**: Describe desired data characteristics
  - **Surgical Error Recovery**: Data generation with selective error correction
  - **Progress Tracking**: Real-time generation progress feedback
  - **Result Preview**: Formatted JSON data display with syntax highlighting
  - **Export Controls**: Download generated data in multiple formats
  - **Generation History**: Track previous generation attempts
  - **Metadata Display**: Generation statistics and performance metrics
- **Generation Process**:
  - Schema validation before generation
  - AI prompt processing with Anthropic Claude
  - Error detection and surgical regeneration
  - Final validation and result presentation
- **Components**:
  - `DataGenerator` - Main generation interface
  - `GenerationProgress` - Real-time progress indicators
  - Schema selector dropdown
  - Prompt input with suggestion system

#### Navigation System

##### Sidebar Navigation
**Persistent Navigation**: Available on all main application pages
- **Schema Builder** (`/mockingjar/schema`) - Schema library and management
- **Data Generator** (`/mockingjar/generator`) - Data generation interface with natural language prompts
- **History** - Generation history and previous results *(future feature)*
- **Settings** - User preferences and configuration *(future feature)*

##### Navigation Flow
```
Landing (/) 
    ↓
Authentication Check (/mockingjar)
    ↓
Sign In (/auth/signin) → Schema Library (/schema)
                              ↓
                        ┌─────────────────┐
                        ↓                 ↓
            Schema Builder (/schema/[id])  Data Generator (/generator)
                        ↓                 ↓
                    Edit Schema      Generate Data
                        ↓                 ↓
                    Save & Export    Export Results
```

#### Responsive Design
- **Desktop Experience** (1200px+)
- **Tablet Experience** (600px - 1199px)
- **Mobile Experience** (<600px)

#### Key UI Components

##### Reusable Components
- **AppBar**: Page titles, breadcrumbs, and contextual actions
- **SideBar**: Main navigation with active state indicators
- **SchemaBuilder**: Complex tree-view interface for schema editing with schema reference support
- **SchemaList**: Grid-based schema management interface with responsive cards
- **DataGenerator**: AI generation interface with progress tracking
- **GenerationProgress**: Real-time feedback during data generation
- **Schema Selection Dialog**: Card-based schema browser for schema references

##### Design System
- **Material UI v7**: Consistent component library
- **Custom Theme**: Brand-specific color palette and typography
- **Responsive Grid Layout**: Adaptive layouts for all screen sizes
- **Card-based Design**: Consistent card interfaces across schema lists and dialogs
- **Interactive Components**: Hover effects, animations, and visual feedback
- **Dark Mode Support**: System preference detection with manual toggle *(future feature)*
- **Accessibility**: WCAG compliant focus management and screen reader support
- **Performance**: Optimized rendering with React best practices


---

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
Comprehensive test suite covering:
- **Schema Tests**: Schema builder functionalities and field management
- **Validation Tests**: Schema validation and error handling systems
- **Generation Tests**: Data generation and surgical error recovery
- **Schema Reference Tests**: Schema composition and circular reference prevention
- **UI Component Tests**: Interactive components and user workflows

### Key Test Files
- `src/lib/__tests__/validation.test.ts` - Validation system tests (24 test cases)
- `src/lib/__tests__/generator.test.ts` - Generation engine tests
- `src/lib/__tests__/schema.test.ts` - Schema utilities and manipulation tests

### Testing Strategy
- **Unit Tests**: Individual function and component testing
- **Integration Tests**: End-to-end workflow validation
- **Error Handling**: Edge case and error condition testing
- **Performance Tests**: Generation speed and memory usage
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
