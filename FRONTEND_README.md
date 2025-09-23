# ClinPrecision Frontend - React Application

## Overview
ClinPrecision Frontend is a React-based web application for clinical trial management, providing comprehensive user interfaces for study design, data capture, quality management, and administration. The application is built with modern React patterns using React Router for navigation, Axios for API communication, and Tailwind CSS for styling.

## Technology Stack

### Core Framework
- **React 19.1.1**: Latest React version with concurrent features
- **React DOM 19.1.1**: DOM-specific React methods
- **React Router DOM 7.7.1**: Client-side routing and navigation
- **React Scripts 5.0.1**: Create React App build toolchain

### UI & Styling
- **Tailwind CSS 3.4.3**: Utility-first CSS framework
- **PostCSS 8.5.6**: CSS post-processing
- **Autoprefixer 10.4.21**: CSS vendor prefix automation
- **Lucide React 0.543.0**: Modern icon library
- **FontAwesome**: Additional icon library for legacy components

### HTTP Client & Communication
- **Axios 1.11.0**: Promise-based HTTP client for API communication

### Testing Framework
- **@testing-library/react 16.3.0**: React testing utilities
- **@testing-library/jest-dom 6.6.4**: Custom Jest matchers
- **@testing-library/user-event 13.5.0**: User event simulation
- **@testing-library/dom 10.4.1**: DOM testing utilities

### Performance & Monitoring
- **web-vitals 2.1.4**: Core Web Vitals measurement

## Project Structure

```
clinprecision/
├── public/                          # Static assets
│   ├── index.html                   # Main HTML template
│   ├── favicon.ico                  # Application favicon
│   ├── logo192.png, logo512.png     # PWA icons
│   └── manifest.json                # PWA manifest
├── src/
│   ├── components/                  # React components
│   │   ├── common/                  # Shared UI components
│   │   ├── home.jsx                 # Main dashboard component
│   │   ├── login/                   # Authentication components
│   │   │   ├── AuthContext.js       # React context for authentication
│   │   │   ├── Login.jsx            # Login form component
│   │   │   ├── Logout.jsx           # Logout component
│   │   │   └── ProtectedRoute.jsx   # Route protection HOC
│   │   ├── modules/                 # Feature modules
│   │   │   ├── datacapture/         # Data capture module
│   │   │   ├── dqmgmt/             # Data quality management
│   │   │   ├── trialdesign/        # Study design module
│   │   │   └── usermanagement/     # User administration
│   │   └── shared/                  # Shared components across modules
│   │       └── TopNavigationHeader.jsx # Global navigation header
│   ├── services/                    # API service layer
│   │   ├── ApiService.js            # Base API service configuration
│   │   ├── DataEntryService.js      # Data entry operations
│   │   ├── FormService.js           # Form management APIs
│   │   ├── FormVersionService.js    # Form versioning
│   │   ├── LoginService.js          # Authentication APIs
│   │   ├── OrganizationService.js   # Organization management
│   │   ├── RoleService.js           # Role and permission APIs
│   │   ├── StudyDesignService.js    # Study design operations
│   │   ├── StudyFormService.js      # Study-form associations
│   │   ├── StudyService.js          # Study management
│   │   ├── SubjectService.js        # Subject/patient management
│   │   ├── UserService.js           # User management APIs
│   │   ├── UserTypeService.js       # User type classification
│   │   └── VisitDefinitionService.js # Visit definition management
│   ├── config.js                    # Application configuration
│   ├── App.jsx                      # Root application component
│   ├── App.css                      # Global application styles
│   ├── index.jsx                    # Application entry point
│   ├── index.css                    # Global CSS imports
│   └── setupTests.js                # Test configuration
├── package.json                     # Dependencies and scripts
├── tailwind.config.js              # Tailwind CSS configuration
├── postcss.config.js               # PostCSS configuration
└── README.md                        # Project documentation
```

## Architecture Overview

### Application Architecture
- **Single Page Application (SPA)**: React Router manages client-side routing
- **Component-Based**: Modular component structure with clear separation of concerns
- **Service Layer Pattern**: Dedicated service classes for API communication
- **Context API**: Authentication state management using React Context
- **Protected Routes**: Route-based authorization for secure navigation

### Module Structure
The application is organized into feature modules:

1. **Study Design Module** (`trialdesign/`): Study creation, visit scheduling, form design
2. **Data Capture Module** (`datacapture/`): Subject enrollment, data entry, form completion
3. **Data Quality Module** (`dqmgmt/`): Query management, data verification, quality control
4. **User Management Module** (`usermanagement/`): User administration, role assignment, organization management

### Authentication & Authorization
- **JWT-based Authentication**: Token-based authentication with backend services
- **Context Provider**: `AuthContext` manages authentication state globally
- **Protected Routes**: `ProtectedRoute` component ensures authenticated access
- **Role-based Access**: Components adapt UI based on user roles and permissions

### API Communication
- **Centralized Configuration**: `ApiService.js` provides base HTTP client configuration
- **Service Classes**: Each feature has dedicated service classes for API calls
- **Error Handling**: Consistent error handling across all API services
- **Request/Response Interceptors**: Automated token attachment and error processing

## Development Setup

### Prerequisites
- **Node.js**: Version 16+ recommended
- **npm**: Version 8+ (comes with Node.js)
- **Git**: For version control

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd clinprecision/frontend/clinprecision

# Install dependencies
npm install

# Start development server
npm start
```

### Development Commands
```bash
# Start development server (http://localhost:3000)
npm start

# Run tests
npm test

# Run tests with coverage
npm test -- --coverage

# Build for production
npm run build

# Analyze bundle size
npm run build && npx serve -s build

# Lint code
npx eslint src/

# Format code
npx prettier --write src/
```

### Environment Configuration
Create `.env` file in the project root:
```env
# API Configuration
REACT_APP_API_BASE_URL=http://localhost:8080
REACT_APP_API_TIMEOUT=30000

# Authentication
REACT_APP_AUTH_TOKEN_KEY=clinprecision_auth_token

# Feature Flags
REACT_APP_ENABLE_DEBUG=true
REACT_APP_ENABLE_ANALYTICS=false
```

## Features

### Study Design Module
- **Study Creation**: Comprehensive study setup with metadata
- **Visit Scheduling**: Timeline-based visit definitions with windows
- **Form Design**: Dynamic CRF builder with drag-and-drop interface
- **Study Arms**: Treatment arm configuration with interventions

### Data Capture Module
- **Subject Enrollment**: Patient registration and screening
- **Data Entry**: Form-based data collection with validation
- **Visit Management**: Schedule and track subject visits
- **Form Completion**: Progressive form completion with save states

### Data Quality Module
- **Query Management**: Data query creation and resolution
- **Data Verification**: Multi-level review and approval
- **Quality Control**: Real-time data quality monitoring
- **Audit Trail**: Complete change history tracking

### User Management Module
- **User Administration**: Account creation and management
- **Role Assignment**: Flexible role-based permissions
- **Organization Management**: Multi-organization support
- **Access Control**: Fine-grained permission management

## API Service Layer

### Service Classes
Each service provides CRUD operations and business logic:

#### StudyService.js
- `getStudies()`: Retrieve study list
- `getStudyById(id)`: Get specific study details
- `createStudy(data)`: Create new study
- `updateStudy(id, data)`: Update study information

#### VisitDefinitionService.js
- `getVisitsByStudy(studyId)`: Get study visit schedule
- `createVisit(studyId, data)`: Add new visit
- `updateVisit(id, data)`: Modify visit details
- `deleteVisit(id)`: Remove visit from schedule

#### FormService.js
- `getForms()`: Get form definitions
- `createForm(data)`: Create new form
- `updateForm(id, data)`: Update form structure
- `getFormVersions(id)`: Get form version history

## Contributing

### Development Workflow
1. Create feature branch from `main`
2. Implement changes with tests
3. Run full test suite
4. Submit pull request
5. Code review and approval
6. Merge to main branch

### Code Standards
- **ESLint**: Code linting with React rules
- **Prettier**: Code formatting
- **Naming Conventions**: PascalCase for components, camelCase for functions
- **File Organization**: Feature-based folder structure

## Browser Support

### Supported Browsers
- **Chrome**: Latest 2 versions
- **Firefox**: Latest 2 versions  
- **Safari**: Latest 2 versions
- **Edge**: Latest 2 versions

## Security Considerations

### Authentication Security
- **JWT Token Storage**: Secure token storage strategies
- **Token Expiration**: Automatic token refresh
- **HTTPS Only**: All production traffic over HTTPS
- **CSP Headers**: Content Security Policy implementation

### Data Protection
- **Input Validation**: Client-side validation with server verification
- **XSS Prevention**: React's built-in XSS protection
- **CSRF Protection**: Cross-site request forgery prevention
- **Sensitive Data**: No sensitive data in client-side storage