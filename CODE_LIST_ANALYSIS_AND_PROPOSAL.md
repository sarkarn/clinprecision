# Code List Analysis and Implementation Plan

## Analysis Summary

After analyzing both frontend and backend code, I've identified the following hardcoded values that should be centralized in a code list system:

### Frontend Hardcoded Values (JavaScript/React)

1. **Protocol Version Management** (`useProtocolVersioning.js`):
   - **PROTOCOL_VERSION_STATUS**: DRAFT, PROTOCOL_REVIEW, APPROVED, ACTIVE, SUPERSEDED, WITHDRAWN
   - **AMENDMENT_TYPES**: INITIAL, MAJOR, MINOR, SAFETY, ADMINISTRATIVE

2. **Study Management** (`StudyService.js`):
   - **Study Status**: "active", "completed", "terminated"

3. **Subject Management** (`SubjectService.js`):
   - **Subject Status**: "Active"

4. **User Management**:
   - **User Roles**: Various role-based checks

### Backend Hardcoded Values (Java Enums)

1. **StudyVersionEntity.java**:
   - **VersionStatus**: DRAFT, UNDER_REVIEW, SUBMITTED, APPROVED, ACTIVE, SUPERSEDED, WITHDRAWN
   - **AmendmentType**: MAJOR, MINOR, SAFETY, ADMINISTRATIVE (missing INITIAL)

2. **StudyStatus.java**:
   - **StudyStatus**: DRAFT, ACTIVE, APPROVED, COMPLETED, TERMINATED

3. **VisitDefinitionEntity.java**:
   - **VisitType**: SCREENING, BASELINE, TREATMENT, FOLLOW_UP, UNSCHEDULED

4. **UserEntity.java**:
   - **UserStatus**: active, inactive, pending, locked

5. **Other Entities**:
   - **PhaseCategory**: PRECLINICAL, EARLY_PHASE, EFFICACY, REGISTRATION, POST_MARKET
   - **SiteStatus**: Various site status values
   - **OrganizationStatus**: Various organization status values
   - **TemplateStatus**: Template-related status values

## Current Mismatch Issues

1. **Amendment Types**: Frontend includes "INITIAL" but backend enum doesn't support it
2. **Status Naming**: Some inconsistencies between frontend and backend status values
3. **Case Sensitivity**: Frontend uses various cases, backend enums are uppercase

## Proposed Solution

### 1. Database Schema (`code_lists_schema.sql`)

**Main Table: `code_lists`**
- `id`: Primary key
- `category`: Code list category (e.g., AMENDMENT_TYPE, STUDY_STATUS)
- `code`: The actual code value (e.g., MAJOR, ACTIVE)
- `display_name`: Human-readable name
- `description`: Detailed description
- `sort_order`: Display ordering
- `is_active`: Active/inactive flag
- `system_code`: System-managed vs user-configurable
- `metadata`: JSON field for additional properties (colors, permissions, etc.)
- Audit and versioning fields

**Supporting Tables:**
- `code_lists_audit`: Complete audit trail
- `code_list_translations`: Multi-language support
- `code_list_usage`: Track which modules use which codes

### 2. Initial Data (`code_lists_data.sql`)

Comprehensive setup of all identified code lists:

#### Protocol Version Management
- **AMENDMENT_TYPE**: INITIAL, MAJOR, MINOR, SAFETY, ADMINISTRATIVE
- **PROTOCOL_VERSION_STATUS**: DRAFT, PROTOCOL_REVIEW, APPROVED, ACTIVE, SUPERSEDED, WITHDRAWN

#### Study Management  
- **STUDY_STATUS**: DRAFT, ACTIVE, APPROVED, COMPLETED, TERMINATED
- **STUDY_PHASE_CATEGORY**: PRECLINICAL, EARLY_PHASE, EFFICACY, REGISTRATION, POST_MARKET

#### Visit Management
- **VISIT_TYPE**: SCREENING, BASELINE, TREATMENT, FOLLOW_UP, UNSCHEDULED

#### User & Organization Management
- **USER_STATUS**: ACTIVE, INACTIVE, PENDING, LOCKED
- **SITE_STATUS**: ACTIVE, INACTIVE, PENDING, SUSPENDED, CLOSED
- **ORGANIZATION_STATUS**: ACTIVE, INACTIVE, PENDING

#### Workflow & Template Management
- **WORKFLOW_STATUS**: PENDING, IN_PROGRESS, COMPLETED, FAILED, CANCELLED
- **TEMPLATE_STATUS**: DRAFT, ACTIVE, INACTIVE, ARCHIVED

### 3. Metadata Features

Each code list entry includes rich metadata in JSON format:
- **UI Properties**: Colors, icons, styling classes
- **Business Logic**: Permissions, validation rules, requirements
- **Workflow**: State transitions, required approvals

Examples:
```json
{
  "color": "bg-green-100 text-green-700",
  "can_edit": true,
  "can_submit": false,
  "requires_regulatory": true,
  "impact_level": "high"
}
```

### 4. Views and Queries

Pre-built views for common access patterns:
- `v_active_code_lists`: Only active, valid codes
- `v_amendment_types`: Amendment types with regulatory flags
- `v_protocol_version_status`: Status with UI metadata

## Implementation Benefits

### 1. Consistency
- Single source of truth for all dropdown values
- Eliminates frontend/backend mismatches
- Consistent naming and casing

### 2. Maintainability
- Central management via admin interface
- No code changes required for new values
- Complete audit trail of changes

### 3. Flexibility
- Rich metadata support for complex business rules
- Multi-language support ready
- Hierarchical code lists supported

### 4. Performance
- Indexed for fast queries
- Views for common access patterns
- Caching-friendly structure

### 5. Governance
- System vs user-configurable codes
- Usage tracking across modules
- Version control and rollback capability

## Next Steps

### Phase 1: Database Setup
1. Execute `code_lists_schema.sql` to create tables
2. Execute `code_lists_data.sql` to populate initial data
3. Verify data integrity and relationships

### Phase 2: Backend Integration
1. Create CodeListService and repository
2. Add REST APIs for code list access
3. Update existing entities to use code lists
4. Create admin APIs for code list management

### Phase 3: Frontend Integration  
1. Create CodeListService for API calls
2. Update all hardcoded arrays to use API data
3. Create reusable dropdown components
4. Add admin interface for code list management

### Phase 4: Migration & Testing
1. Data migration scripts for existing data
2. Comprehensive testing of all modules
3. Performance optimization
4. Documentation updates

## Risk Mitigation

1. **Backward Compatibility**: Keep existing enums during transition
2. **Fallback Values**: Default values when code lists unavailable
3. **Caching Strategy**: Implement proper caching to avoid performance issues
4. **Data Validation**: Strict validation rules to prevent data corruption
5. **Rollback Plan**: Ability to revert to hardcoded values if needed

This centralized code list architecture will eliminate the current frontend/backend mismatches, provide a maintainable system for managing dropdown values, and establish a foundation for future enhancements.