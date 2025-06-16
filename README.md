# MockingJar JSON Data Generator MVP
## Complete Project Documentation

**Version:** 1.0  
**Date:** June 15, 2025  
**Project Type:** MVP Development  

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Project Overview](#project-overview)
3. [Technical Architecture](#technical-architecture)
4. [User Stories & Requirements](#user-stories--requirements)
5. [System Design](#system-design)
6. [UI/UX Design Specifications](#uiux-design-specifications)
7. [Implementation Plan](#implementation-plan)
8. [Technical Specifications](#technical-specifications)
9. [API Documentation](#api-documentation)
10. [Testing Strategy](#testing-strategy)
11. [Deployment Guide](#deployment-guide)
12. [Future Roadmap](#future-roadmap)

---

## Executive Summary

### Project Vision
Create an intuitive web application that allows users to define complex JSON data structures through a visual interface and generate realistic data using AI-powered prompts.

### Key Value Propositions
- **Visual Schema Builder**: Drag-and-drop interface for defining complex JSON structures
- **AI-Powered Generation**: Intelligent data generation using Claude Sonnet 4
- **Nested Structure Support**: Full support for objects, arrays, and deeply nested structures
- **Real-time Preview**: Instant visualization of data structure and generated results
- **Export Capabilities**: Download generated data in JSON format

### Target Users
- **Developers**: Need test data for applications
- **QA Engineers**: Require varied datasets for testing
- **Data Analysts**: Want structured sample data for analysis
- **API Designers**: Need example payloads for documentation

---

## Project Overview

### Problem Statement
Developers frequently need structured test data but struggle with:
- Time-consuming manual data creation
- Inconsistent data formats
- Limited creativity in test scenarios
- Complex nested structure generation

### Solution Approach
A web application combining:
1. **Visual Schema Definition**: Intuitive UI for complex JSON structure creation
2. **AI-Generated Content**: Intelligent data population using natural language prompts
3. **Flexible Export Options**: Multiple formats and download capabilities

### Success Metrics
- **User Adoption**: 100+ active users within 3 months
- **Generation Accuracy**: 95%+ properly formatted JSON outputs
- **User Satisfaction**: 4.5+ rating for ease of use
- **Performance**: <3 second average generation time

---

## Technical Architecture

### Technology Stack

#### Frontend
- **Framework**: Next.js 14 with App Router [Documentation](https://nextjs.org/docs/app)
- **Language**: TypeScript
- **UI Library**: Material UI (MUI v5) [Documentation](https://mui.com/material-ui/getting-started/)
- **State Management**: Zustand [Documentation](https://zustand.docs.pmnd.rs/getting-started/introduction)
- **API State Management**: TanStack Query (React Query v5) [Documentation](https://tanstack.com/query/latest/docs/framework/react/overview)
- **Form Handling**: React Hook Form [Documentation](https://react-hook-form.com/docs) + Zod [Documentation](https://www.npmjs.com/package/zod)
- **Icons**: Material UI Icons [Documentation](https://mui.com/material-ui/material-icons/)

#### Backend
- **Runtime**: Node.js with Next.js API Routes [Documentation](https://nextjs.org/docs/pages/building-your-application/routing/api-routes)
- **Database**: PostgreSQL [Documentation](https://www.postgresql.org/docs/current/)
- **ORM**: Prisma [Documentation](https://www.prisma.io/docs/getting-started/setup-prisma/add-to-existing-project/relational-databases-typescript-postgresql)
- **Authentication**: NextAuth.js [Documentation](https://next-auth.js.org/getting-started/example)
- **AI Integration**: Anthropic Claude SDK [Documentation](https://docs.anthropic.com/en/docs/claude-code/sdk)

#### Infrastructure
- **Hosting**: Vercel (recommended)
- **Database**: Local PostgreSQL
- **Environment**: Production/Staging/Development

### System Architecture Diagram

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   External      │
│   (Next.js)     │◄──►│   (Next.js)     │◄──►│   Services      │
│                 │    │                 │    │                 │
│ • Schema Builder│    │ • Authentication│    │ • Anthropic     │
│ • Data Preview  │    │ • Data Generation│    │   Claude API    │
│ • User Auth     │    │ • Schema Storage│    │ • PostgreSQL    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## User Stories & Requirements

### Epic 1: User Authentication
**Story 1.1**: As a user, I want to sign in with my email so that I can save my schemas.
- **Acceptance Criteria**:
  - Simple email/password authentication
  - Automatic account creation on first login
  - Session persistence across browser sessions
  - Secure logout functionality

**Story 1.2**: As a user, I want my data to be private so that my schemas are secure.
- **Acceptance Criteria**:
  - User-specific data isolation
  - Secure session management
  - No data sharing between users

### Epic 2: Schema Definition
**Story 2.1**: As a user, I want to create a JSON schema visually so that I don't need to write code.
- **Acceptance Criteria**:
  - Add fields with different types (text, number, boolean, date, email, URL)
  - Create nested objects
  - Define arrays with specific item types
  - Set field constraints (required, min/max length, patterns)
  - Real-time structure preview

**Story 2.2**: As a user, I want to define complex nested structures so that I can model real-world data.
- **Acceptance Criteria**:
  - Objects within objects (unlimited nesting)
  - Arrays of objects
  - Arrays of primitives
  - Mixed-type arrays support
  - Visual hierarchy representation

**Story 2.3**: As a user, I want to set validation rules on fields so that generated data meets my requirements.
- **Acceptance Criteria**:
  - Required/optional field settings
  - String length constraints
  - Numeric range constraints
  - Email/URL format validation
  - Custom regex patterns
  - Enum value restrictions

### Epic 3: AI Data Generation
**Story 3.1**: As a user, I want to generate data using natural language prompts so that I can get contextually relevant data.
- **Acceptance Criteria**:
  - Natural language prompt input
  - Context-aware data generation
  - Respect for schema constraints
  - Multiple record generation
  - Realistic data relationships

**Story 3.2**: As a user, I want the generated data to match my exact schema so that I can use it directly in my applications.
- **Acceptance Criteria**:
  - 100% schema compliance
  - Proper data types
  - Correct nesting structure
  - Validation rule adherence
  - Consistent field naming

### Epic 4: Data Management
**Story 4.1**: As a user, I want to preview generated data so that I can verify it meets my needs.
- **Acceptance Criteria**:
  - Formatted JSON display
  - Syntax highlighting
  - Expandable/collapsible sections
  - Copy to clipboard functionality
  - Error highlighting

**Story 4.2**: As a user, I want to download generated data so that I can use it in my projects.
- **Acceptance Criteria**:
  - JSON file download
  - Custom filename support
  - Batch export capabilities
  - Multiple format support (future)

---

## System Design

### Database Schema

```sql
-- Users table
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Schemas table
CREATE TABLE schemas (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    structure JSONB NOT NULL,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_schemas_user_id ON schemas(user_id);
CREATE INDEX idx_schemas_created_at ON schemas(created_at);
```

### Data Models

#### SchemaField Interface
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

#### JsonSchema Interface
```typescript
interface JsonSchema {
  id?: string;
  name: string;
  description?: string;
  fields: SchemaField[];
}
```

### Component Architecture

```
App
├── Layout (MUI AppBar, Drawer)
│   ├── Header (AppBar with Toolbar)
│   └── Navigation (Drawer with List)
├── Auth
│   └── SignIn (Card with TextField components)
├── Builder
│   ├── SchemaBuilder (Grid layout)
│   │   ├── FieldTree (TreeView component)
│   │   ├── FieldEditor (Paper with form controls)
│   │   └── AddFieldForm (Dialog with TextField/Select)
│   ├── StructurePreview (Paper with syntax highlighting)
│   └── PromptInterface (Card with TextField and Button)
└── Preview
    ├── DataViewer (Paper with Accordion for large data)
    └── ExportControls (ButtonGroup with options)
```

---

## UI/UX Design Specifications

### Design Principles
1. **Material Design**: Follow Google's Material Design guidelines
2. **Consistency**: Unified MUI theme across all components
3. **Accessibility**: WCAG 2.1 AA compliance using MUI's built-in accessibility features
4. **Responsive**: Mobile-first design with MUI's responsive breakpoints

### Material UI Theme Configuration

```typescript
// src/theme/theme.ts
import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#9c27b0',
      light: '#ba68c8',
      dark: '#7b1fa2',
    },
    success: {
      main: '#2e7d32',
    },
    warning: {
      main: '#ed6c02',
    },
    error: {
      main: '#d32f2f',
    },
    background: {
      default: '#fafafa',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
  },
});
```

### Screen Specifications

#### 1. Authentication Screen
**Layout**: Centered Card with Material Design elevation
**Components**:
- Logo/brand header (Typography variant="h4")
- Email input (TextField with email validation)
- Password input (TextField with type="password")
- Sign in button (Button variant="contained")
- Loading state (CircularProgress)

**Material UI Wireframe**:
```
┌─────────────────────────────────┐
│         [Logo/Brand]            │
├─────────────────────────────────┤
│  ┌─────────────────────────────┐ │
│  │        Sign In Card         │ │
│  │                             │ │
│  │  Email [TextField______]    │ │
│  │  Password [TextField___]    │ │
│  │  [SIGN IN Button]           │ │
│  │                             │ │
│  └─────────────────────────────┘ │
└─────────────────────────────────┘
```

#### 2. Schema Builder Interface
**Layout**: Material UI Grid with responsive breakpoints
**Components**:
- **AppBar**: App title, user menu (Avatar with Menu), save/load actions
- **Drawer**: Collapsible navigation with List components
- **TreeView**: Schema structure with expand/collapse icons
- **Paper**: Elevated containers for different sections
- **TextField/Select**: Form controls for field properties
- **Chip**: Display field types and validation rules

**Material UI Wireframe**:
```
┌─────────────────────────────────────────────────────────┐
│ AppBar: JSON Builder    [Avatar▼] [Save] [Load] [Menu≡] │
├─────────────────────┬───────────────────────────────────┤
│ Drawer/Paper        │ Main Content Grid                 │
│ ┌─ Schema Tree      │ ┌─ Field Properties Paper        │
│ │ ├─ user (object)  │ │ Name: [TextField_______]        │
│ │ │ ├─ name (text)  │ │ Type: [Select▼_________]        │
│ │ │ ├─ email (email)│ │ Required: [Switch]              │
│ │ │ └─ tags (array) │ │ Description: [TextField____]    │
│ │ │    └─ (text)    │ │ [Chip: Validation Rules]        │
│ │ └─ metadata (obj) │ │ [Button: Add Child] [Button: ×] │
│ │ [Fab: +]          │ └─────────────────────────────────┤
│ └───────────────────│ ┌─ JSON Preview Paper            │
│                     │ │ {                               │
│ ┌─ Generate Paper   │ │   "user": {                     │
│ │ [TextField_____]  │ │     "name": "string",           │
│ │ [multiline prompt]│ │     "email": "string",          │
│ │ Count: [TextField]│ │     "tags": ["string"]          │
│ │ [Button: Generate]│ │   },                            │
│ │ [Button: Clear]   │ │   "metadata": {}                │
│ └───────────────────│ │ }                               │
│                     │ └─────────────────────────────────┤
└─────────────────────┴───────────────────────────────────┘
```

#### 3. Data Preview Screen
**Layout**: Full-width with Material UI container
**Components**:
- **Breadcrumbs**: Navigation path
- **ButtonGroup**: Export options
- **Accordion**: Collapsible sections for large datasets
- **Code highlighting**: Custom styled component within Paper

**Material UI Wireframe**:
```
┌─────────────────────────────────────────────────────────┐
│ Breadcrumbs: Home > Builder > Generated Data           │
├─────────────────────────────────────────────────────────┤
│ [ButtonGroup: JSON | CSV | XML] [Button: Download]     │
├─────────────────────────────────────────────────────────┤
│ Paper: Generated Data Preview                           │
│ ┌─ Accordion: Record 1 ─────────────────────────────── │
│ │ {                                                   │ │
│ │   "user": {                                         │ │
│ │     "name": "John Doe",                             │ │
│ │     "email": "john@example.com",                    │ │
│ │     "tags": ["developer", "javascript"]             │ │
│ │   },                                                │ │
│ │   "metadata": { "created": "2024-01-15T10:30:00Z" } │ │
│ │ }                                                   │ │
│ └─────────────────────────────────────────────────────┘ │
│ ┌─ Accordion: Record 2 ─────────────────────────────── │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## Implementation Plan

### Phase 1: Foundation (Week 1-2)
**Goals**: Basic project setup with Material UI and React Query
**Deliverables**:
- Project initialization with Next.js and Material UI
- React Query setup and configuration
- Database schema and Prisma setup
- Basic authentication implementation with MUI components

**Tasks**:
1. Initialize Next.js project with TypeScript
2. Set up Material UI v5 with custom theme
3. Configure TanStack Query with proper providers
4. Configure PostgreSQL database
5. Implement Prisma schema and migrations
6. Set up NextAuth.js authentication
7. Create MUI-based routing structure with AppBar and Drawer
8. Implement login/logout functionality using MUI components

### Phase 2: Core Schema Builder (Week 3-4)
**Goals**: Visual schema definition with Material UI components
**Deliverables**:
- Interactive TreeView component for field hierarchy
- Material UI forms for field configuration
- Nested structure support with MUI expansion panels
- Real-time JSON preview in styled Paper component

**Tasks**:
1. Design and implement MUI TreeView for schema structure
2. Create field editor using MUI form components (TextField, Select, Switch)
3. Add support for nested objects and arrays with Accordion components
4. Implement drag-and-drop reordering with MUI's sortable utilities
5. Build JSON structure preview with syntax highlighting in Paper
6. Add field validation rules interface using MUI components
7. Implement schema save/load functionality with React Query mutations

### Phase 3: AI Integration with React Query (Week 5-6)
**Goals**:  
Enable the generation of structured data that adheres exactly to user-defined JSON schemas using prompt-based input and AI (Anthropic Claude), ensuring validity, reliability, and schema conformance. Leverage a **hybrid generation strategy**: attempt whole-structure generation first, then fall back to partial (field-level) repair on validation failure.
**Deliverables**:
- Anthropic Claude API integrated with React Query  
- Hybrid AI data generation engine with schema-first fallback logic  
- Schema-based JSON validation pipeline (AJV or equivalent)  
- Resilient data generation API endpoint with fallback and batching  
- MUI prompt interface connected to generation engine with real-time feedback  
- React Query hooks with state tracking, caching, and retry mechanisms  
- Generation progress UI with Skeleton/LinearProgress  
- Field-specific error feedback and recovery options in the UI  

**Tasks**:
1. **Set up Anthropic Claude SDK**
   - Integrate Claude API using secure API keys
   - Abstract API into a ClaudeService module for easy reuse
2. **Create React Query hooks for data generation**
   - `useGenerateData`: mutation hook to call backend generation endpoint
   - Handle `onSuccess`, `onError`, `onSettled` for proper UI feedback
   - Include cancellation and retry support
3. **Design prompt engineering system (Hybrid Strategy)**
   - Define base prompt structure for full-object generation
   - Create fallback prompt templates for common field types (`string`, `object`, `array`)
   - Enable contextual prompt generation using parent/related fields
4. **Implement data generation API endpoint using schema structure**
   - Accept `{ schema, userPrompt }` in POST body
   - Step 1: Try full-schema generation
   - Step 2: Validate output using JSON Schema (AJV)
   - Step 3: If invalid → identify failing fields
   - Step 4: Regenerate failed fields in batches using field-level prompting
   - Step 5: Recombine valid parts into a final JSON object
5. **Implement all validations using field-type validation rules**
   - Use AJV to enforce:
     - Type correctness
     - Required fields
     - Format checks (`email`, `date-time`, etc.)
     - Pattern, enum, min/max constraints
   - Normalize/sanitize known common errors (e.g., convert stringified numbers)
6. **Create MUI prompt interface with TextField and progress indicators**
   - Use existing prompt input UI
   - Connect `onSubmit` to generation hook
   - Show loading states on generate request start
7. **Add generation progress UI with MUI LinearProgress and Skeleton**
   - Show progress bar during full-object generation
   - If falling back to field-level generation, show per-field skeleton loaders
   - Include intermediate generation state in the UI
8. **Implement error handling with MUI Alert components and retry logic**
   - Display generation or validation errors in a clear, user-friendly format
   - Allow retrying the full prompt or specific fields
   - Offer "edit manually" mode for failed JSON chunks
9. **Add data validation and formatting with React Query callbacks**
   - On success: display formatted JSON in viewer with collapsible sections
   - Highlight any fields that required fallback regeneration
   - Allow user to copy/download final structured data

### Phase 4: Data Management with Material UI (Week 7-8)
**Goals**: Preview and export functionality with MUI components
**Deliverables**:
- Data preview interface with MUI components
- Export functionality with ButtonGroup and Menu
- Performance optimization with React Query
- Comprehensive testing with MUI testing utilities

**Tasks**:
1. Build data preview component using MUI Accordion and syntax highlighting
2. Implement JSON download functionality with MUI Menu options
3. Add copy-to-clipboard features using MUI IconButton and Snackbar
4. Optimize performance for large datasets with React Query pagination
5. Add loading states with MUI Skeleton and error boundaries
6. Implement unit tests using MUI testing utilities
7. User acceptance testing with Material Design principles

### Phase 5: Polish & Deploy (Week 9-10)
**Goals**: Production readiness with Material UI theming
**Deliverables**:
- Production deployment with optimized MUI bundle
- Comprehensive documentation
- Performance monitoring with React Query DevTools
- User feedback collection with MUI components

**Tasks**:
1. Production environment setup with MUI optimization
2. Performance optimization and React Query caching strategies
3. Security audit and hardening
4. User documentation with MUI styled components
5. Analytics and monitoring setup
6. Beta user testing with MUI feedback forms
7. Production deployment

---

## Technical Specifications

### Environment Configuration

```bash
# .env.local
DATABASE_URL="postgresql://username:password@localhost:5432/json_generator"
NEXTAUTH_SECRET="your-secure-nextauth-secret-key"
NEXTAUTH_URL="http://localhost:3000"
ANTHROPIC_API_KEY="your-anthropic-api-key"
NODE_ENV="development"
```

### Package Dependencies

```json
{
  "name": "json-generator-mvp",
  "version": "1.0.0",
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "typescript": "^5.0.0",
    "@mui/material": "^5.15.0",
    "@mui/icons-material": "^5.15.0",
    "@mui/lab": "^5.0.0-alpha.150",
    "@mui/x-tree-view": "^6.0.0",
    "@emotion/react": "^11.11.0",
    "@emotion/styled": "^11.11.0",
    "@tanstack/react-query": "^5.0.0",
    "@tanstack/react-query-devtools": "^5.0.0",
    "@anthropic-ai/sdk": "^0.20.0",
    "next-auth": "^4.24.0",
    "prisma": "^5.0.0",
    "@prisma/client": "^5.0.0",
    "zustand": "^4.4.0",
    "react-hook-form": "^7.45.0",
    "@hookform/resolvers": "^3.3.0",
    "zod": "^3.22.0",
    "uuid": "^9.0.0",
    "@types/uuid": "^9.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "eslint": "^8.0.0",
    "eslint-config-next": "^14.0.0"
  }
}
```

### Core Implementation Files

#### 1. Material UI Theme Provider Setup
```typescript
// src/providers/ThemeProvider.tsx
'use client';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from '@/theme/theme';

export default function MUIThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
```

#### 2. React Query Configuration
```typescript
// src/providers/QueryProvider.tsx
'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export default function QueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
          mutations: {
            onError: (error) => {
              console.error('Mutation error:', error);
            },
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

#### 3. React Query Hooks for API Management
```typescript
// src/hooks/useSchemas.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { JsonSchema } from '@/types/schema';

export function useSchemas() {
  return useQuery({
    queryKey: ['schemas'],
    queryFn: async (): Promise<JsonSchema[]> => {
      const response = await fetch('/api/schemas');
      if (!response.ok) throw new Error('Failed to fetch schemas');
      return response.json();
    },
  });
}

export function useSaveSchema() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (schema: JsonSchema) => {
      const response = await fetch('/api/schemas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(schema),
      });
      if (!response.ok) throw new Error('Failed to save schema');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schemas'] });
    },
  });
}

export function useGenerateData() {
  return useMutation({
    mutationFn: async ({
      schema,
      prompt,
      count,
    }: {
      schema: JsonSchema;
      prompt: string;
      count: number;
    }) => {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schema, prompt, count }),
      });
      if (!response.ok) throw new Error('Failed to generate data');
      return response.json();
    },
  });
}
```

#### 4. Database Configuration
```typescript
// src/lib/db.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

#### 5. Authentication Setup
```typescript
// src/lib/auth.ts
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from './db';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        
        const user = await prisma.user.upsert({
          where: { email: credentials.email },
          update: {},
          create: {
            email: credentials.email,
            name: credentials.email.split('@')[0]
          }
        });
        
        return { id: user.id, email: user.email, name: user.name };
      }
    })
  ],
  pages: { signIn: '/auth/signin' },
  session: { strategy: 'jwt' }
};
```

#### 6. Anthropic Integration
```typescript
// src/lib/anthropic.ts
import Anthropic from '@anthropic-ai/sdk';
import { JsonSchema } from '@/types/schema';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function generateJsonData(
  schema: JsonSchema,
  prompt: string,
  count: number = 1
): Promise<any[]> {
  const jsonStructure = convertSchemaToJsonStructure(schema.fields);
  
  const systemPrompt = `Generate realistic JSON data matching this exact structure:
${JSON.stringify(jsonStructure, null, 2)}

Requirements:
1. Return exactly ${count} object(s) in a JSON array
2. Match the structure exactly - no additional or missing fields
3. Generate realistic data based on field names and types
4. Consider the user's specific requirements: ${prompt}

Return only valid JSON, no explanations.`;

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4000,
    system: systemPrompt,
    messages: [{ role: 'user', content: prompt }]
  });

  const content = message.content[0];
  if (content.type === 'text') {
    const cleanedJson = content.text
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    
    const parsedData = JSON.parse(cleanedJson);
    return Array.isArray(parsedData) ? parsedData : [parsedData];
  }
  
  throw new Error('Invalid response from Claude');
}
```

---

## API Documentation

### Authentication Endpoints

#### POST /api/auth/signin
**Description**: User authentication
**Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
**Response**:
```json
{
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name"
  },
  "expires": "2024-12-31T23:59:59.999Z"
}
```

### Schema Management Endpoints

#### GET /api/schemas
**Description**: Retrieve user's schemas
**Headers**: Authorization required
**Response**:
```json
[
  {
    "id": "schema_id",
    "name": "User Schema",
    "description": "Schema description",
    "structure": { /* JSON schema */ },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

#### POST /api/schemas
**Description**: Save a new schema
**Headers**: Authorization required
**Body**:
```json
{
  "name": "My Schema",
  "description": "Schema description",
  "structure": {
    "fields": [
      {
        "id": "field1",
        "name": "userName",
        "type": "text",
        "logic": { "required": true }
      }
    ]
  }
}
```

### Data Generation Endpoints

#### POST /api/generate
**Description**: Generate JSON data based on schema and prompt
**Headers**: Authorization required
**Body**:
```json
{
  "schema": {
    "name": "User Data",
    "fields": [
      {
        "id": "1",
        "name": "name",
        "type": "text"
      },
      {
        "id": "2",
        "name": "email",
        "type": "email"
      }
    ]
  },
  "prompt": "Generate realistic user data for a tech company",
  "count": 5
}
```
**Response**:
```json
{
  "data": [
    {
      "name": "Alice Johnson",
      "email": "alice.johnson@techcorp.com"
    },
    {
      "name": "Bob Smith",
      "email": "bob.smith@techcorp.com"
    }
  ]
}
```

---

## Testing Strategy

### Unit Testing
**Framework**: Jest + React Testing Library + MUI Testing Utilities
**Coverage Target**: 80%
**Test Categories**:
- MUI component rendering tests
- User interaction tests with Material UI components
- API endpoint tests with React Query mocks
- Utility function tests

**Example Test with Material UI**:
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { theme } from '@/theme/theme';
import FieldBuilder from '@/components/FieldBuilder';

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  
  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        {component}
      </ThemeProvider>
    </QueryClientProvider>
  );
};

describe('FieldBuilder', () => {
  test('should add new field when MUI form is submitted', () => {
    renderWithProviders(<FieldBuilder />);
    
    fireEvent.change(screen.getByLabelText('Field name'), {
      target: { value: 'testField' }
    });
    fireEvent.click(screen.getByRole('button', { name: /add field/i }));
    
    expect(screen.getByText('testField')).toBeInTheDocument();
  });
});
```

### Integration Testing
**Framework**: Playwright with Material UI selectors
**Scenarios**:
- Complete user workflow with MUI components
- React Query cache invalidation and optimistic updates
- Material UI responsive design testing
- Error handling with MUI Alert components

### API Testing
**Framework**: Supertest with React Query integration
**Coverage**:
- All endpoint functionality with proper React Query cache management
- Authentication validation
- Error responses with Material UI error boundaries
- Rate limiting

### Performance Testing
**Tools**: Lighthouse, Web Vitals, React Query DevTools
**Metrics**:
- First Contentful Paint < 2s (including MUI bundle)
- Largest Contentful Paint < 4s
- Cumulative Layout Shift < 0.1 (MUI components)
- React Query cache efficiency

---

## Deployment Guide

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Anthropic API key
- Vercel account (recommended)

### Environment Setup

#### Development
```bash
# Clone repository
git clone <repository-url>
cd json-generator-mvp

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your values

# Set up database
npx prisma db push
npx prisma generate

# Start development server with MUI and React Query
npm run dev
```

#### Production Deployment (Vercel)

1. **Database Setup**:
   - Create PostgreSQL database (Supabase recommended)
   - Note connection string

2. **Vercel Configuration**:
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy with MUI optimization
   vercel
   
   # Set environment variables
   vercel env add DATABASE_URL
   vercel env add NEXTAUTH_SECRET
   vercel env add ANTHROPIC_API_KEY
   ```

3. **Material UI Optimization**:
   ```typescript
   // next.config.js
   /** @type {import('next').NextConfig} */
   const nextConfig = {
     experimental: {
       optimizePackageImports: ['@mui/material', '@mui/icons-material'],
     },
   }
   
   module.exports = nextConfig
   ```

### Monitoring Setup

#### Error Tracking
- **Sentry**: Error monitoring with Material UI error boundaries
- **Vercel Analytics**: Page views and performance metrics
- **React Query DevTools**: API state monitoring

#### Database Monitoring
- **Prisma Pulse**: Real-time database monitoring
- **PostgreSQL logs**: Query performance analysis with React Query metrics

---

## Future Roadmap

### Version 1.1 (Month 2-3)
**Enhanced Material UI Features**:
- Advanced MUI DataGrid for schema management
- Material UI date/time pickers for temporal data
- Custom MUI theme variants for different user roles
- MUI Autocomplete for smart field suggestions
- Enhanced MUI TreeView with virtualization

### Version 1.2 (Month 4-6)
**Advanced Capabilities with React Query**:
- Infinite queries for large dataset pagination
- Optimistic updates for real-time collaboration
- Background sync with React Query sync strategies
- Advanced caching with React Query persistence
- MUI Dashboard components for analytics

### Version 2.0 (Month 7-12)
**Enterprise Features**:
- MUI X DataGrid Pro for advanced data management
- Custom Material UI theme engine
- Advanced React Query patterns for team collaboration
- MUI date pickers with business logic
- Enterprise Material UI components

---

## Risk Assessment & Mitigation

### Technical Risks

#### High Priority
1. **Material UI Bundle Size**: Large initial bundle with MUI components
   - *Mitigation*: Tree shaking, code splitting, MUI optimization

2. **React Query Cache Management**: Complex cache invalidation patterns
   - *Mitigation*: Proper query keys, selective invalidation, cache persistence

3. **API Rate Limits**: Anthropic API usage limits
   - *Mitigation*: React Query retry logic, request queuing, user limits

#### Medium Priority
1. **Material UI Theme Consistency**: Custom theming across components
   - *Mitigation*: Centralized theme configuration, MUI design tokens

2. **Performance**: Material UI rendering performance with large schemas
   - *Mitigation*: React Query pagination, MUI virtualization, lazy loading

---

## Success Metrics & KPIs

### User Metrics
- **Monthly Active Users**: Target 500+ by month 6
- **Material UI Component Usage**: Track most used MUI components
- **React Query Cache Hit Rate**: 85%+ cache efficiency
- **User Retention**: 70% weekly retention

### Technical Metrics
- **Material UI Bundle Size**: <500KB gzipped
- **React Query Performance**: <100ms average query time
- **API Response Time**: <2 seconds average
- **Uptime**: 99.9% availability

### Business Metrics
- **User Satisfaction**: 4.5+ rating for Material UI experience
- **Feature Adoption**: 80% use React Query-powered features
- **Performance Rating**: 4+ rating for application speed
- **Design Consistency**: 95% positive feedback on Material UI interface

---

## Conclusion

This comprehensive documentation provides a complete roadmap for building the JSON Data Generator MVP using Material UI for the user interface and React Query for API state management. The combination of Material Design principles, robust API state management, and powerful AI integration creates a strong foundation for a successful product.

The Material UI integration ensures a consistent, accessible, and professional user experience, while React Query provides efficient API state management with built-in caching, error handling, and optimization features. The phased implementation approach ensures steady progress while maintaining the high quality standards expected from Material Design applications.

**Next Steps**:
1. Review and approve this updated documentation
2. Set up development environment with Material UI and React Query
3. Begin Phase 1 implementation with MUI components
4. Establish regular progress reviews using Material UI analytics
5. Start user research and feedback collection with MUI feedback forms

---

*This document serves as the complete reference for the JSON Data Generator MVP project using Material UI and React Query. For questions or clarifications, please refer to the technical specifications or contact the project team.*