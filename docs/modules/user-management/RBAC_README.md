# Role-Based Access Control (RBAC) System
## ClinPrecision EDC Platform

---

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Role Definitions](#role-definitions)
- [Module Organization](#module-organization)
- [Implementation Guide](#implementation-guide)
- [API Reference](#api-reference)
- [Security Features](#security-features)
- [Testing](#testing)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

The ClinPrecision EDC platform implements a comprehensive **Role-Based Access Control (RBAC)** system designed specifically for clinical trial management. This system ensures that users only access functionality appropriate to their clinical role while maintaining regulatory compliance and data security.

### Key Features

- ✅ **8 Distinct Clinical Roles** with granular permissions
- ✅ **Module-Level Access Control** for EDC components
- ✅ **Category-Based Organization** by clinical workflow
- ✅ **Dynamic Navigation** that adapts to user permissions
- ✅ **Professional EDC Interface** with clinical terminology
- ✅ **Compliance-Ready** (FDA 21 CFR Part 11, ICH GCP, HIPAA)
- ✅ **Real-Time Permission Enforcement**
- ✅ **Comprehensive Audit Trail**

---

## 🏗️ Architecture

### Core Components

```
📁 RBAC System Structure
├── 🔧 hooks/
│   └── useRoleBasedNavigation.js    # Core RBAC logic & permissions
├── 🖥️ components/
│   ├── home.jsx                     # Main navigation with RBAC
│   ├── RoleManagement.jsx           # User role administration
│   ├── RoleTester.jsx              # Permission testing interface
│   └── shared/
│       └── BreadcrumbNavigation.jsx # Contextual navigation
└── 📚 documentation/
    └── RBAC_README.md              # This documentation
```

### Technology Stack

- **Frontend**: React 18 with Hooks
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **Authentication**: Custom AuthContext
- **State Management**: React Hooks
- **Security**: Role-based permissions with real-time validation

---

## 👥 Role Definitions

### Clinical Role Hierarchy

| Role | Code | Access Level | Primary Responsibility |
|------|------|-------------|----------------------|
| 🔴 **System Administrator** | `SYSTEM_ADMIN` | Full Access | System management & user administration |
| 🟣 **Principal Investigator** | `PRINCIPAL_INVESTIGATOR` | Study Oversight | Clinical decision-making & protocol management |
| 🔵 **Study Coordinator** | `STUDY_COORDINATOR` | Clinical Operations | Patient coordination & data management |
| 🟢 **Data Manager** | `DATA_MANAGER` | Data Focus | Data quality & system integration |
| 🟡 **Clinical Research Associate** | `CRA` | Monitoring & Compliance | Site monitoring & audit compliance |
| ⚪ **Site User** | `SITE_USER` | Basic Data Entry | Patient data entry & basic operations |
| 🟠 **Medical Coder** | `MEDICAL_CODER` | Coding Specialist | Medical coding & adverse event management |
| 🟤 **Auditor** | `AUDITOR` | Read-Only Compliance | Audit review & compliance verification |

### Detailed Role Permissions

#### 🔴 System Administrator
```javascript
Modules: ALL (10/10)
Permissions: {
  canView: ✅ All modules
  canEdit: ✅ All modules  
  canDelete: ✅ All modules
  canExport: ✅ All modules
  canManageUsers: ✅ Full user management
  canViewAuditTrail: ✅ Complete audit access
}
```

#### 🟣 Principal Investigator
```javascript
Modules: study-design, datacapture-management, dq-management, 
         subject-management, medical-coding, reports, audit-trail (7/10)
Permissions: {
  canView: ✅ Assigned modules
  canEdit: ✅ Clinical data & protocols
  canDelete: ✅ Study-related data
  canExport: ✅ Clinical reports
  canManageUsers: ❌ No user admin
  canViewAuditTrail: ✅ Study audit data
}
```

#### 🔵 Study Coordinator
```javascript
Modules: datacapture-management, subject-management, 
         dq-management, reports (4/10)
Permissions: {
  canView: ✅ Clinical operations
  canEdit: ✅ Patient data & quality
  canDelete: ❌ No deletion rights
  canExport: ✅ Operational reports
  canManageUsers: ❌ No user admin
  canViewAuditTrail: ❌ No audit access
}
```

#### 🟢 Data Manager
```javascript
Modules: datacapture-management, dq-management, medical-coding, 
         reports, data-integration, audit-trail (6/10)
Permissions: {
  canView: ✅ Data-focused modules
  canEdit: ✅ Data quality & integration
  canDelete: ❌ No deletion rights
  canExport: ✅ Data reports
  canManageUsers: ❌ No user admin
  canViewAuditTrail: ✅ Data audit trail
}
```

#### 🟡 Clinical Research Associate (CRA)
```javascript
Modules: datacapture-management, subject-management, 
         dq-management, reports, audit-trail (5/10)
Permissions: {
  canView: ✅ Monitoring modules
  canEdit: ✅ Quality & compliance data
  canDelete: ❌ No deletion rights
  canExport: ✅ Monitoring reports
  canManageUsers: ❌ No user admin
  canViewAuditTrail: ✅ Compliance audit
}
```

#### ⚪ Site User
```javascript
Modules: datacapture-management, subject-management (2/10)
Permissions: {
  canView: ✅ Basic data entry
  canEdit: ✅ Patient data entry only
  canDelete: ❌ No deletion rights
  canExport: ❌ No export access
  canManageUsers: ❌ No user admin
  canViewAuditTrail: ❌ No audit access
}
```

#### 🟠 Medical Coder
```javascript
Modules: medical-coding, reports (2/10)
Permissions: {
  canView: ✅ Coding modules only
  canEdit: ✅ Medical coding data
  canDelete: ❌ No deletion rights
  canExport: ✅ Coding reports
  canManageUsers: ❌ No user admin
  canViewAuditTrail: ❌ No audit access
}
```

#### 🟤 Auditor
```javascript
Modules: audit-trail, reports, dq-management (3/10)
Permissions: {
  canView: ✅ Audit & compliance modules
  canEdit: ❌ Read-only access
  canDelete: ❌ No deletion rights
  canExport: ✅ Audit reports
  canManageUsers: ❌ No user admin
  canViewAuditTrail: ✅ Full audit access
}
```

---

## 📊 Module Organization

### Clinical Workflow Categories

#### 🔵 Study Management
**Target Roles**: System Admin, Principal Investigator, Data Manager
```javascript
Modules: [
  'study-design',      // Protocol Design (CRF)
  'user-management'    // User & Site Management (RBAC)
]
Color Theme: Blue (#3B82F6)
Focus: Protocol development & user administration
```

#### 🟢 Clinical Operations  
**Target Roles**: All clinical roles (except Auditor)
```javascript
Modules: [
  'datacapture-management',  // Data Capture & Entry (eCRF)
  'subject-management'       // Subject Management (SDV)
]
Color Theme: Green (#10B981)
Focus: Patient enrollment & data collection
```

#### 🟣 Data Quality & Compliance
**Target Roles**: System Admin, PI, Study Coordinator, Data Manager, CRA, Auditor
```javascript
Modules: [
  'dq-management',     // Data Quality & Validation (21 CFR)
  'audit-trail'        // Audit Trail (GCP)
]
Color Theme: Purple (#8B5CF6)
Focus: Quality assurance & regulatory compliance
```

#### 🟠 Clinical Analytics
**Target Roles**: System Admin, PI, Data Manager, Medical Coder, CRA, Auditor
```javascript
Modules: [
  'reports',           // Clinical Reports (CSR)
  'medical-coding'     // Medical Coding (AE)
]
Color Theme: Orange (#F59E0B)
Focus: Data analysis & reporting
```

#### 🟦 System Integration
**Target Roles**: System Admin, Data Manager
```javascript
Modules: [
  'data-integration',   // Data Integration (API)
  'system-monitoring'   // System Monitoring (SLA)
]
Color Theme: Indigo (#6366F1)
Focus: Technical integration & system health
```

---

## 🛠️ Implementation Guide

### 1. Setup Role-Based Navigation Hook

```javascript
// src/hooks/useRoleBasedNavigation.js
import { useAuth } from '../components/login/AuthContext';

export const useRoleBasedNavigation = () => {
    const { user } = useAuth();
    
    const getUserRole = () => {
        return user?.role || user?.roles?.[0] || 'SITE_USER';
    };

    const hasModuleAccess = (moduleKey) => {
        const userRole = getUserRole();
        const allowedModules = rolePermissions[userRole] || [];
        return allowedModules.includes(moduleKey);
    };

    // ... additional methods
};
```

### 2. Implement Protected Navigation

```jsx
// src/components/home.jsx
import { useRoleBasedNavigation } from '../hooks/useRoleBasedNavigation';

export default function Home() {
    const { hasModuleAccess, hasCategoryAccess } = useRoleBasedNavigation();

    return (
        <div>
            {/* Study Management Section */}
            {hasCategoryAccess('study-management') && (
                <div className="mb-8">
                    {hasModuleAccess('study-design') && (
                        <Link to="/study-design">Protocol Design</Link>
                    )}
                    {hasModuleAccess('user-management') && (
                        <Link to="/user-management">User Management</Link>
                    )}
                </div>
            )}
        </div>
    );
}
```

### 3. Protect Individual Components

```jsx
// src/components/ProtectedComponent.jsx
import { useRoleBasedNavigation } from '../hooks/useRoleBasedNavigation';

const ProtectedComponent = ({ requiredModule, children }) => {
    const { hasModuleAccess } = useRoleBasedNavigation();
    
    if (!hasModuleAccess(requiredModule)) {
        return <AccessDenied />;
    }
    
    return children;
};
```

### 4. Add Permission-Based UI Elements

```jsx
// Conditional rendering based on permissions
const { getModulePermissions } = useRoleBasedNavigation();
const permissions = getModulePermissions('user-management');

{permissions.canEdit && (
    <button>Edit User</button>
)}

{permissions.canDelete && (
    <button>Delete User</button>
)}

{permissions.canExport && (
    <button>Export Data</button>
)}
```

---

## 🔌 API Reference

### useRoleBasedNavigation Hook

```javascript
const {
    userRole,              // Current user role code
    userRoleDisplay,       // Formatted role display name
    hasModuleAccess,       // Check module access: (moduleKey) => boolean
    hasCategoryAccess,     // Check category access: (categoryKey) => boolean
    getAccessibleModules,  // Get user's accessible modules: () => string[]
    getModulePermissions,  // Get detailed permissions: (moduleKey) => object
    moduleCategories       // Available module categories
} = useRoleBasedNavigation();
```

### Permission Object Structure

```javascript
{
    canView: boolean,           // Can view the module
    canEdit: boolean,           // Can edit data in the module
    canDelete: boolean,         // Can delete data in the module
    canExport: boolean,         // Can export data from the module
    canManageUsers: boolean,    // Can manage user accounts
    canViewAuditTrail: boolean  // Can access audit trail
}
```

### Role Permission Mapping

```javascript
const rolePermissions = {
    'SYSTEM_ADMIN': ['all-modules'],
    'PRINCIPAL_INVESTIGATOR': ['study-design', 'datacapture-management', ...],
    'STUDY_COORDINATOR': ['datacapture-management', 'subject-management', ...],
    // ... other roles
};
```

---

## 🔒 Security Features

### Access Control Mechanisms

1. **Real-Time Permission Validation**
   - Every navigation action is validated against user permissions
   - Dynamic menu rendering based on role access
   - Component-level protection with access denied screens

2. **Principle of Least Privilege**
   - Users receive minimum necessary access for their role
   - Granular permissions prevent unauthorized actions
   - Role-based data filtering

3. **Audit Trail Integration**
   - All access attempts are logged
   - Permission changes are tracked
   - User activity monitoring

4. **Session Management**
   - Role verification on every request
   - Automatic session timeout
   - Permission refresh on role changes

### Security Best Practices

```javascript
// Always validate permissions before rendering
{hasModuleAccess('sensitive-module') && (
    <SensitiveComponent />
)}

// Use permission objects for granular control
const permissions = getModulePermissions('module-name');
if (permissions.canEdit) {
    // Show edit interface
}

// Validate on both frontend and backend
// Frontend for UX, backend for security
```

---

## 🧪 Testing

### Role Testing Component

The system includes a comprehensive testing interface (`RoleTester.jsx`) for validating role permissions:

```javascript
// Features:
✅ Role switching simulation
✅ Access matrix visualization  
✅ Permission detail inspection
✅ Category access validation
✅ Module-level testing
```

### Testing Scenarios

1. **Role Switching Tests**
   - Switch between all 8 roles
   - Verify navigation menu changes
   - Confirm access restrictions

2. **Permission Validation Tests**
   - Test each module access per role
   - Verify category-level restrictions
   - Validate permission object accuracy

3. **UI Adaptation Tests**
   - Confirm dynamic menu rendering
   - Test component-level protection
   - Verify access denied screens

### Running Tests

```bash
# Navigate to frontend directory
cd frontend/clinprecision

# Start the application
npm start

# Access the role tester
http://localhost:3000/role-tester
```

---

## 🚀 Deployment

### Environment Setup

1. **Development Environment**
   ```javascript
   // Set default role for testing
   const defaultRole = 'SYSTEM_ADMIN'; // Full access for development
   ```

2. **Staging Environment**
   ```javascript
   // Enable role testing components
   const enableRoleTester = true;
   ```

3. **Production Environment**
   ```javascript
   // Disable testing components
   const enableRoleTester = false;
   // Enforce strict role validation
   const strictRoleValidation = true;
   ```

### Deployment Checklist

- [ ] **Role Permissions Configured**: All roles have appropriate module access
- [ ] **Default Role Set**: New users receive appropriate default role
- [ ] **Security Validation**: All protected routes validate permissions
- [ ] **Audit Trail Active**: Permission changes are logged
- [ ] **Testing Components Disabled**: Role tester removed from production
- [ ] **Error Handling**: Access denied screens properly implemented
- [ ] **Performance Optimized**: Permission checks don't impact performance

---

## 🔧 Troubleshooting

### Common Issues

#### 1. **User Can't Access Expected Modules**

**Symptoms**: Navigation menu missing expected items
```javascript
// Debug steps:
console.log('Current user role:', userRole);
console.log('Accessible modules:', getAccessibleModules());
console.log('Has study-design access:', hasModuleAccess('study-design'));
```

**Solutions**:
- Verify user role assignment in database
- Check role permissions mapping
- Confirm AuthContext is providing correct user data

#### 2. **Permission Changes Not Reflecting**

**Symptoms**: UI doesn't update after role change
```javascript
// Force re-render with dependency
useEffect(() => {
    // Component will re-render when user role changes
}, [user?.role]);
```

**Solutions**:
- Clear browser cache/localStorage
- Verify AuthContext updates on role change
- Check React component re-rendering

#### 3. **Access Denied for Valid Users**

**Symptoms**: Users see access denied screens unexpectedly
```javascript
// Debug permission object
const permissions = getModulePermissions('problematic-module');
console.log('Module permissions:', permissions);
```

**Solutions**:
- Verify module key spelling in rolePermissions
- Check category access requirements
- Confirm user has active status

### Debug Commands

```javascript
// In browser console:

// Check current role
window.localStorage.getItem('user-role')

// View all permissions
JSON.stringify(rolePermissions, null, 2)

// Test specific access
hasModuleAccess('module-name')

// View user context
console.log(useAuth())
```

### Error Messages

| Error | Meaning | Solution |
|-------|---------|----------|
| `Access Denied` | User lacks module permission | Verify role assignment |
| `Role Not Found` | Invalid role in user profile | Update user role in database |
| `Module Not Configured` | Module not in permission map | Add module to rolePermissions |
| `Category Access Denied` | User lacks category access | Check category role requirements |

---

## 📞 Support

### Documentation Resources

- 📖 **Implementation Guide**: See [Implementation Guide](#implementation-guide)
- 🧪 **Testing Guide**: See [Testing](#testing) 
- 🔒 **Security Guide**: See [Security Features](#security-features)
- 🚀 **Deployment Guide**: See [Deployment](#deployment)

### Getting Help

For additional support with the RBAC system:

1. **Check Role Tester**: Use the built-in testing component
2. **Review Console Logs**: Debug permission issues with browser console
3. **Verify Database**: Confirm user roles are correctly stored
4. **Test with Different Roles**: Switch roles to isolate issues

### Contributing

When extending the RBAC system:

1. **Add New Roles**: Update `rolePermissions` mapping
2. **Add New Modules**: Include in module categories
3. **Update Tests**: Add new scenarios to RoleTester
4. **Document Changes**: Update this README with new features

---

## 📝 License & Compliance

This RBAC system is designed to meet regulatory requirements for clinical trial software:

- ✅ **FDA 21 CFR Part 11**: Electronic records compliance
- ✅ **ICH GCP**: Good Clinical Practice standards  
- ✅ **HIPAA**: Health information privacy protection
- ✅ **SOX**: Data integrity and audit trail requirements

---

**Last Updated**: September 25, 2025  
**Version**: 1.0.0  
**Platform**: ClinPrecision EDC  
**Author**: ClinPrecision Development Team