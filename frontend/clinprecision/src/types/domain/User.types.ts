// src/types/domain/User.types.ts

/**
 * User and Authentication Type Definitions
 * Domain: User Management, Authentication, Authorization
 */

// ============================================================================
// ENUMS
// ============================================================================

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

// ============================================================================
// AUTHENTICATION TYPES
// ============================================================================

/**
 * Login credentials
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
  userId: string;           // String username
  userNumericId: string;    // Long numeric ID for API calls
  userEmail: string;
  userRole: string;
  userName: string;         // User's display name
}

/**
 * Login response
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

// ============================================================================
// USER TYPES
// ============================================================================

/**
 * Core user entity
 */
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
