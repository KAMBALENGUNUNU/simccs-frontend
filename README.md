# SIMCCS Frontend

Secure Information Management and Crisis Communication System - A comprehensive role-based crisis management platform.

## Overview

SIMCCS is designed for high-integrity information gathering in volatile environments. It features:

- **Offline-First Architecture** - Field reporters can create reports offline and sync when connectivity returns
- **Multi-Factor Authentication** - TOTP-based MFA for enhanced security
- **Role-Based Access Control** - Three user roles with specific permissions:
  - **Journalist** - Create and submit crisis reports
  - **Editor** - Review, approve, reject, or request revisions for reports
  - **Admin** - Full system access including user management and disaster recovery
- **Verification Workflow** - Multi-tier validation process to ensure data integrity
- **Analytics Dashboard** - Real-time insights into crisis metrics
- **Disaster Recovery** - Database backup and restore capabilities

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Backend API running (default: `http://localhost:8080`)

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Update the `.env` file with your backend API URL:
```
VITE_API_BASE_URL=http://localhost:8080
```

### Running the Application

Development mode:
```bash
npm run dev
```

Build for production:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

## Application Structure

### Pages

- **Welcome** (`/`) - Landing page with feature overview
- **Login** (`/login`) - User authentication
- **Register** (`/register`) - New user registration
- **Forgot Password** (`/forgot-password`) - Password recovery flow
- **MFA Setup** (`/mfa-setup`) - Configure two-factor authentication
- **MFA Verify** (`/mfa-verify`) - Enter TOTP code for login
- **Dashboard** (`/dashboard`) - Role-specific dashboard
- **Reports** (`/reports`) - View and search all reports
- **New Report** (`/reports/new`) - Submit a crisis report (Journalists only)
- **Review Queue** (`/review-queue`) - Report validation workflow (Editors/Admins)
- **Analytics** (`/analytics`) - Crisis metrics and statistics (Editors/Admins)
- **User Management** (`/users`) - Approve/ban users (Admins only)
- **Admin Panel** (`/admin`) - Backup/restore and audit logs (Admins only)

### User Roles

#### Journalist (Field Reporter)
- Create crisis reports with location data
- Upload evidence and media
- Track report status (pending, approved, rejected, revision needed)
- View personal dashboard with report statistics

#### Editor (Moderator)
- Access review queue of pending reports
- Take actions on reports:
  - Approve - Publish to live feed
  - Reject - Terminate report
  - Request Revision - Return to journalist for updates
  - Flag Misinformation - Mark for high-level audit
- View analytics dashboard
- Access all reports

#### Admin (Super User)
- All Editor capabilities
- User management:
  - Approve new user registrations
  - Ban problematic users
- System administration:
  - Trigger manual database backups
  - Restore from backup snapshots
  - View comprehensive audit logs

## Features

### Authentication & Security

- JWT-based authentication with refresh tokens
- TOTP two-factor authentication
- Secure password reset flow
- Account approval workflow (admins must approve new users)

### Crisis Reporting

- Geotagged reports with latitude/longitude
- Casualty count tracking
- Category tagging
- Media file support
- Soft delete (archive without permanent data loss)

### Workflow Management

- Four-stage review process
- Version control for report revisions
- Comment system for reviewer feedback
- Misinformation flagging
- Status tracking throughout lifecycle

### Analytics

- Real-time crisis metrics
- Reports by status breakdown
- Total casualty tracking
- Recent activity feed
- Visual data representation

### Administration

- User approval/ban capabilities
- Database backup scheduling
- Point-in-time restore
- Comprehensive audit logging
- System health monitoring

## API Integration

The frontend integrates with the SIMCCS backend API. Key endpoints:

- `/api/auth/*` - Authentication and MFA
- `/api/reports/*` - Crisis report management
- `/api/workflow/*` - Report review and status changes
- `/api/admin/*` - User management and system administration
- `/api/analytics/*` - Dashboard statistics
- `/api/sync/*` - Offline batch synchronization

## Design Philosophy

The application uses a clean, modern design with:

- Blue and cyan color scheme (no purple/indigo)
- Consistent spacing using 8px grid system
- Accessible color contrast ratios
- Responsive design for mobile and desktop
- Thoughtful micro-interactions and animations
- Clear visual hierarchy
- Professional, production-ready aesthetics

## Technology Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Icon library
- **QRCode.react** - QR code generation for MFA
- **Vite** - Build tool and dev server

## Security Considerations

- All authenticated routes require valid JWT token
- Role-based access control enforced on frontend and backend
- MFA recommended for all users
- Sensitive operations require additional verification
- Automatic logout on token expiration
- HTTPS recommended for production deployment

## Development Notes

- All components are functional with React hooks
- TypeScript for type safety
- API client centralized in `src/services/api.ts`
- Reusable components in `src/components/`
- Page components in `src/pages/`
- Context-based state management for authentication

## Support

For issues or questions about the application, please refer to the API documentation and system architecture documents provided.
