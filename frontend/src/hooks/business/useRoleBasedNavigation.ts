import { useAuth } from '../../contexts/AuthContext';

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * User roles in the RBAC system
 */
export type UserRole =
  | 'SYSTEM_ADMIN'
  | 'PRINCIPAL_INVESTIGATOR'
  | 'STUDY_COORDINATOR'
  | 'DATA_MANAGER'
  | 'CRA'
  | 'SITE_USER'
  | 'MEDICAL_CODER'
  | 'AUDITOR';

/**
 * Module keys available in the application
 */
export type ModuleKey =
  | 'study-design'
  | 'datacapture-management'
  | 'dq-management'
  | 'user-management'
  | 'subject-management'
  | 'audit-trail'
  | 'medical-coding'
  | 'reports'
  | 'data-integration'
  | 'system-monitoring';

/**
 * Module category keys
 */
export type ModuleCategoryKey =
  | 'study-management'
  | 'clinical-operations'
  | 'data-quality'
  | 'clinical-analytics'
  | 'system-integration';

/**
 * Module category configuration
 */
export interface ModuleCategory {
  modules: ModuleKey[];
  color: string;
  requiredRoles: UserRole[];
}

/**
 * Permission levels for a module
 */
export interface ModulePermissions {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canExport: boolean;
  canManageUsers: boolean;
  canViewAuditTrail: boolean;
}

/**
 * Return type of useRoleBasedNavigation hook
 */
export interface RoleBasedNavigationHook {
  userRole: UserRole;
  userRoleDisplay: string;
  hasModuleAccess: (moduleKey: ModuleKey) => boolean;
  hasCategoryAccess: (categoryKey: ModuleCategoryKey) => boolean;
  getAccessibleModules: () => ModuleKey[];
  getModulePermissions: (moduleKey: ModuleKey) => ModulePermissions;
  moduleCategories: Record<ModuleCategoryKey, ModuleCategory>;
}

// ============================================================================
// Constants
// ============================================================================

/**
 * Role mapping from backend roles to RBAC roles
 */
const roleMapping: Record<string, UserRole> = {
  'USER': 'SITE_USER',           // Map generic USER to SITE_USER
  'ADMIN': 'SYSTEM_ADMIN',       // Map ADMIN to SYSTEM_ADMIN
  'PI': 'PRINCIPAL_INVESTIGATOR', // Map PI to PRINCIPAL_INVESTIGATOR
  'COORDINATOR': 'STUDY_COORDINATOR',
  'DM': 'DATA_MANAGER',
  'CRA': 'CRA',
  'CODER': 'MEDICAL_CODER',
  'AUDITOR': 'AUDITOR',
  // Direct mappings (no change needed)
  'SYSTEM_ADMIN': 'SYSTEM_ADMIN',
  'PRINCIPAL_INVESTIGATOR': 'PRINCIPAL_INVESTIGATOR',
  'STUDY_COORDINATOR': 'STUDY_COORDINATOR',
  'DATA_MANAGER': 'DATA_MANAGER',
  'MEDICAL_CODER': 'MEDICAL_CODER',
  'SITE_USER': 'SITE_USER'
};

/**
 * Define role-based access control for EDC modules
 */
const rolePermissions: Record<UserRole, ModuleKey[]> = {
  // System Administrator - Full access to all modules
  'SYSTEM_ADMIN': [
    'study-design', 'datacapture-management', 'dq-management', 'user-management',
    'subject-management', 'audit-trail', 'medical-coding', 'reports',
    'data-integration', 'system-monitoring'
  ],

  // Principal Investigator - Study management and clinical oversight
  'PRINCIPAL_INVESTIGATOR': [
    'study-design', 'datacapture-management', 'dq-management', 'subject-management',
    'medical-coding', 'reports', 'audit-trail'
  ],

  // Study Coordinator - Clinical operations focus
  'STUDY_COORDINATOR': [
    'datacapture-management', 'subject-management', 'dq-management', 'reports'
  ],

  // Data Manager - Data quality and integration
  'DATA_MANAGER': [
    'datacapture-management', 'dq-management', 'medical-coding', 'reports',
    'data-integration', 'audit-trail'
  ],

  // Clinical Research Associate - Monitoring and compliance
  'CRA': [
    'datacapture-management', 'subject-management', 'dq-management', 'reports', 'audit-trail'
  ],

  // Site User - Basic data entry
  'SITE_USER': [
    'datacapture-management', 'subject-management'
  ],

  // Medical Coder - Coding specific
  'MEDICAL_CODER': [
    'medical-coding', 'reports'
  ],

  // Auditor - Read-only access to compliance modules
  'AUDITOR': [
    'audit-trail', 'reports', 'dq-management'
  ]
};

/**
 * Module categories for role-based styling
 */
const moduleCategories: Record<ModuleCategoryKey, ModuleCategory> = {
  'study-management': {
    modules: ['study-design', 'user-management'],
    color: 'blue',
    requiredRoles: ['SYSTEM_ADMIN', 'PRINCIPAL_INVESTIGATOR', 'DATA_MANAGER']
  },
  'clinical-operations': {
    modules: ['datacapture-management', 'subject-management'],
    color: 'green',
    requiredRoles: ['SYSTEM_ADMIN', 'PRINCIPAL_INVESTIGATOR', 'STUDY_COORDINATOR', 'DATA_MANAGER', 'CRA', 'SITE_USER']
  },
  'data-quality': {
    modules: ['dq-management', 'audit-trail'],
    color: 'purple',
    requiredRoles: ['SYSTEM_ADMIN', 'PRINCIPAL_INVESTIGATOR', 'STUDY_COORDINATOR', 'DATA_MANAGER', 'CRA', 'AUDITOR']
  },
  'clinical-analytics': {
    modules: ['reports', 'medical-coding'],
    color: 'orange',
    requiredRoles: ['SYSTEM_ADMIN', 'PRINCIPAL_INVESTIGATOR', 'DATA_MANAGER', 'MEDICAL_CODER', 'CRA', 'AUDITOR']
  },
  'system-integration': {
    modules: ['data-integration', 'system-monitoring'],
    color: 'indigo',
    requiredRoles: ['SYSTEM_ADMIN', 'DATA_MANAGER']
  }
};

/**
 * Role display names
 */
const roleNames: Record<UserRole, string> = {
  'SYSTEM_ADMIN': 'System Administrator',
  'PRINCIPAL_INVESTIGATOR': 'Principal Investigator',
  'STUDY_COORDINATOR': 'Study Coordinator',
  'DATA_MANAGER': 'Data Manager',
  'CRA': 'Clinical Research Associate',
  'SITE_USER': 'Site User',
  'MEDICAL_CODER': 'Medical Coder',
  'AUDITOR': 'Auditor'
};

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * Hook for role-based navigation and access control
 *
 * Provides role-based access control functionality for module navigation,
 * permission checking, and UI rendering based on user roles.
 *
 * @returns Role-based navigation utilities and permissions
 *
 * @example
 * ```typescript
 * const { userRole, hasModuleAccess, getModulePermissions } = useRoleBasedNavigation();
 *
 * if (hasModuleAccess('study-design')) {
 *   const permissions = getModulePermissions('study-design');
 *   if (permissions.canEdit) {
 *     // Show edit button
 *   }
 * }
 * ```
 */
export const useRoleBasedNavigation = (): RoleBasedNavigationHook => {
  const { user } = useAuth();

  /**
   * Get the user's mapped role from various sources
   */
  const getUserRole = (): UserRole => {
    // Check multiple sources for user role
    const userObjectRole = user?.role;
    const localStorageRole = localStorage.getItem('userRole');

    // Prioritize localStorage role if it exists, then user object, then default
    const rawRole = localStorageRole || userObjectRole || 'USER';

    // Map the raw role to our RBAC system
    const mappedRole = roleMapping[rawRole] || 'SITE_USER';

    return mappedRole;
  };

  /**
   * Check if user has access to a specific module
   */
  const hasModuleAccess = (moduleKey: ModuleKey): boolean => {
    const userRole = getUserRole();
    const allowedModules = rolePermissions[userRole] || rolePermissions['SITE_USER'];
    return allowedModules.includes(moduleKey);
  };

  /**
   * Check if user has access to a module category
   */
  const hasCategoryAccess = (categoryKey: ModuleCategoryKey): boolean => {
    const userRole = getUserRole();
    const category = moduleCategories[categoryKey];
    return category?.requiredRoles.includes(userRole) || false;
  };

  /**
   * Get list of all accessible modules for the user
   */
  const getAccessibleModules = (): ModuleKey[] => {
    const userRole = getUserRole();
    return rolePermissions[userRole] || rolePermissions['SITE_USER'];
  };

  /**
   * Get detailed permissions for a specific module
   */
  const getModulePermissions = (moduleKey: ModuleKey): ModulePermissions => {
    const userRole = getUserRole();
    const hasAccess = hasModuleAccess(moduleKey);

    // Define permission levels based on role
    const permissions: ModulePermissions = {
      canView: hasAccess,
      canEdit: hasAccess && !['AUDITOR'].includes(userRole),
      canDelete: hasAccess && ['SYSTEM_ADMIN', 'PRINCIPAL_INVESTIGATOR'].includes(userRole),
      canExport: hasAccess && !['SITE_USER'].includes(userRole),
      canManageUsers: ['SYSTEM_ADMIN'].includes(userRole),
      canViewAuditTrail: ['SYSTEM_ADMIN', 'PRINCIPAL_INVESTIGATOR', 'DATA_MANAGER', 'CRA', 'AUDITOR'].includes(userRole)
    };

    return permissions;
  };

  /**
   * Get display name for user's role
   */
  const getUserRoleDisplay = (): string => {
    const role = getUserRole();
    return roleNames[role] || 'User';
  };

  return {
    userRole: getUserRole(),
    userRoleDisplay: getUserRoleDisplay(),
    hasModuleAccess,
    hasCategoryAccess,
    getAccessibleModules,
    getModulePermissions,
    moduleCategories
  };
};
