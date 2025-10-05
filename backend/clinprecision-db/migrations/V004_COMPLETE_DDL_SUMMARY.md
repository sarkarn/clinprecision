# Study Versions Table - Complete DDL Recreation (V004)

## Problem Summary

The previous migration approach (V003) tried to ALTER the existing `study_versions` table with multiple complex changes:
- Change `aggregate_uuid` from VARCHAR(36) to BINARY(16)
- Add 9 new columns for DDD fields
- Convert JSON columns to TEXT
- Drop 5 legacy columns
- Migrate data between columns

**Result**: Migration failures due to complexity and MySQL version differences in syntax.

## New Solution: V004 - DROP and RECREATE

Instead of complex ALTER statements, **V004 drops and recreates the entire table** with the correct schema from the start.

### ⚠️ Important

**This migration DELETES all data in `study_versions` table!**

If you have production data, you need to:
1. Export existing data before migration
2. Transform data to match new schema
3. Re-import after migration

For development/testing where data can be lost, this is the cleanest approach.

---

## Files Created

### 1. V004__recreate_study_versions_table_for_ddd.sql
Complete CREATE TABLE script with:
- All DDD fields from `ProtocolVersionEntity`
- Legacy fields for backward compatibility
- Proper constraints and indexes
- Foreign key relationships

### 2. V004__recreate_study_versions_table_for_ddd_ROLLBACK.sql
Restores the original table structure if needed.

### 3. EXECUTE_V004_MIGRATION.md
Step-by-step guide with:
- Backup procedures
- Execution commands (PowerShell & MySQL Workbench)
- Verification queries
- Rollback instructions

---

## Complete Table Schema

```sql
CREATE TABLE study_versions (
    -- Primary Key
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    
    -- DDD/Event Sourcing Fields
    aggregate_uuid BINARY(16) NULL UNIQUE,              -- Event-sourced aggregate ID
    study_aggregate_uuid BINARY(16) NULL,               -- Parent Study aggregate UUID
    
    -- Legacy Transition Fields
    study_id BIGINT NULL,                               -- Legacy Study reference
    previous_version_id BIGINT NULL,                    -- Legacy version reference
    
    -- Core Fields
    version_number VARCHAR(20) NOT NULL,
    status ENUM('DRAFT', 'UNDER_REVIEW', 'SUBMITTED', 'APPROVED', 'ACTIVE', 'SUPERSEDED', 'WITHDRAWN') NOT NULL,
    amendment_type ENUM('MAJOR', 'MINOR', 'SAFETY', 'ADMINISTRATIVE') NULL,
    description TEXT NULL,
    changes_summary TEXT NULL,
    impact_assessment TEXT NULL,
    requires_regulatory_approval BOOLEAN DEFAULT FALSE,
    
    -- DDD-Specific Fields
    submission_date DATE NULL,
    approval_date DATE NULL,
    effective_date DATE NULL,
    notes TEXT NULL,
    protocol_changes TEXT NULL,
    icf_changes TEXT NULL,
    approved_by BIGINT NULL,
    approval_comments TEXT NULL,
    previous_active_version_uuid BINARY(16) NULL,       -- UUID reference to previous active version
    withdrawal_reason TEXT NULL,
    withdrawn_by BIGINT NULL,
    
    -- Legacy Field (backward compatibility)
    amendment_reason TEXT NULL,
    
    -- Audit Fields
    created_by BIGINT NOT NULL,
    created_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,  -- Legacy
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,    -- DDD standard
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT uk_study_versions_aggregate_uuid UNIQUE (aggregate_uuid),
    CONSTRAINT uk_study_version_number UNIQUE (study_id, version_number),
    CONSTRAINT fk_study_versions_study_id FOREIGN KEY (study_id) REFERENCES studies (id) ON DELETE CASCADE,
    CONSTRAINT fk_study_versions_previous_version FOREIGN KEY (previous_version_id) REFERENCES study_versions (id) ON DELETE SET NULL,
    CONSTRAINT fk_study_versions_created_by FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE RESTRICT,
    CONSTRAINT fk_study_versions_approved_by FOREIGN KEY (approved_by) REFERENCES users (id) ON DELETE SET NULL,
    CONSTRAINT fk_study_versions_withdrawn_by FOREIGN KEY (withdrawn_by) REFERENCES users (id) ON DELETE SET NULL
);

-- Indexes for performance
CREATE INDEX idx_study_versions_study_id ON study_versions(study_id);
CREATE INDEX idx_study_versions_status ON study_versions(status);
CREATE INDEX idx_study_versions_version_number ON study_versions(version_number);
CREATE INDEX idx_study_versions_created_date ON study_versions(created_date);
CREATE INDEX idx_study_versions_effective_date ON study_versions(effective_date);
CREATE INDEX idx_study_versions_study_status ON study_versions (study_id, status);
CREATE INDEX idx_study_versions_status_type ON study_versions (status, amendment_type);
CREATE INDEX idx_study_versions_study_aggregate_uuid ON study_versions(study_aggregate_uuid);
CREATE INDEX idx_study_versions_previous_active_version ON study_versions(previous_active_version_uuid);
CREATE INDEX idx_study_versions_withdrawn_by ON study_versions(withdrawn_by);
CREATE INDEX idx_study_versions_submission_date ON study_versions(submission_date);
CREATE INDEX idx_study_versions_created_at ON study_versions(created_at);
CREATE INDEX idx_study_versions_updated_at ON study_versions(updated_at);
```

---

## Key Changes from Original

| Column | Original | V004 | Reason |
|--------|----------|------|--------|
| `aggregate_uuid` | VARCHAR(36) | BINARY(16) | UUID type for event sourcing |
| `study_aggregate_uuid` | ❌ | BINARY(16) | NEW - DDD parent reference |
| `previous_active_version_uuid` | ❌ | BINARY(16) | NEW - UUID version linking |
| `approval_comments` | ❌ | TEXT | NEW - Approver comments |
| `submission_date` | ❌ | DATE | NEW - Regulatory submission date |
| `notes` | ❌ | TEXT | NEW - General notes (replaces additional_notes) |
| `withdrawal_reason` | ❌ | TEXT | NEW - Withdrawal tracking |
| `withdrawn_by` | ❌ | BIGINT | NEW - User who withdrew |
| `created_at` | ❌ | DATETIME | NEW - DDD standard audit |
| `protocol_changes` | JSON | TEXT | Changed type for DDD |
| `icf_changes` | JSON | TEXT | Changed type for DDD |
| `regulatory_submissions` | JSON | ❌ | REMOVED - Not in DDD |
| `review_comments` | JSON | ❌ | REMOVED - Not in DDD |
| `metadata` | JSON | ❌ | REMOVED - Not in DDD |
| `notify_stakeholders` | BOOLEAN | ❌ | REMOVED - Not in DDD |
| `additional_notes` | TEXT | ❌ | REMOVED - Use `notes` instead |

---

## Comparison with ProtocolVersionEntity

✅ **100% Match**: The V004 schema includes ALL fields from `ProtocolVersionEntity.java`:

```java
@Entity
@Table(name = "study_versions")
public class ProtocolVersionEntity {
    private Long id;                              ✅ BIGINT AUTO_INCREMENT
    private UUID aggregateUuid;                   ✅ BINARY(16) UNIQUE
    private UUID studyAggregateUuid;              ✅ BINARY(16)
    private Long studyId;                         ✅ BIGINT (deprecated)
    private String versionNumber;                 ✅ VARCHAR(20)
    private VersionStatus status;                 ✅ ENUM
    private AmendmentType amendmentType;          ✅ ENUM
    private String description;                   ✅ TEXT
    private String changesSummary;                ✅ TEXT
    private String impactAssessment;              ✅ TEXT
    private Boolean requiresRegulatoryApproval;   ✅ BOOLEAN
    private LocalDate submissionDate;             ✅ DATE
    private LocalDate approvalDate;               ✅ DATE
    private LocalDate effectiveDate;              ✅ DATE
    private String notes;                         ✅ TEXT
    private String protocolChanges;               ✅ TEXT
    private String icfChanges;                    ✅ TEXT
    private Long approvedBy;                      ✅ BIGINT
    private String approvalComments;              ✅ TEXT
    private UUID previousActiveVersionUuid;       ✅ BINARY(16)
    private String withdrawalReason;              ✅ TEXT
    private Long withdrawnBy;                     ✅ BIGINT
    private LocalDateTime createdAt;              ✅ DATETIME
    private LocalDateTime updatedAt;              ✅ DATETIME
}
```

---

## Execution Steps

### 1. Backup (CRITICAL!)
```powershell
mysqldump -u root -p clinprecision_db > backup_before_v004.sql
```

### 2. Execute Migration
```powershell
cd backend\clinprecision-db\migrations
mysql -u root -p clinprecision_db < V004__recreate_study_versions_table_for_ddd.sql
```

### 3. Verify
```sql
DESC study_versions;
```

### 4. Run Tests
```powershell
cd backend\clinprecision-clinops-service
mvn clean test
```

---

## After Migration Success

1. ✅ Delete legacy `StudyVersionEntity.java`
2. ✅ Delete legacy DTOs: `StudyVersionDto`, `StudyVersionCreateRequestDto`, `StudyVersionUpdateRequestDto`
3. ✅ Delete legacy `StudyVersionRepository.java`
4. ✅ Update `StudyAmendmentEntity`, `StudyAmendmentDto`, `CrossEntityStatusValidationService` to use DDD enums
5. ✅ Remove all references to legacy entity

---

## Benefits of This Approach

### ✅ Advantages
- **Clean Schema**: No residual issues from complex ALTER statements
- **Guaranteed Match**: 100% alignment with `ProtocolVersionEntity`
- **Easier Maintenance**: Single CREATE statement is easier to understand than multiple ALTERs
- **No Syntax Issues**: Avoids MySQL version-specific ALTER syntax problems
- **Idempotent**: Can be re-run if needed (drops first)

### ⚠️ Disadvantages
- **Data Loss**: All existing data is deleted
- **Not Safe for Production**: Requires data export/import if data exists

### 💡 When to Use
- ✅ Development environments
- ✅ Testing environments
- ✅ When data can be regenerated
- ✅ When starting fresh is acceptable
- ❌ Production with real data (use V003 with fixes instead)

---

## Next Steps

1. **Execute V004 migration** following `EXECUTE_V004_MIGRATION.md`
2. **Verify tests pass** (all 37 tests)
3. **Delete legacy code** (StudyVersionEntity + related files)
4. **Update enum references** in remaining files
5. **Verify application startup**
6. **Document resolution**

---

## Questions?

If the migration fails:
1. Share the exact error message
2. Share output of `DESC study_versions;`
3. Share MySQL version: `SELECT VERSION();`

The agent will help troubleshoot!
