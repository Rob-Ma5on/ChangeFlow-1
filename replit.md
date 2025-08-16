# Overview

This is a comprehensive Engineering Change Management (ECM) system designed for small to mid-size manufacturing companies. The application follows a three-entity workflow: ECR (Engineering Change Request) → ECO (Engineering Change Order) → ECN (Engineering Change Notice). It supports multi-tenancy with organizations, role-based access control, and features like approval workflows, document management, and real-time notifications.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **React + TypeScript**: Modern React application using TypeScript for type safety
- **Wouter**: Lightweight client-side routing library
- **TanStack Query**: Powerful data fetching and caching with optimistic updates
- **Tailwind CSS**: Utility-first CSS framework for consistent styling
- **Shadcn/ui**: High-quality component library built on Radix UI primitives
- **Vite**: Fast build tool and development server with HMR support

## Backend Architecture
- **Express.js**: Node.js web framework handling API routes and middleware
- **PostgreSQL + Drizzle ORM**: Type-safe database interactions with schema-first approach
- **Session-based Authentication**: Secure session management with PostgreSQL storage
- **RESTful API Design**: Clean API endpoints following REST conventions
- **Middleware Pipeline**: Request logging, error handling, and authentication layers

## Database Design
- **Multi-tenant Architecture**: Organization-based data isolation
- **Comprehensive Schema**: Tables for users, organizations, ECRs, ECOs, ECNs, approvals, comments, attachments, notifications, and audit logs
- **JSONB Fields**: Flexible storage for organization settings and custom permissions
- **Sequential Numbering**: Year-based numbering system (ECR-YY-###, ECO-YY-###, ECN-YY-###)
- **Audit Trail**: Complete tracking of all changes and activities

## Authentication & Authorization
- **Replit Auth Integration**: OAuth-based authentication using OpenID Connect
- **Role-based Access Control**: Admin, engineering manager, engineer, requestor, viewer, and custom roles
- **Organization Membership**: Users belong to organizations with specific permissions
- **Session Management**: Secure session storage with configurable TTL

## Key Features
- **Dashboard**: Real-time metrics, activity feeds, pending approvals, and quick actions
- **Workflow Management**: Complete ECR→ECO→ECN lifecycle with approval chains
- **File Upload**: Integration with Google Cloud Storage for document management
- **Real-time Updates**: Live notifications and activity tracking
- **Search & Filtering**: Advanced search capabilities across all entities
- **Responsive Design**: Mobile-friendly interface with adaptive layouts

# External Dependencies

## Database & Storage
- **PostgreSQL**: Primary database via Neon serverless platform (@neondatabase/serverless)
- **Google Cloud Storage**: File storage and document management (@google-cloud/storage)

## Authentication
- **Replit Auth**: OAuth provider using OpenID Connect (openid-client)
- **Session Storage**: PostgreSQL-backed sessions (connect-pg-simple)

## File Upload
- **Uppy**: Modern file uploader with multiple upload strategies (@uppy/core, @uppy/dashboard, @uppy/aws-s3)

## UI Framework
- **Radix UI**: Accessible component primitives (@radix-ui/react-*)
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library for consistent iconography

## Development Tools
- **TypeScript**: Type safety across frontend and backend
- **Vite**: Fast development server and build tool
- **Drizzle Kit**: Database schema management and migrations
- **ESBuild**: Fast JavaScript bundler for production builds