# ClinPrecision Frontend Architecture Documentation

## Overview
ClinPrecision is a comprehensive clinical trial management system built with React 19, featuring a modular architecture for managing clinical studies, data capture, user administration, and data quality management.

## Technology Stack

### Core Technologies
- **React**: 19.1.1 (Latest version with advanced hooks and concurrent features)
- **React Router DOM**: 7.7.1 (Client-side routing and navigation)
- **Axios**: 1.11.0 (HTTP client for API communication)
- **Tailwind CSS**: 3.4.3 (Utility-first CSS framework)
- **PostCSS**: 8.5.6 (CSS post-processor)

### UI Libraries & Icons
- **Lucide React**: 0.543.0 (Modern icon library)
- **FontAwesome**: 7.0.0 (Additional icon support)

### Development Tools
- **React Scripts**: 5.0.1 (Build tools and development server)
- **ESLint**: React App configuration (Code linting)
- **Autoprefixer**: 10.4.21 (CSS vendor prefixes)

## Project Structure

```
frontend/clinprecision/
├── public/                          # Static assets
│   ├── favicon.ico
│   ├── index.html                   # Main HTML template
│   ├── logo192.png
│   ├── logo512.png
│   ├── manifest.json                # PWA manifest
│   └── robots.txt
├── src/                             # Source code
│   ├── components/                  # React components
│   │   ├── common/                  # Shared/reusable components
│   │   │   └── forms/               # Form-related components
│   │   │       ├── FormPreview.jsx  # Form preview with device simulation
│   │   │       └── ...
│   │   ├── home.jsx                 # Main application shell
│   │   ├── login/                   # Authentication components
│   │   │   ├── AuthContext.jsx      # Authentication context provider
│   │   │   ├── Login.jsx            # Login form component
│   │   │   └── Logout.jsx           # Logout functionality
│   │   └── modules/                 # Feature modules
│   │       ├── datacapture/         # Data capture module
│   │       ├── dqmgmt/              # Data quality management
│   │       ├── trialdesign/         # Study design module
│   │       └── usermanagement/      # User administration
│   ├── services/                    # API service layer
│   │   ├── ApiService.js            # Base HTTP client
│   │   ├── FormService.js           # Form management APIs
│   │   ├── StudyService.js          # Study management APIs
│   │   ├── UserService.js           # User management APIs
│   │   └── ...
│   ├── config.js                    # Application configuration
│   ├── App.jsx                      # Root application component
│   ├── App.css                      # Global styles
│   └── index.jsx                    # Application entry point
├── package.json                     # Project dependencies and scripts
├── tailwind.config.js               # Tailwind CSS configuration
└── postcss.config.js                # PostCSS configuration
```

## Core Architecture Patterns

### 1. Module-Based Architecture
The application is organized into distinct modules, each handling specific business domains:

- **Study Design**: Study registration, form design, visit management
- **Data Capture**: Subject enrollment, data entry, visit tracking
- **User Management**: User administration, organization management, role management
- **Data Quality Management**: Query management, data verification

### 2. Service Layer Pattern
All API communications are abstracted through service classes:

```javascript
// Example: FormService.js
class FormService {
  async getForms() {
    try {
      const response = await ApiService.get('/study-design-ws/api/forms');
      return response.data;
    } catch (error) {
      console.error('Error fetching forms:', error);
      return this.getMockForms(); // Fallback to mock data
    }
  }
}
```

### 3. Context-Based State Management
Authentication and global state managed through React Context:

```javascript
// AuthContext provides authentication state across the app
const { user, login, logout } = useAuth();
```

### 4. Route-Based Code Splitting
Each module implements its own routing structure with lazy loading capabilities.

## Module Detailed Architecture

### Study Design Module (`/components/modules/trialdesign/`)

**Purpose**: Comprehensive study management and form design capabilities

**Key Components**:
- `StudyDesignModule.jsx` - Main routing and navigation
- `StudyRegister.jsx` - Study registration and creation
- `StudyOverviewDashboard.jsx` - Study overview with action buttons
- `FormList.jsx` - Study-aware form management (context-sensitive)
- `FormBindingDesigner.jsx` - Visit-form association management
- `CRFBuilderIntegration.jsx` - Form builder integration point

**Routing Structure**:
```javascript
/study-design/
├── / (dashboard)
├── /register (study creation)
├── /studies (study list)
├── /studies/:studyId (study overview)
├── /study/:studyId/forms/* (study-specific form management)
└── /study/:studyId/visits/* (visit management)
```

**Key Features**:
- Study-aware form management with context detection
- Form binding to visit schedules
- Study lifecycle management
- Multi-organization study support

### Data Capture Module (`/components/modules/datacapture/`)

**Purpose**: Clinical data entry and subject management

**Key Components**:
- `DataCaptureModule.jsx` - Module routing
- `SubjectList.jsx` - Subject enrollment overview
- `SubjectEnrollment.jsx` - New subject registration
- `SubjectDetails.jsx` - Individual subject management
- `forms/FormEntry.jsx` - Clinical data entry interface
- `forms/FormView.jsx` - Read-only form viewing
- `visits/VisitDetails.jsx` - Visit-specific data management

**Routing Structure**:
```javascript
/datacapture-management/
├── / (subject list)
├── /enroll (subject enrollment)
├── /subjects/:subjectId (subject details)
├── /subjects/:subjectId/visits/:visitId (visit details)
├── /subjects/:subjectId/visits/:visitId/forms/:formId/entry (data entry)
└── /subjects/:subjectId/visits/:visitId/forms/:formId/view (data viewing)
```

### User Management Module (`/components/modules/usermanagement/`)

**Purpose**: System administration and user management

**Key Components**:
- `UserManagementModule.jsx` - Administration routing
- `UserManagementDashboard.jsx` - Admin dashboard
- `UserList.jsx` / `UserForm.jsx` - User management
- `UserTypeList.jsx` / `UserTypeForm.jsx` - User type management
- `OrganizationList.jsx` / `OrganizationForm.jsx` - Organization management

**Routing Structure**:
```javascript
/user-management/
├── / (admin dashboard)
├── /users (user management)
├── /users/create (user creation)
├── /users/edit/:userId (user editing)
├── /usertypes (user type management)
├── /organizations (organization management)
└── /organizations/view/:id (organization details)
```

## Service Layer Architecture

### Base API Service (`ApiService.js`)
Centralized HTTP client with:
- Request/response interceptors
- Error handling
- Authentication header management
- Base URL configuration

### Domain-Specific Services

**FormService.js**:
- Form CRUD operations
- Form versioning
- Study-form associations
- Visit-form binding
- Mock data fallbacks for development

**StudyService.js**:
- Study lifecycle management
- Multi-organization study support
- Study lookup data (phases, statuses)
- Dashboard metrics
- Debug utilities

**UserService.js**:
- User authentication
- Profile management
- Role assignment

**OrganizationService.js**:
- Organization management
- Contact management
- Organization-study relationships

## Key Frontend Features

### 1. Study-Aware Form Management
Forms are managed in the context of specific studies, with enhanced UI showing:
- Study context headers
- Study-specific navigation
- Enhanced table columns for study information

### 2. Responsive Design
Built with Tailwind CSS for:
- Mobile-first responsive design
- Consistent design system
- Utility-based styling approach

### 3. Form Builder Integration
- FormPreview component with device simulation (mobile, tablet, desktop)
- Field palette and drag-drop capabilities
- Real-time form rendering and validation

### 4. Mock Data Support
All services include comprehensive mock data for:
- Development without backend dependencies
- Testing and demonstration
- Progressive development approach

### 5. Progressive Enhancement
- Graceful degradation when backend services unavailable
- Client-side validation with server-side backup
- Optimistic UI updates with error handling

## State Management Patterns

### 1. Component State
Local state management using React hooks:
```javascript
const [studies, setStudies] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
```

### 2. Context State
Global state through React Context:
```javascript
// Authentication context
const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);
```

### 3. URL State
Route parameters and query strings for:
- Study ID context
- Form editing state
- Pagination and filtering

## Error Handling Strategy

### 1. Service Level
```javascript
try {
  const response = await ApiService.get(url);
  return response.data;
} catch (error) {
  console.error('Service error:', error);
  return mockData; // Fallback to mock data
}
```

### 2. Component Level
```javascript
const [error, setError] = useState(null);

useEffect(() => {
  fetchData().catch(err => setError(err.message));
}, []);
```

### 3. Global Error Boundaries
React Error Boundaries for catching and displaying unexpected errors.

## Performance Considerations

### 1. Code Splitting
- Route-based code splitting with React Router
- Module-based lazy loading
- Dynamic imports for large components

### 2. Memoization
- React.memo for expensive components
- useMemo and useCallback for optimization
- Preventing unnecessary re-renders

### 3. Data Loading
- Loading states for better UX
- Optimistic updates where appropriate
- Efficient API call patterns

## Development Workflow

### Available Scripts
```bash
npm start          # Development server (http://localhost:3000)
npm run build      # Production build
npm test           # Test runner
npm run eject      # Eject from Create React App (not recommended)
```

### Environment Configuration
- Development API endpoints in config.js
- Environment-specific builds
- Debug utilities for development

### Code Quality
- ESLint configuration for code standards
- React-specific linting rules
- Consistent formatting and style guidelines

## Integration Points

### Backend Integration
- RESTful API communication through service layer
- Standardized error handling and response formats
- Authentication token management

### Database Integration
- No direct database access (through backend services)
- Optimistic UI updates with server confirmation
- Local state synchronization with server state

## Future Enhancements

### Planned Features
1. Real-time collaboration capabilities
2. Advanced form builder with conditional logic
3. Offline data entry with synchronization
4. Enhanced reporting and analytics dashboard
5. Mobile application development
6. Progressive Web App (PWA) capabilities

### Technical Improvements
1. State management library integration (Redux Toolkit)
2. GraphQL API adoption
3. Micro-frontend architecture
4. Enhanced testing coverage
5. Performance monitoring and analytics
6. Internationalization (i18n) support

This frontend architecture provides a solid foundation for a scalable clinical trial management system with modern React patterns, comprehensive error handling, and developer-friendly features.