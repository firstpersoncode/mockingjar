# MockingJar - AI-Powered JSON Data Generator

**An intelligent web application for creating complex JSON schemas and generating realistic test data using AI.**

---

## 🚀 Overview

MockingJar is a modern web application that combines visual schema building with AI-powered data generation. Built with Next.js 15, Material UI, and Anthropic Claude AI, it enables developers, QA engineers, and data analysts to create complex JSON structures and generate realistic test data through natural language prompts.

---

## 🛠️ Technology Stack

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
- **Testing**: Jest with Testing Library
- **Linting**: ESLint with Next.js config
- **Formatting**: TypeScript strict mode
- **Package Manager**: npm

---

## 🏗️ Project Structure

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

#### `/src/lib/` - Core Business Logic
- **generator.ts**: Hybrid AI generation engine with error recovery
- **validation.ts**: Comprehensive JSON validation system
- **schema.ts**: Schema manipulation and conversion utilities
- **template.ts**: Pre-built schema templates

#### `/src/types/` - TypeScript Definitions
- **schema.ts**: Schema field and structure type definitions
- **generation.ts**: Generation process and result types
- **next-auth.d.ts**: Authentication type extensions

#### `/prisma/` - Database Configuration
- **schema.prisma**: Database schema with user and schema tables

---

## �📋 Core Features

### 1. Schema Builder
The visual schema builder allows users to create complex JSON structures through an intuitive interface:

- **Visual Schema Builder**: Interface for complex JSON structure creation
- **AI Data Generation**: Intelligent data population using Anthropic Claude Sonnet 4
- **Hybrid Generation Strategy**: Advanced error recovery with field-level regeneration
- **Real-time Validation**: Comprehensive JSON structure validation
- **Nested Structure Support**: Full support for objects, arrays, and deep nesting
- **Template System**: Pre-built schema templates for common use cases
- **Export Capabilities**: Download generated data in JSON format

#### Schema Structure
```typescript
interface SchemaField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'boolean' | 'date' | 'email' | 'url' | 'array' | 'object';
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

### 2. AI Data Generation
Advanced hybrid generation strategy using Anthropic Claude:

#### Hybrid Generation Process
- **Primary Generation**: Attempt to generate complete JSON structure
- **Validation**: Comprehensive schema validation with detailed error reporting
- **Error Recovery**: Surgical regeneration of invalid fields only
- **Context Preservation**: Maintain valid data while fixing errors
- **Iterative Improvement**: Multiple attempts with progressive refinement

#### Generation Features
- **Natural Language Prompts**: Generate contextually relevant data
- **Schema Compliance**: 100% adherence to defined structure
- **Error Handling**: Intelligent recovery from validation failures
- **Progress Tracking**: Real-time generation progress feedback
- **Metadata**: Detailed generation statistics and field tracking

### 3. Validation System
Comprehensive JSON validation engine:

#### Validation Capabilities
- **Type Validation**: Strict type checking for all field types
- **Constraint Validation**: Length, range, pattern, and enum validation
- **Structure Validation**: Nested object and array structure verification
- **Missing Field Detection**: Identification of required missing fields
- **Unidentified Field Detection**: Detection of extra fields not in schema
- **Array Validation**: Item-level validation with parent marking for errors

#### Validation Error Types
```typescript
interface ValidationError {
  parent: string | null;
  affectedField: string;
  reason: string;
  structure: SchemaField | null;
}
```

### 4. User Interface
Modern Material UI design with responsive layout:

#### Key Components
- **Schema Tree View**: Hierarchical field structure with expand/collapse
- **Field Editor**: Comprehensive field property configuration
- **JSON Preview**: Live syntax-highlighted preview
- **Generation Interface**: Prompt input with progress tracking
- **Data Viewer**: Formatted display of generated data
- **Export Controls**: Download and copy functionality

#### Responsive Design
- Mobile-first approach with Material UI breakpoints
- Collapsible navigation and adaptive layouts
- Touch-friendly controls and optimized spacing

### 5. Generation Workflow

#### Hybrid Strategy Details
1. **Initial Generation**
   - Single API call to generate complete JSON structure
   - Uses comprehensive prompt with full schema context
   - Includes user's natural language requirements

2. **Validation Phase**
   - Comprehensive validation against schema rules
   - Type checking, constraint validation, structure verification
   - Identification of missing, malformed, and unidentified fields

3. **Error Recovery**
   - Surgical partial schema generation for invalid fields only
   - Context preservation from valid portions of data
   - Field-level regeneration with targeted prompts

4. **Iterative Refinement**
   - Multiple recovery attempts up to configured maximum
   - Progressive improvement with each iteration
   - Fallback strategies for persistent errors

### Generation Result
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
---

## 🔧 Installation & Setup

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- Anthropic API key

### Environment Variables
```bash
# Database
DATABASE_URL="postgresql://..."

# Authentication
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# AI Integration
ANTHROPIC_API_KEY="your-anthropic-api-key"
```

### Installation Steps
```bash
# Clone repository
git clone git@github.com:firstpersoncode/mockingjar.git
cd mockingjar

# Install dependencies
npm install

# Set up database
npx prisma migrate dev

# Run development server
npm run dev
```

---

## 🧪 Testing

### Test Coverage
Comprehensive test suite covering:
- **Schema Tests**: Schema builder functionalities
- **Validation Tests**: Schema validation and error handling
- **Generation Tests**: AI data generation and hybrid strategies

### Key Test Files
- `src/lib/__tests__/validation.test.ts` - Validation system tests
- `src/lib/__tests__/generator.test.ts` - Generation engine tests
- `src/lib/__tests__/schema.test.ts` - Schema utilities tests

---

## 🤝 Contributing

### Development Guidelines
- Follow TypeScript strict mode requirements
- Use Material UI design system components
- Implement comprehensive test coverage
- Follow conventional commit message format
- Maintain code documentation and comments

### Code Quality Standards
- ESLint configuration compliance
- TypeScript type safety
- React best practices
- Performance optimization
- Security considerations

---

## 📄 License

This project is proprietary software. All rights reserved.

---

## 📞 Support

For technical support, feature requests, or bug reports, please contact the development team or create an issue in the project repository.

---

*MockingJar - Transforming JSON schema creation and data generation through intelligent AI-powered tools.*
