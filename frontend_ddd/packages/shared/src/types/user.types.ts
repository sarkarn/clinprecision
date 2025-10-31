/**
 * User and Authentication Type Definitions
 * Types for user management, authentication, authorization, and security
 */

import type { BaseEntity, EntityStatus } from './common.types ';

// ============================================================================
// User Enums
// ============================================================================

/**
 * User role types
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

/**
 * Assignment status for user-study roles
 */
export enum AssignmentStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
  EXPIRED = 'EXPIRED',
}

// ============================================================================
// Authentication Types
// ============================================================================

/**
 * Login credentials
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Authentication data
 */
export interface AuthData {
  token: string;
  userId: string;
  userNumericId: string;
  userEmail: string;
  userRole: string;
  userName: string;
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

/**
 * Authentication constants
 */
export const DEFAULT_TOKEN_EXPIRATION_MS = 24 * 60 * 60 * 1000;
export const LOGIN_ENDPOINT = '/users-ws/users/login';
export const LOGOUT_ENDPOINT = '/users-ws/users/logout';

// ============================================================================
// User Entity
// ============================================================================

/**
 * User entity
 */
export interface User extends BaseEntity {
  userId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  userName?: string;
  role: string;
  status: UserStatus | string;
  lastLoginAt?: string;
}

/**
 * User profile
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

// ============================================================================
// User Management Requests
// ============================================================================

/**
 * Create user request
 */
export interface CreateUserRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  userName?: string;
  role: string;
  status?: UserStatus | string;
  phoneNumber?: string;
  organization?: string;
}

/**
 * Update user request
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
 * Change password request
 */
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Reset password request
 */
export interface ResetPasswordRequest {
  email: string;
}

/**
 * Reset password confirmation
 */
export interface ResetPasswordConfirmRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

// ============================================================================
// Role Types
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
 * Create role request
 */
export interface CreateRoleRequest {
  name: string;
  description?: string;
  isSystemRole?: boolean;
  permissions?: string[];
}

/**
 * Update role request
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
// User Type Types
// ============================================================================

/**
 * User type entity
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
 * Create user type request
 */
export interface CreateUserTypeRequest {
  name: string;
  description?: string;
  code?: string;
  isActive?: boolean;
}

/**
 * Update user type request
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
// Permission Types
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
// Session Types
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
// User-Study Role Types
// ============================================================================

/**
 * User study role assignment
 */
export interface UserStudyRole {
  id: string;
  userId: string;
  userNumericId?: string;
  studyId: string;
  roleId: string;
  roleName?: string;
  studySiteId?: string;
  status: AssignmentStatus | string;
  startDate: string;
  endDate?: string | null;
  assignedBy: string;
  createdAt: string;
  updatedAt?: string;
  notes?: string;
}

/**
 * User study role with details
 */
export interface UserStudyRoleWithDetails extends UserStudyRole {
  userEmail?: string;
  userName?: string;
  studyName?: string;
  siteName?: string;
  roleDescription?: string;
  rolePermissions?: string[];
  isPrimaryRole?: boolean;
  rolePriority?: number;
}


interface NewMemberForm {
    userId: string;
    roleCode: string;
    startDate: string;
    endDate: string;
    active: boolean;
}

/**
 * Study team member
 */
export interface StudyTeamMember {
  id: number | string;
  userId: string;
  userNumericId?: string;
  userEmail: string;
  userName: string;
  userType?: string;
  roles: Array<{
    roleId: string;
    roleName: string;
    assignmentId: string;
    startDate: string;
    endDate?: string | null;
    isPrimary?: boolean;
    priority?: number;
  }>;
  primaryRole?: string;
  permissions?: string[];
  status: AssignmentStatus | string;
  startDate: string;
  endDate?: string;
  joinedDate: string;
  lastActiveDate?: string;
  active: boolean;
}

// ============================================================================
// User-Study Role Requests
// ============================================================================

/**
 * Create user study role request
 */
export interface CreateUserStudyRoleRequest {
  userId: string;
  userNumericId?: string;
  studyId: string;
  roleId: string;
  studySiteId?: string;
  startDate?: string;
  endDate?: string | null;
  assignedBy: string;
  notes?: string;
  isPrimaryRole?: boolean;
}

/**
 * Update user study role request
 */
export interface UpdateUserStudyRoleRequest {
  roleId?: string;
  studySiteId?: string;
  status?: AssignmentStatus | string;
  startDate?: string;
  endDate?: string | null;
  notes?: string;
  isPrimaryRole?: boolean;
  updatedBy: string;
}

/**
 * Bulk create user study roles request
 */
export interface BulkCreateUserStudyRolesRequest {
  assignments: CreateUserStudyRoleRequest[];
  assignedBy: string;
}

/**
 * Bulk deactivate user study roles request
 */
export interface BulkDeactivateUserStudyRolesRequest {
  ids: string[];
  endDate: string;
  updatedBy: string;
  reason?: string;
}

// ============================================================================
// User-Study Role Responses
// ============================================================================

/**
 * User study role response
 */
export interface UserStudyRoleResponse {
  assignment: UserStudyRole;
  success: boolean;
  message?: string;
}

/**
 * User study roles list response
 */
export interface UserStudyRolesResponse {
  assignments: UserStudyRole[];
  totalCount: number;
  success: boolean;
}

/**
 * User study roles with details response
 */
export interface UserStudyRolesWithDetailsResponse {
  assignments: UserStudyRoleWithDetails[];
  totalCount: number;
  success: boolean;
}

/**
 * Study team members response
 */
export interface StudyTeamMembersResponse {
  teamMembers: StudyTeamMember[];
  totalCount: number;
  studyId: string;
  success: boolean;
}

/**
 * Bulk operation response
 */
export interface BulkOperationResponse {
  successCount: number;
  failureCount: number;
  assignmentIds: string[];
  errors?: Array<{
    index: number;
    userId?: string;
    error: string;
  }>;
  success: boolean;
  message: string;
}

// ============================================================================
// Role Check Types
// ============================================================================

/**
 * User role check request
 */
export interface UserRoleCheckRequest {
  userId: string;
  studyId: string;
  roleName?: string;
  activeOnly?: boolean;
}

/**
 * User role check response
 */
export interface UserRoleCheckResponse {
  hasRole: boolean;
  isActive: boolean;
  roleDetails?: {
    roleId: string;
    roleName: string;
    assignmentId: string;
    startDate: string;
    endDate?: string | null;
  };
  success: boolean;
}

/**
 * Active role check response
 */
export interface ActiveRoleCheckResponse {
  hasActiveRole: boolean;
  activeRoles?: Array<{
    roleId: string;
    roleName: string;
    assignmentId: string;
  }>;
  success: boolean;
}

/**
 * Highest priority role response
 */
export interface HighestPriorityRoleResponse {
  role?: {
    roleId: string;
    roleName: string;
    assignmentId: string;
    priority: number;
    studyId?: string;
    studyName?: string;
  };
  allActiveRoles?: Array<{
    roleId: string;
    roleName: string;
    priority: number;
    studyId: string;
  }>;
  success: boolean;
}

// ============================================================================
// Filter and Sort Options
// ============================================================================

/**
 * User filter options
 */
export interface UserFilterOptions {
  role?: string;
  status?: UserStatus | string;
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
 * User study role filter options
 */
export interface UserStudyRoleFilterOptions {
  userId?: string;
  studyId?: string;
  roleId?: string;
  roleName?: string;
  studySiteId?: string;
  status?: AssignmentStatus | string;
  activeOnly?: boolean;
  startDateFrom?: string;
  startDateTo?: string;
  endDateFrom?: string;
  endDateTo?: string;
  assignedBy?: string;
}

/**
 * User study role sort options
 */
export interface UserStudyRoleSortOptions {
  sortBy?: 'userId' | 'studyId' | 'roleName' | 'startDate' | 'endDate' | 'status' | 'createdAt';
  sortDirection?: 'asc' | 'desc';
}

// ============================================================================
// Paginated Responses
// ============================================================================

/**
 * Paginated users response
 */
export interface PaginatedUsersResponse {
  users: User[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Paginated user study roles response
 */
export interface PaginatedUserStudyRolesResponse {
  assignments: UserStudyRoleWithDetails[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  hasMore: boolean;
  success: boolean;
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Role assignment summary
 */
export interface RoleAssignmentSummary {
  studyId: string;
  studyName?: string;
  totalMembers: number;
  activeMembers: number;
  inactiveMembers: number;
  roleDistribution: Array<{
    roleId: string;
    roleName: string;
    count: number;
  }>;
  recentAssignments?: number;
}

/**
 * User role history entry
 */
export interface UserRoleHistoryEntry {
  assignmentId: string;
  studyId: string;
  studyName?: string;
  roleId: string;
  roleName: string;
  startDate: string;
  endDate?: string | null;
  status: AssignmentStatus | string;
  durationDays?: number;
  assignedBy: string;
}

/**
 * User role history response
 */
export interface UserRoleHistoryResponse {
  userId: string;
  userName?: string;
  history: UserRoleHistoryEntry[];
  totalAssignments: number;
  activeAssignments: number;
  success: boolean;
}

// ============================================================================
// Service Interfaces
// ============================================================================

/**
 * Login service interface
 */
export interface ILoginService {
  login(email: string, password: string): Promise<LoginResponse>;
  logout(): Promise<LogoutResponse>;
  isAuthenticated(): boolean;
  getToken(): string | null;
  getUserId(): string | null;
}



// src/types/auth/Login.types.ts

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
 * Logout response structure
 */
export interface LogoutResponse {
  success: boolean;
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

export interface Assignment {
    userId: number;
    studyId: number;
    roleCode: string;
    startDate: string | null;
    endDate: string | null;
    active: boolean;
    notes: string;
}
