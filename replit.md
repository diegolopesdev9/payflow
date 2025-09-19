# FinApp - Financial Control Application

## Overview

FinApp is a comprehensive financial control web application designed to help users manage their bills and accounts payable. Built with modern React technologies, it provides an intuitive interface for tracking expenses, managing categories, generating reports, and never missing payment due dates. The application features a full-stack architecture with a Node.js backend using Hono framework and a React frontend with TypeScript and Tailwind CSS.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The frontend is built using React with TypeScript, utilizing a component-based architecture with the following key decisions:

- **UI Framework**: Uses shadcn/ui components built on Radix UI primitives for consistent, accessible design
- **Styling**: Tailwind CSS for utility-first styling with a custom financial app theme (primary green colors)
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state management and caching
- **Forms**: React Hook Form with Zod validation for type-safe form handling

### Backend Architecture
The backend uses a lightweight Node.js architecture:

- **Framework**: Hono.js for high-performance HTTP handling
- **Server**: @hono/node-server for Node.js runtime
- **Storage**: Abstracted storage interface (IStorage) with in-memory implementation for development
- **API Design**: RESTful API structure with proper HTTP status codes and error handling

### Data Layer
The application uses a flexible data architecture:

- **ORM**: Drizzle ORM for type-safe database operations
- **Schema**: PostgreSQL schema with users, categories, and bills tables
- **Validation**: Zod schemas for runtime type checking and validation
- **Storage Abstraction**: Interface-based storage pattern allowing easy database switching

### Key Features Architecture
- **Authentication**: User registration and login system with password hashing
- **Bill Management**: CRUD operations for bills with category association
- **Category System**: User-specific expense categories with icons and colors
- **Reporting**: Data visualization for expense tracking and analysis
- **Profile Management**: User settings, security, and notification preferences

### Component Structure
- **Pages**: Route-level components (Dashboard, Bills, Profile, etc.)
- **UI Components**: Reusable shadcn/ui components with consistent styling
- **Hooks**: Custom React hooks for mobile detection and toast notifications
- **Utils**: Helper functions for class name merging and common utilities

## External Dependencies

### Core Framework Dependencies
- **React 18**: Frontend framework with hooks and modern features
- **TypeScript**: Type safety and enhanced development experience
- **Vite**: Fast build tool and development server
- **Node.js**: Runtime environment for backend services

### UI and Styling
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Component library based on Radix UI primitives
- **Radix UI**: Accessible, unstyled UI components
- **Lucide React**: Icon library for consistent iconography
- **class-variance-authority**: Utility for managing component variants

### Backend Services
- **Hono**: Lightweight web framework for API development
- **@hono/node-server**: Node.js adapter for Hono applications
- **Drizzle ORM**: Type-safe ORM for database operations
- **Zod**: Schema validation library

### Development Tools
- **ESLint**: Code linting with TypeScript support
- **PostCSS**: CSS processing with Tailwind CSS
- **TanStack React Query**: Server state management and caching
- **React Hook Form**: Form state management and validation
- **date-fns**: Date manipulation and formatting utilities

### Deployment Configuration
- **Lovable Platform**: Integrated development and deployment platform
- **Replit**: Development environment with live preview capabilities
- **Git Integration**: Version control with automatic deployments