
/**
 * Login API endpoint
 */
export const LOGIN_ENDPOINT = '/users-ws/users/login';

/**
 * Logout API endpoint
 */
export const LOGOUT_ENDPOINT = '/users-ws/users/logout';

export const DEFAULT_TOKEN_EXPIRATION_MS = 24 * 60 * 60 * 1000;


/**
 * Authentication credentials for login
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Authentication data returned from login
 */
export interface AuthData {
  token: string;
  userId: string; // String username
  userNumericId: string; // Long numeric ID for API calls
  userEmail: string;
  userRole: string;
  userName: string; // User's display name
}

/**
 * Login response structure
 */
export interface LoginResponse {
  success: boolean;
  authData: AuthData;
}

/**
 * Logout response
 */
export interface LogoutResponse {
  success: boolean;
  message?: string;
}


/**
 * Local storage keys for authentication data
 */
export enum AuthStorageKeys {
  AUTH_TOKEN = 'authToken',
  USER_ID = 'userId',
  USER_NUMERIC_ID = 'userNumericId',
  USER_EMAIL = 'userEmail',
  USER_ROLE = 'userRole',
  USER_NAME = 'userName',
  TOKEN_EXPIRATION = 'tokenExpiration'
}


/**
 * Default token expiration time (24 hours in milliseconds)
 */



/**
 * Login service interface
 */
export interface ILoginService {
  /**
   * Authenticates a user with email and password
   * @param email - User email
   * @param password - User password
   * @returns Promise with login response data
   */
  login(email: string, password: string): Promise<LoginResponse>;

  /**
   * Logs out the current user
   * @returns Promise indicating logout success
   */
  logout(): Promise<LogoutResponse>;

  /**
   * Check if the user is authenticated (token exists and is not expired)
   * @returns True if authenticated, false otherwise
   */
  isAuthenticated(): boolean;

  /**
   * Get the current authentication token
   * @returns The authentication token or null
   */
  getToken(): string | null;

  /**
   * Get the current user ID (string username)
   * @returns The user ID or null
   */
  getUserId(): string | null;
}

/**
 * Login credentials
 */
export interface LoginCredentials {
  email: string;
  password: string;
}


/**
 * Token validation response
 */
export interface TokenValidationResponse {
  valid: boolean;
  userId?: string;
  expiresAt?: number;
}

/**
 * Authentication context state
 */
export interface AuthContextState {
  isAuthenticated: boolean;
  token: string | null;
  userId: string | null;
  userNumericId: string | null;
  userEmail: string | null;
  userRole: string | null;
  userName: string | null;
  tokenExpiration: number | null;
}


/**
 * Password change request
 */
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Password reset request
 */
export interface ResetPasswordRequest {
  email: string;
}

/**
 * Password reset confirmation
 */
export interface ResetPasswordConfirmRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}


/**
 * User role types in the system
 */
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  USER = 'USER',
  VIEWER = 'VIEWER',
  SITE_COORDINATOR = 'SITE_COORDINATOR',
  INVESTIGATOR = 'INVESTIGATOR',
  MONITOR = 'MONITOR',
  DATA_MANAGER = 'DATA_MANAGER',
    SPONSOR = 'SPONSOR',
}


/**
 * User account status
 */

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING = 'PENDING',
  LOCKED = 'LOCKED',
}

export enum AssignmentStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING = 'PENDING'
}


export interface User {
  id: number;
  userId: string;           // String username
  email: string;
  firstName?: string;
  lastName?: string;
  userName?: string;        // Display name
  role: string;
  status: UserStatus;
  createdAt?: string;
  updatedAt?: string;
  lastLoginAt?: string;
}

/**
 * User profile (extended user information)
 */
export interface UserProfile extends User {
  phoneNumber?: string;
  organization?: string;
  department?: string;
  title?: string;
  timezone?: string;
  language?: string;
  preferences?: UserPreferences;
}

/**
 * User preferences
 */
export interface UserPreferences {
  theme?: 'light' | 'dark' | 'auto';
  notifications?: boolean;
  emailNotifications?: boolean;
  dateFormat?: string;
  timeFormat?: '12h' | '24h';
}

/**
 * User creation request
 */
export interface CreateUserRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  userName?: string;
  role: string;
  status?: UserStatus;
  phoneNumber?: string;
  organization?: string;
}

/**
 * User update request
 */
export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  userName?: string;
  phoneNumber?: string;
  organization?: string;
  department?: string;
  title?: string;
  preferences?: UserPreferences;
}


// ============================================================================
// ROLE TYPES
// ============================================================================

/**
 * Role entity
 */
export interface Role {
  id: number;
  name: string;
  description?: string;
  isSystemRole: boolean;
  permissions?: string[];
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Role creation request
 */
export interface CreateRoleRequest {
  name: string;
  description?: string;
  isSystemRole?: boolean;
  permissions?: string[];
}

/**
 * Role update request
 */
export interface UpdateRoleRequest {
  name?: string;
  description?: string;
  permissions?: string[];
}

/**
 * Roles list response
 */
export interface RolesResponse {
  roles: Role[];
  totalCount: number;
}

// ============================================================================
// USER TYPE TYPES
// ============================================================================

/**
 * User type entity (different from Role)
 */
export interface UserType {
  id: number;
  name: string;
  description?: string;
  code?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * User type creation request
 */
export interface CreateUserTypeRequest {
  name: string;
  description?: string;
  code?: string;
  isActive?: boolean;
}

/**
 * User type update request
 */
export interface UpdateUserTypeRequest {
  name?: string;
  description?: string;
  code?: string;
  isActive?: boolean;
}

/**
 * User types list response
 */
export interface UserTypesResponse {
  userTypes: UserType[];
  totalCount: number;
}

// ============================================================================
// PERMISSION TYPES
// ============================================================================

/**
 * Permission entity
 */
export interface Permission {
  id: number;
  name: string;
  code: string;
  description?: string;
  resource: string;
  action: string;
  createdAt?: string;
}

/**
 * Permission check request
 */
export interface PermissionCheckRequest {
  userId: string;
  resource: string;
  action: string;
}

/**
 * Permission check response
 */
export interface PermissionCheckResponse {
  granted: boolean;
  reason?: string;
}

// ============================================================================
// SESSION TYPES
// ============================================================================

/**
 * User session
 */
export interface UserSession {
  id: string;
  userId: string;
  token: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  expiresAt: string;
  lastActivityAt?: string;
}

/**
 * Active sessions response
 */
export interface ActiveSessionsResponse {
  sessions: UserSession[];
  totalCount: number;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * User filter options
 */
export interface UserFilterOptions {
  role?: string;
  status?: UserStatus;
  searchTerm?: string;
  organization?: string;
  department?: string;
}

/**
 * User sort options
 */
export interface UserSortOptions {
  field: 'email' | 'userName' | 'role' | 'status' | 'createdAt' | 'lastLoginAt';
  order: 'asc' | 'desc';
}

/**
 * Paginated user list response
 */
export interface PaginatedUsersResponse {
  users: User[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * User study role assignment
 * Maps users to roles within specific studies
 */
export interface UserStudyRole {
  /** Assignment ID */
  id: string;
  
  /** User ID (string username) */
  userId: string;
  
  /** User numeric ID (for API calls) */
  userNumericId?: string;
  
  /** Study ID */
  studyId: string;
  
  /** Role ID */
  roleId: string;
  
  /** Role name for display */
  roleName?: string;
  
  /** Study site ID (if site-specific assignment) */
  studySiteId?: string;
  
  /** Assignment status */
  status: AssignmentStatus;
  
  /** Assignment start date */
  startDate: string;
  
  /** Assignment end date (null if ongoing) */
  endDate?: string | null;
  
  /** User who created assignment */
  assignedBy: string;
  
  /** Assignment creation timestamp */
  createdAt: string;
  
  /** Last update timestamp */
  updatedAt?: string;
  
  /** Notes about the assignment */
  notes?: string;
}

/**
 * Extended user study role with user details
 */
export interface UserStudyRoleWithDetails extends UserStudyRole {
  /** User email */
  userEmail?: string;
  
  /** User full name */
  userName?: string;
  
  /** Study name */
  studyName?: string;
  
  /** Site name (if applicable) */
  siteName?: string;
  
  /** Role description */
  roleDescription?: string;
  
  /** Role permissions */
  rolePermissions?: string[];
  
  /** Whether this is the user's primary role in the study */
  isPrimaryRole?: boolean;
  
  /** Role priority (lower number = higher priority) */
  rolePriority?: number;
}

/**
 * Study team member
 * User with their active roles in a study
 */
export interface StudyTeamMember {
  /** User ID */
  userId: string;
  
  /** User numeric ID */
  userNumericId?: string;
  
  /** User email */
  userEmail: string;
  
  /** User full name */
  userName: string;
  
  /** User type */
  userType?: string;
  
  /** Active roles in this study */
  roles: Array<{
    roleId: string;
    roleName: string;
    assignmentId: string;
    startDate: string;
    endDate?: string | null;
    isPrimary?: boolean;
    priority?: number;
  }>;
  
  /** Highest priority role */
  primaryRole?: string;
  
  /** Combined permissions from all roles */
  permissions?: string[];
  
  /** Assignment status */
  status: AssignmentStatus;
  
  /** First assignment date */
  joinedDate: string;
  
  /** Last active date */
  lastActiveDate?: string;
}

// ==================== Request/Response DTOs ====================

/**
 * Create user study role request
 */
export interface CreateUserStudyRoleRequest {
  /** User ID (required) */
  userId: string;
  
  /** User numeric ID (optional) */
  userNumericId?: string;
  
  /** Study ID (required) */
  studyId: string;
  
  /** Role ID (required) */
  roleId: string;
  
  /** Study site ID (optional) */
  studySiteId?: string;
  
  /** Start date (defaults to today) */
  startDate?: string;
  
  /** End date (null for ongoing) */
  endDate?: string | null;
  
  /** User making the assignment (required) */
  assignedBy: string;
  
  /** Notes about assignment */
  notes?: string;
  
  /** Whether this is the primary role for the user */
  isPrimaryRole?: boolean;
}

/**
 * Update user study role request
 */
export interface UpdateUserStudyRoleRequest {
  /** Role ID (optional) */
  roleId?: string;
  
  /** Study site ID (optional) */
  studySiteId?: string;
  
  /** Assignment status (optional) */
  status?: AssignmentStatus;
  
  /** Start date (optional) */
  startDate?: string;
  
  /** End date (optional) */
  endDate?: string | null;
  
  /** Notes (optional) */
  notes?: string;
  
  /** Whether this is primary role (optional) */
  isPrimaryRole?: boolean;
  
  /** User making the update (required for audit) */
  updatedBy: string;
}

/**
 * Bulk create user study roles request
 */
export interface BulkCreateUserStudyRolesRequest {
  /** Array of role assignments */
  assignments: CreateUserStudyRoleRequest[];
  
  /** User making the bulk assignment */
  assignedBy: string;
}

/**
 * Bulk deactivate user study roles request
 */
export interface BulkDeactivateUserStudyRolesRequest {
  /** Assignment IDs to deactivate */
  ids: string[];
  
  /** End date for all assignments */
  endDate: string;
  
  /** User making the deactivation */
  updatedBy: string;
  
  /** Reason for deactivation */
  reason?: string;
}

/**
 * User study role response
 */
export interface UserStudyRoleResponse {
  /** Assignment data */
  assignment: UserStudyRole;
  
  /** Success flag */
  success: boolean;
  
  /** Message */
  message?: string;
}

/**
 * User study roles list response
 */
export interface UserStudyRolesResponse {
  /** Array of assignments */
  assignments: UserStudyRole[];
  
  /** Total count */
  totalCount: number;
  
  /** Success flag */
  success: boolean;
}

/**
 * User study roles with details response
 */
export interface UserStudyRolesWithDetailsResponse {
  /** Array of assignments with details */
  assignments: UserStudyRoleWithDetails[];
  
  /** Total count */
  totalCount: number;
  
  /** Success flag */
  success: boolean;
}

/**
 * Study team members response
 */
export interface StudyTeamMembersResponse {
  /** Array of team members */
  teamMembers: StudyTeamMember[];
  
  /** Total count */
  totalCount: number;
  
  /** Study ID */
  studyId: string;
  
  /** Success flag */
  success: boolean;
}

/**
 * Bulk operation response
 */
export interface BulkOperationResponse {
  /** Number of successful operations */
  successCount: number;
  
  /** Number of failed operations */
  failureCount: number;
  
  /** Created/updated assignment IDs */
  assignmentIds: string[];
  
  /** Error details (if any) */
  errors?: Array<{
    index: number;
    userId?: string;
    error: string;
  }>;
  
  /** Success flag */
  success: boolean;
  
  /** Message */
  message: string;
}

// ==================== Permission Check ====================

/**
 * User role check request
 */
export interface UserRoleCheckRequest {
  /** User ID */
  userId: string;
  
  /** Study ID */
  studyId: string;
  
  /** Role name to check (optional) */
  roleName?: string;
  
  /** Check for active assignment only */
  activeOnly?: boolean;
}

/**
 * User role check response
 */
export interface UserRoleCheckResponse {
  /** Whether user has the role */
  hasRole: boolean;
  
  /** Whether assignment is active */
  isActive: boolean;
  
  /** Role details (if has role) */
  roleDetails?: {
    roleId: string;
    roleName: string;
    assignmentId: string;
    startDate: string;
    endDate?: string | null;
  };
  
  /** Success flag */
  success: boolean;
}

/**
 * Active role check response
 */
export interface ActiveRoleCheckResponse {
  /** Whether user has active role in study */
  hasActiveRole: boolean;
  
  /** Active roles */
  activeRoles?: Array<{
    roleId: string;
    roleName: string;
    assignmentId: string;
  }>;
  
  /** Success flag */
  success: boolean;
}

/**
 * Highest priority role response
 */
export interface HighestPriorityRoleResponse {
  /** Highest priority role (if any) */
  role?: {
    roleId: string;
    roleName: string;
    assignmentId: string;
    priority: number;
    studyId?: string;
    studyName?: string;
  };
  
  /** All active roles (sorted by priority) */
  allActiveRoles?: Array<{
    roleId: string;
    roleName: string;
    priority: number;
    studyId: string;
  }>;
  
  /** Success flag */
  success: boolean;
}

// ==================== Filter & Sort Options ====================

/**
 * User study role filter options
 */
export interface UserStudyRoleFilterOptions {
  /** Filter by user ID */
  userId?: string;
  
  /** Filter by study ID */
  studyId?: string;
  
  /** Filter by role ID */
  roleId?: string;
  
  /** Filter by role name */
  roleName?: string;
  
  /** Filter by study site ID */
  studySiteId?: string;
  
  /** Filter by status */
  status?: AssignmentStatus;
  
  /** Filter active assignments only */
  activeOnly?: boolean;
  
  /** Filter by start date (from) */
  startDateFrom?: string;
  
  /** Filter by start date (to) */
  startDateTo?: string;
  
  /** Filter by end date (from) */
  endDateFrom?: string;
  
  /** Filter by end date (to) */
  endDateTo?: string;
  
  /** Filter by assigned by user */
  assignedBy?: string;
}

/**
 * User study role sort options
 */
export interface UserStudyRoleSortOptions {
  /** Sort field */
  sortBy?: 'userId' | 'studyId' | 'roleName' | 'startDate' | 'endDate' | 'status' | 'createdAt';
  
  /** Sort direction */
  sortDirection?: 'asc' | 'desc';
}

/**
 * Paginated user study roles response
 */
export interface PaginatedUserStudyRolesResponse {
  /** Assignments for current page */
  assignments: UserStudyRoleWithDetails[];
  
  /** Total count across all pages */
  totalCount: number;
  
  /** Current page number */
  currentPage: number;
  
  /** Page size */
  pageSize: number;
  
  /** Total pages */
  totalPages: number;
  
  /** Whether there are more pages */
  hasMore: boolean;
  
  /** Success flag */
  success: boolean;
}

// ==================== Utility Types ====================

/**
 * Role assignment summary
 */
export interface RoleAssignmentSummary {
  /** Study ID */
  studyId: string;
  
  /** Study name */
  studyName?: string;
  
  /** Total team members */
  totalMembers: number;
  
  /** Active team members */
  activeMembers: number;
  
  /** Inactive team members */
  inactiveMembers: number;
  
  /** Role distribution */
  roleDistribution: Array<{
    roleId: string;
    roleName: string;
    count: number;
  }>;
  
  /** Recent assignments (last 7 days) */
  recentAssignments?: number;
}

/**
 * User role history entry
 */
export interface UserRoleHistoryEntry {
  /** Assignment ID */
  assignmentId: string;
  
  /** Study ID */
  studyId: string;
  
  /** Study name */
  studyName?: string;
  
  /** Role ID */
  roleId: string;
  
  /** Role name */
  roleName: string;
  
  /** Start date */
  startDate: string;
  
  /** End date */
  endDate?: string | null;
  
  /** Status */
  status: AssignmentStatus;
  
  /** Duration in days (if ended) */
  durationDays?: number;
  
  /** Assigned by */
  assignedBy: string;
}

/**
 * User role history response
 */
export interface UserRoleHistoryResponse {
  /** User ID */
  userId: string;
  
  /** User name */
  userName?: string;
  
  /** Role history entries */
  history: UserRoleHistoryEntry[];
  
  /** Total assignments (all time) */
  totalAssignments: number;
  
  /** Active assignments */
  activeAssignments: number;
  
  /** Success flag */
  success: boolean;
}

