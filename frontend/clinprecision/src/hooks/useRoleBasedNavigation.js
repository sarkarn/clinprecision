import { useAuth } from '../components/login/AuthContext';

// Role mapping from backend roles to RBAC roles
const roleMapping = {
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

// Define role-based access control for EDC modules
const rolePermissions = {
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

// Module categories for role-based styling
const moduleCategories = {
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

export const useRoleBasedNavigation = () => {
    const { user } = useAuth();
    
    const getUserRole = () => {
        // Check multiple sources for user role
        const userObjectRole = user?.role || user?.roles?.[0];
        const localStorageRole = localStorage.getItem('userRole');
        
        // Prioritize localStorage role if it exists, then user object, then default
        const rawRole = localStorageRole || userObjectRole || 'USER';
        
        // Map the raw role to our RBAC system
        const mappedRole = roleMapping[rawRole] || 'SITE_USER';
        
        return mappedRole;
    };

    const hasModuleAccess = (moduleKey) => {
        const userRole = getUserRole();
        const allowedModules = rolePermissions[userRole] || rolePermissions['SITE_USER'];
        const hasAccess = allowedModules.includes(moduleKey);
        return hasAccess;
    };

    const hasCategoryAccess = (categoryKey) => {
        const userRole = getUserRole();
        const category = moduleCategories[categoryKey];
        const hasAccess = category?.requiredRoles.includes(userRole) || false;
        return hasAccess;
    };

    const getAccessibleModules = () => {
        const userRole = getUserRole();
        return rolePermissions[userRole] || rolePermissions['SITE_USER'];
    };

    const getModulePermissions = (moduleKey) => {
        const userRole = getUserRole();
        const hasAccess = hasModuleAccess(moduleKey);
        
        // Define permission levels
        const permissions = {
            canView: hasAccess,
            canEdit: hasAccess && !['AUDITOR'].includes(userRole),
            canDelete: hasAccess && ['SYSTEM_ADMIN', 'PRINCIPAL_INVESTIGATOR'].includes(userRole),
            canExport: hasAccess && !['SITE_USER'].includes(userRole),
            canManageUsers: ['SYSTEM_ADMIN'].includes(userRole),
            canViewAuditTrail: ['SYSTEM_ADMIN', 'PRINCIPAL_INVESTIGATOR', 'DATA_MANAGER', 'CRA', 'AUDITOR'].includes(userRole)
        };

        return permissions;
    };

    const getUserRoleDisplay = () => {
        const role = getUserRole();
        const roleNames = {
            'SYSTEM_ADMIN': 'System Administrator',
            'PRINCIPAL_INVESTIGATOR': 'Principal Investigator',
            'STUDY_COORDINATOR': 'Study Coordinator',
            'DATA_MANAGER': 'Data Manager',
            'CRA': 'Clinical Research Associate',
            'SITE_USER': 'Site User',
            'MEDICAL_CODER': 'Medical Coder',
            'AUDITOR': 'Auditor'
        };
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