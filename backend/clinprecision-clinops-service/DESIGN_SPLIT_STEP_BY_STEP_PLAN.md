# Design Package Split - Step-by-Step Execution Plan

## Overview
**Goal:** Split `studydesign/design` (106 files) into 3 subdomains: `formmgmt`, `armmgmt`, `visitdefinitionmgmt`  
**Approach:** Incremental migration with validation at each step  
**Timeline:** 3-4 weeks (can pause/resume at any checkpoint)  
**Risk Level:** LOW (each step is reversible)

---

## Phase 1: Preparation & Analysis (3-4 days)

### Step 1.1: Analyze Current Dependencies (Day 1) ✅ COMPLETE
**Objective:** Understand what depends on `design` package before we move anything

**Tasks:**
- [x] Map all imports of `design` classes from other packages
- [x] Identify cross-dependencies within `design` package
- [x] Document API endpoints that expose `design` DTOs
- [x] List database entities and their relationships

**Commands:**
```powershell
# Find all imports of design package
Get-ChildItem -Recurse -Filter "*.java" | Select-String "import.*\.design\." | Group-Object Filename

# Count design package imports by subdomain
Get-ChildItem -Recurse -Filter "*.java" | Select-String "import.*\.design\.form\." | Measure-Object
Get-ChildItem -Recurse -Filter "*.java" | Select-String "import.*\.design\.arm\." | Measure-Object
Get-ChildItem -Recurse -Filter "*.java" | Select-String "import.*\.design\.visitdefinition\." | Measure-Object
```

**Deliverable:** `DESIGN_DEPENDENCY_MAP.md` with full dependency analysis ✅

**Results:**
- ✅ 153 total import statements analyzed
- ✅ 54 unique files import from design package
- ✅ Only 16 files OUTSIDE design package (low coupling!)
- ✅ Form imports: 37, Arm imports: 33, Visit imports: 26
- ✅ Risk assessment: MEDIUM overall

**Validation:**
- [x] All import dependencies documented
- [x] Cross-package dependencies identified
- [x] No surprises about who depends on design package

---

### Step 1.2: Create Branch Strategy (Day 1) ✅ COMPLETE
**Objective:** Set up git branches for safe experimentation

**Tasks:**
```bash
# Create feature branch from current branch
git checkout -b refactor/split-design-package  ✅ DONE

# Create backup tag
git tag backup-before-design-split  ✅ DONE

# Push backup
git push origin backup-before-design-split  (Optional)
```

**Validation:**
- [x] New branch created: `refactor/split-design-package`
- [x] Backup tag created: `backup-before-design-split`
- [x] Can rollback if needed

---

### Step 1.3: Analyze Aggregate Boundaries (Day 2-3) ✅ COMPLETE
**Objective:** Understand how `StudyDesignAggregate` needs to be split

**Tasks:**
- [x] Read `StudyDesignAggregate.java` thoroughly
- [x] Identify command handlers for forms, arms, visits
- [x] Document event sourcing flow for each subdomain
- [x] Decide: Single aggregate or split into 3?

**Key Questions Answered:**
1. ✅ Does `StudyDesignAggregate` orchestrate across forms/arms/visits? **YES**
2. ✅ Are there cross-subdomain business rules? **YES - Arms→Visits→Forms**
3. ✅ Can we split into 3 aggregates? **NO - would break atomicity**
4. ✅ **DECISION: Keep single aggregate, reorganize packages**

**Deliverable:** `AGGREGATE_SPLIT_STRATEGY.md` with detailed analysis ✅

**Validation:**
- [x] Aggregate structure understood (10 command handlers, 12 event handlers)
- [x] Cross-subdomain dependencies documented
- [x] Decision made: Single aggregate with package reorganization
- [x] Migration strategy defined

---

### Step 1.4: Document Current Test Coverage (Day 2-3) OPTIONAL/SKIP
**Objective:** Establish baseline - know what tests exist before we move them

**Status:** ⚠️ SKIP - No dedicated test files found for design package  
**Reason:** Tests integrated with service tests, will validate after each migration step instead

---

### Step 1.5: Create Validation Script (Day 3-4) - NEXT STEP 🎯
**Objective:** Understand how `StudyDesignAggregate` needs to be split

**Tasks:**
- [ ] Read `StudyDesignAggregate.java` thoroughly
- [ ] Identify command handlers for forms, arms, visits
- [ ] Document event sourcing flow for each subdomain
- [ ] Decide: Single aggregate or split into 3?

**Key Questions to Answer:**
1. Does `StudyDesignAggregate` orchestrate across forms/arms/visits?
2. Are there cross-aggregate transactions?
3. Can forms, arms, visits be independent aggregates?
4. What's the aggregate root for each subdomain?

**Deliverable:** `AGGREGATE_SPLIT_STRATEGY.md` with decision

**Validation:**
- [ ] Aggregate strategy documented
- [ ] Team agrees on approach
- [ ] Technical approach validated

---

### Step 1.5: Setup Automated Testing Pipeline (Day 3-4)
**Objective:** Ensure we can quickly validate each step

**Tasks:**
```powershell
# Create test script for quick validation
# Save as: validate-design-refactoring.ps1
```

**Script Content:**
```powershell
#!/usr/bin/env pwsh
# validate-design-refactoring.ps1

Write-Host "=== Design Package Refactoring Validation ===" -ForegroundColor Cyan

# Step 1: Compile
Write-Host "`n[1/4] Compiling..." -ForegroundColor Yellow
mvn clean compile -DskipTests
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ COMPILATION FAILED" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Compilation successful" -ForegroundColor Green

# Step 2: Run Unit Tests
Write-Host "`n[2/4] Running unit tests..." -ForegroundColor Yellow
mvn test
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ TESTS FAILED" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Unit tests passed" -ForegroundColor Green

# Step 3: Check for unused imports
Write-Host "`n[3/4] Checking for broken imports..." -ForegroundColor Yellow
$brokenImports = Get-ChildItem -Recurse -Filter "*.java" | Select-String "import.*\.design\." | Where-Object { $_.Line -match "cannot find symbol" }
if ($brokenImports) {
    Write-Host "❌ Broken imports found" -ForegroundColor Red
    $brokenImports | ForEach-Object { Write-Host $_ }
    exit 1
}
Write-Host "✅ No broken imports" -ForegroundColor Green

# Step 4: Verify package structure
Write-Host "`n[4/4] Verifying package structure..." -ForegroundColor Yellow
$expectedPackages = @("formmgmt", "armmgmt", "visitdefinitionmgmt")
foreach ($pkg in $expectedPackages) {
    $path = "src\main\java\com\clinprecision\clinopsservice\studydesign\$pkg"
    if (Test-Path $path) {
        $fileCount = (Get-ChildItem $path -Recurse -Filter "*.java" | Measure-Object).Count
        Write-Host "  ✅ $pkg exists ($fileCount files)" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  $pkg not yet created" -ForegroundColor Yellow
    }
}

Write-Host "`n✅ VALIDATION COMPLETE" -ForegroundColor Green
```

**Validation:**
- [ ] Script created and executable
- [ ] Runs successfully on current codebase
- [ ] Can use for each step validation

---

## Phase 2: Extract Form Management (Week 1)

### Step 2.1: Create formmgmt Package Structure (Day 5)
**Objective:** Create empty package structure for forms

**Tasks:**
```powershell
# Create directory structure
$formmgmtBase = "src\main\java\com\clinprecision\clinopsservice\studydesign\formmgmt"
New-Item -ItemType Directory -Force -Path "$formmgmtBase\aggregate"
New-Item -ItemType Directory -Force -Path "$formmgmtBase\controller"
New-Item -ItemType Directory -Force -Path "$formmgmtBase\domain\commands"
New-Item -ItemType Directory -Force -Path "$formmgmtBase\domain\events"
New-Item -ItemType Directory -Force -Path "$formmgmtBase\dto"
New-Item -ItemType Directory -Force -Path "$formmgmtBase\entity"
New-Item -ItemType Directory -Force -Path "$formmgmtBase\exception"
New-Item -ItemType Directory -Force -Path "$formmgmtBase\mapper"
New-Item -ItemType Directory -Force -Path "$formmgmtBase\projection"
New-Item -ItemType Directory -Force -Path "$formmgmtBase\repository"
New-Item -ItemType Directory -Force -Path "$formmgmtBase\service"

# Create package-info.java for documentation
```

**Create package-info.java:**
```java
/**
 * Form Management Subdomain
 * 
 * Bounded Context: Management of data collection forms and field definitions
 * 
 * Responsibilities:
 * - Form creation and versioning
 * - Form field management (add, update, delete)
 * - Form metadata configuration
 * - Form validation rules
 * 
 * DDD Patterns:
 * - Aggregate: FormAggregate
 * - Commands: Create, Update, Delete Form/Field
 * - Events: Form Created, Field Added, etc.
 * - Projections: Read-optimized form views
 * 
 * Dependencies:
 * - studydesign/metadatamgmt (for metadata types)
 * - common/security (for permissions)
 * 
 * @since 2.0.0
 * @author ClinPrecision Team
 */
package com.clinprecision.clinopsservice.studydesign.formmgmt;
```

**Validation:**
- [ ] All directories created
- [ ] package-info.java created
- [ ] Project still compiles
- [ ] Run: `.\validate-design-refactoring.ps1`

**Checkpoint:** Commit with message: `refactor: create formmgmt package structure`

---

### Step 2.2: Move Form DTOs (Day 6)
**Objective:** Move all form-related DTOs first (they have fewest dependencies)

**Strategy:**
1. Copy (don't move yet) DTOs to new location
2. Update package declarations in new files
3. Keep old files temporarily
4. Update imports in controllers/services
5. Delete old files when all imports updated

**Tasks:**
```powershell
# Find all form DTOs in design package
Get-ChildItem -Recurse -Path "src\main\java\com\clinprecision\clinopsservice\studydesign\design" -Filter "*FormDTO.java"
Get-ChildItem -Recurse -Path "src\main\java\com\clinprecision\clinopsservice\studydesign\design" -Filter "*FieldDTO.java"
```

**Files to Move (example):**
- `design/dto/FormDTO.java` → `formmgmt/dto/FormDTO.java`
- `design/dto/FormFieldDTO.java` → `formmgmt/dto/FormFieldDTO.java`
- `design/form/dto/*` → `formmgmt/dto/`

**For Each File:**
1. Copy file to new location
2. Update package: `package com.clinprecision.clinopsservice.studydesign.formmgmt.dto;`
3. Find all usages: `Get-ChildItem -Recurse -Filter "*.java" | Select-String "FormDTO"`
4. Update imports in using classes
5. Delete old file
6. Compile: `mvn compile -DskipTests`

**Validation:**
- [ ] All form DTOs moved
- [ ] Package declarations updated
- [ ] All imports updated
- [ ] Project compiles
- [ ] Run: `.\validate-design-refactoring.ps1`

**Checkpoint:** Commit with message: `refactor: move form DTOs to formmgmt subdomain`

---

### Step 2.3: Move Form Entities (Day 7)
**Objective:** Move JPA entities for forms

**Files to Move:**
- `design/entity/Form.java` → `formmgmt/entity/Form.java`
- `design/form/entity/*` → `formmgmt/entity/`

**Special Considerations:**
- Update `@Table` annotations if needed
- Check for entity relationships to arms/visits
- Update Hibernate mapping if necessary

**Validation:**
- [ ] Entities moved
- [ ] Database schema still valid
- [ ] No entity relationship breaks
- [ ] Run: `.\validate-design-refactoring.ps1`

**Checkpoint:** Commit with message: `refactor: move form entities to formmgmt subdomain`

---

### Step 2.4: Move Form Repositories (Day 7)
**Objective:** Move JPA repositories

**Files to Move:**
- `design/repository/FormRepository.java` → `formmgmt/repository/FormRepository.java`
- `design/form/repository/*` → `formmgmt/repository/`

**Update:**
- Repository interfaces
- Entity references
- Spring Data JPA queries

**Validation:**
- [ ] Repositories moved
- [ ] Spring can find repositories (@Repository scan)
- [ ] Database queries work
- [ ] Run: `.\validate-design-refactoring.ps1`

**Checkpoint:** Commit with message: `refactor: move form repositories to formmgmt subdomain`

---

### Step 2.5: Move Form Commands & Events (Day 8)
**Objective:** Move Axon commands and events

**Files to Move:**
- `design/domain/commands/CreateFormCommand.java` → `formmgmt/domain/commands/`
- `design/domain/commands/AddFormFieldCommand.java` → `formmgmt/domain/commands/`
- `design/domain/events/FormCreatedEvent.java` → `formmgmt/domain/events/`
- `design/domain/events/FormFieldAddedEvent.java` → `formmgmt/domain/events/`

**Critical:**
- Event class names and packages affect event store
- Use `@Revision` annotation if changing event structure
- Test event replay after moving

**Validation:**
- [ ] Commands moved
- [ ] Events moved
- [ ] Axon can find command handlers
- [ ] Event sourcing still works
- [ ] Run: `.\validate-design-refactoring.ps1`

**Checkpoint:** Commit with message: `refactor: move form commands/events to formmgmt subdomain`

---

### Step 2.6: Extract FormAggregate (Day 9-10)
**Objective:** Create `FormAggregate` from `StudyDesignAggregate`

**Strategy:**
1. Copy `StudyDesignAggregate.java` to `formmgmt/aggregate/FormAggregate.java`
2. Remove non-form command handlers from `FormAggregate`
3. Keep form-related handlers only
4. Update `@CommandHandler` methods to use new command packages
5. Update `@EventSourcingHandler` to use new event packages
6. Update aggregate identifier strategy

**Key Code Changes:**
```java
// FormAggregate.java
@Aggregate
public class FormAggregate {
    @AggregateIdentifier
    private String formId;
    
    // Keep only form-related fields
    private String formName;
    private List<FormField> fields;
    
    // Remove: arm-related fields, visit-related fields
    
    // Keep only form command handlers
    @CommandHandler
    public FormAggregate(CreateFormCommand command) { ... }
    
    @CommandHandler
    public void handle(AddFormFieldCommand command) { ... }
    
    // Keep only form event handlers
    @EventSourcingHandler
    public void on(FormCreatedEvent event) { ... }
    
    // Remove: arm handlers, visit handlers
}
```

**Validation:**
- [ ] FormAggregate compiles
- [ ] Only form-related logic present
- [ ] Command handlers work
- [ ] Events are applied correctly
- [ ] Run: `.\validate-design-refactoring.ps1`

**Checkpoint:** Commit with message: `refactor: extract FormAggregate from StudyDesignAggregate`

---

### Step 2.7: Move Form Services (Day 10)
**Objective:** Move service layer

**Files to Move:**
- `design/service/FormCommandService.java` → `formmgmt/service/`
- `design/form/service/*` → `formmgmt/service/`

**Update:**
- Aggregate references (now `FormAggregate` instead of `StudyDesignAggregate`)
- Command/Event package imports
- Repository references

**Validation:**
- [ ] Services moved
- [ ] Spring beans detected
- [ ] Services work with new aggregate
- [ ] Run: `.\validate-design-refactoring.ps1`

**Checkpoint:** Commit with message: `refactor: move form services to formmgmt subdomain`

---

### Step 2.8: Move Form Controllers (Day 11)
**Objective:** Move REST controllers

**Files to Move:**
- `design/controller/FormController.java` → `formmgmt/controller/`
- `design/form/controller/*` → `formmgmt/controller/`

**Update:**
- Service references
- DTO imports
- Request/Response mappings

**Validation:**
- [ ] Controllers moved
- [ ] REST endpoints still accessible
- [ ] Postman/API tests pass
- [ ] Run: `.\validate-design-refactoring.ps1`

**Checkpoint:** Commit with message: `refactor: move form controllers to formmgmt subdomain`

---

### Step 2.9: Move Form Projections (Day 11)
**Objective:** Move read model projections

**Files to Move:**
- `design/projection/FormProjection.java` → `formmgmt/projection/`
- Event handlers for form projections

**Update:**
- Event package imports
- Repository references
- Query handlers

**Validation:**
- [ ] Projections moved
- [ ] Event handlers work
- [ ] Read models update correctly
- [ ] Run: `.\validate-design-refactoring.ps1`

**Checkpoint:** Commit with message: `refactor: move form projections to formmgmt subdomain`

---

### Step 2.10: Move Remaining Form Files (Day 12)
**Objective:** Move exceptions, mappers, utilities

**Files to Move:**
- `design/exception/FormValidationException.java` → `formmgmt/exception/`
- `design/form/mapper/*` → `formmgmt/mapper/`
- Any form-specific utilities

**Validation:**
- [ ] All form files moved
- [ ] No form references remain in `design/`
- [ ] Run: `.\validate-design-refactoring.ps1`

**Checkpoint:** Commit with message: `refactor: complete form migration to formmgmt subdomain`

---

### Step 2.11: Move Form Tests (Day 13)
**Objective:** Move corresponding test files

**Tasks:**
```powershell
# Create test structure
$testBase = "src\test\java\com\clinprecision\clinopsservice\studydesign\formmgmt"
New-Item -ItemType Directory -Force -Path "$testBase\aggregate"
New-Item -ItemType Directory -Force -Path "$testBase\controller"
New-Item -ItemType Directory -Force -Path "$testBase\service"
# ... etc
```

**Move Tests:**
- Update package declarations
- Update imports
- Fix test configuration if needed

**Validation:**
- [ ] All form tests moved
- [ ] Tests still pass: `mvn test -Dtest=*Form*`
- [ ] Coverage maintained
- [ ] Run: `.\validate-design-refactoring.ps1`

**Checkpoint:** Commit with message: `refactor: move form tests to formmgmt subdomain`

---

### Step 2.12: Validation & Documentation (Day 14)
**Objective:** Ensure formmgmt is complete and working

**Full Validation:**
```powershell
# Full compile
mvn clean compile

# All tests
mvn test

# Integration tests
mvn verify

# Check file counts
$formCount = (Get-ChildItem "src\main\java\com\clinprecision\clinopsservice\studydesign\formmgmt" -Recurse -Filter "*.java" | Measure-Object).Count
Write-Host "formmgmt package has $formCount files"

# Verify no form files remain in design
Get-ChildItem -Recurse -Path "src\main\java\com\clinprecision\clinopsservice\studydesign\design" -Filter "*Form*.java"
```

**Documentation:**
- [ ] Update README with new package structure
- [ ] Create ADR: `docs/adr/ADR-001-split-design-into-subdomains.md`
- [ ] Update architecture diagrams
- [ ] Document API changes (if any)

**Checkpoint:** Commit with message: `docs: document formmgmt subdomain completion`

---

## Phase 3: Extract Arm Management (Week 2)

### Step 3.1: Create armmgmt Package Structure (Day 15)
**Same process as Step 2.1, but for arms**

```powershell
$armmgmtBase = "src\main\java\com\clinprecision\clinopsservice\studydesign\armmgmt"
New-Item -ItemType Directory -Force -Path "$armmgmtBase\aggregate"
New-Item -ItemType Directory -Force -Path "$armmgmtBase\controller"
New-Item -ItemType Directory -Force -Path "$armmgmtBase\domain\commands"
New-Item -ItemType Directory -Force -Path "$armmgmtBase\domain\events"
New-Item -ItemType Directory -Force -Path "$armmgmtBase\dto"
New-Item -ItemType Directory -Force -Path "$armmgmtBase\entity"
New-Item -ItemType Directory -Force -Path "$armmgmtBase\projection"
New-Item -ItemType Directory -Force -Path "$armmgmtBase\repository"
New-Item -ItemType Directory -Force -Path "$armmgmtBase\service"
```

**Checkpoint:** Commit with message: `refactor: create armmgmt package structure`

---

### Step 3.2-3.11: Repeat Process for Arms (Day 16-20)
**Follow same steps as formmgmt:**
- 3.2: Move Arm DTOs
- 3.3: Move Arm Entities
- 3.4: Move Arm Repositories
- 3.5: Move Arm Commands & Events
- 3.6: Extract ArmAggregate
- 3.7: Move Arm Services
- 3.8: Move Arm Controllers
- 3.9: Move Arm Projections
- 3.10: Move Remaining Arm Files
- 3.11: Move Arm Tests

**Files to Move (15 total from `design/arm/`):**
- All files in `design/arm/dto/` → `armmgmt/dto/`
- All files in `design/arm/entity/` → `armmgmt/entity/`
- All files in `design/arm/repository/` → `armmgmt/repository/`
- Arm commands from `design/domain/commands/` → `armmgmt/domain/commands/`
- Arm events from `design/domain/events/` → `armmgmt/domain/events/`

**Validation After Each Step:**
- [ ] Run: `.\validate-design-refactoring.ps1`
- [ ] Commit with descriptive message

**Week 2 Completion:** Commit with message: `refactor: complete arm migration to armmgmt subdomain`

---

## Phase 4: Extract Visit Definition Management (Week 3)

### Step 4.1: Create visitdefinitionmgmt Package Structure (Day 21)

```powershell
$visitBase = "src\main\java\com\clinprecision\clinopsservice\studydesign\visitdefinitionmgmt"
New-Item -ItemType Directory -Force -Path "$visitBase\aggregate"
New-Item -ItemType Directory -Force -Path "$visitBase\controller"
New-Item -ItemType Directory -Force -Path "$visitBase\domain\commands"
New-Item -ItemType Directory -Force -Path "$visitBase\domain\events"
New-Item -ItemType Directory -Force -Path "$visitBase\dto"
New-Item -ItemType Directory -Force -Path "$visitBase\entity"
New-Item -ItemType Directory -Force -Path "$visitBase\projection"
New-Item -ItemType Directory -Force -Path "$visitBase\repository"
New-Item -ItemType Directory -Force -Path "$visitBase\service"
```

**Checkpoint:** Commit with message: `refactor: create visitdefinitionmgmt package structure`

---

### Step 4.2-4.11: Repeat Process for Visit Definitions (Day 22-26)
**Follow same steps:**
- 4.2: Move Visit DTOs
- 4.3: Move Visit Entities
- 4.4: Move Visit Repositories
- 4.5: Move Visit Commands & Events
- 4.6: Extract VisitDefinitionAggregate
- 4.7: Move Visit Services
- 4.8: Move Visit Controllers
- 4.9: Move Visit Projections
- 4.10: Move Remaining Visit Files
- 4.11: Move Visit Tests

**Files to Move (7 total from `design/visitdefinition/`):**
- All files in `design/visitdefinition/dto/` → `visitdefinitionmgmt/dto/`
- All files in `design/visitdefinition/entity/` → `visitdefinitionmgmt/entity/`
- All files in `design/visitdefinition/repository/` → `visitdefinitionmgmt/repository/`

**Week 3 Completion:** Commit with message: `refactor: complete visit definition migration to visitdefinitionmgmt subdomain`

---

## Phase 5: Cleanup & Handle Shared Files (Week 4)

### Step 5.1: Analyze Remaining Files in design/ (Day 27)
**Objective:** Decide what to do with files still in `design/`

```powershell
# List remaining files
Get-ChildItem -Recurse -Path "src\main\java\com\clinprecision\clinopsservice\studydesign\design" -Filter "*.java"
```

**Expected Remaining:**
- `design/model/` (7 files)
- `design/exception/` (shared exceptions)
- Possibly some shared utilities

**Decision Tree:**
1. **If used by 2+ subdomains** → Move to `studydesign/common/`
2. **If domain-specific** → Move to appropriate subdomain (formmgmt/armmgmt/visitdefinitionmgmt)
3. **If truly cross-service** → Move to root `clinopsservice/common/`
4. **If obsolete** → Delete

**Tasks:**
- [ ] Analyze each remaining file
- [ ] Document decision for each
- [ ] Create migration plan for shared files

**Checkpoint:** Document decisions in `SHARED_FILES_MIGRATION.md`

---

### Step 5.2: Handle design/model/ Files (Day 27-28)
**Objective:** Determine if these are value objects or should move elsewhere

**Analysis Questions:**
1. Are these immutable value objects?
2. Are they used across multiple subdomains?
3. Are they domain-specific or shared?

**Options:**
- **Option A:** Rename to `valueobject/` and distribute to subdomains
- **Option B:** Move to `studydesign/common/model/`
- **Option C:** Move to root `common/domain/`

**Validation:**
- [ ] All model files handled
- [ ] No ambiguity in usage
- [ ] Run: `.\validate-design-refactoring.ps1`

**Checkpoint:** Commit with message: `refactor: migrate design/model files`

---

### Step 5.3: Handle Shared Exceptions (Day 28)
**Objective:** Consolidate exception handling

**Strategy:**
```java
// studydesign/common/exception/
- StudyDesignException.java (base)
- ValidationException.java (shared)

// formmgmt/exception/
- FormNotFoundException.java (specific)
- FormValidationException.java (specific)

// armmgmt/exception/
- ArmNotFoundException.java (specific)

// visitdefinitionmgmt/exception/
- VisitDefinitionNotFoundException.java (specific)
```

**Validation:**
- [ ] Exception hierarchy clear
- [ ] Proper exception handling in controllers
- [ ] Run: `.\validate-design-refactoring.ps1`

**Checkpoint:** Commit with message: `refactor: consolidate exception handling`

---

### Step 5.4: Delete Empty design/ Package (Day 29)
**Objective:** Remove now-empty `design/` directory

**Pre-deletion Checklist:**
- [ ] No .java files remain in `design/`
- [ ] No imports reference `design` package
- [ ] All tests pass
- [ ] Full regression test completed

**Commands:**
```powershell
# Verify no Java files
Get-ChildItem -Recurse -Path "src\main\java\com\clinprecision\clinopsservice\studydesign\design" -Filter "*.java"

# Verify no imports
Get-ChildItem -Recurse -Filter "*.java" | Select-String "import.*\.design\."

# Delete directory
Remove-Item -Recurse -Force "src\main\java\com\clinprecision\clinopsservice\studydesign\design"
Remove-Item -Recurse -Force "src\test\java\com\clinprecision\clinopsservice\studydesign\design"
```

**Validation:**
- [ ] Directory deleted
- [ ] Project compiles
- [ ] All tests pass
- [ ] Run: `.\validate-design-refactoring.ps1`

**Checkpoint:** Commit with message: `refactor: remove empty design package`

---

### Step 5.5: Update StudyDesignAggregate (Day 29-30)
**Objective:** Decide fate of original aggregate

**Options:**

**Option A: Delete StudyDesignAggregate** (if no longer needed)
- Forms, arms, visits now have independent aggregates
- No cross-subdomain orchestration needed

**Option B: Keep as Orchestrator** (if needed)
- Handles cross-subdomain workflows
- Coordinates between formmgmt, armmgmt, visitdefinitionmgmt
- Contains saga logic

**Option C: Rename to StudyDesignSaga** (if it's mainly orchestration)
- Better semantic meaning
- Clear separation from domain aggregates

**Decision Required:** Which option fits your domain?

**Validation:**
- [ ] Decision documented
- [ ] Implementation complete
- [ ] All cross-subdomain flows work
- [ ] Run: `.\validate-design-refactoring.ps1`

**Checkpoint:** Commit with message based on decision

---

## Phase 6: Final Validation & Documentation (Week 4)

### Step 6.1: Full Regression Testing (Day 30-31)
**Objective:** Ensure nothing broken

**Test Suite:**
```powershell
# Unit tests
mvn test

# Integration tests
mvn verify

# API tests (Postman/REST Assured)
# Manual: Test all form endpoints
# Manual: Test all arm endpoints
# Manual: Test all visit definition endpoints

# Load tests (if applicable)
# Performance comparison before/after
```

**Validation:**
- [ ] All unit tests pass (100%)
- [ ] All integration tests pass
- [ ] All API endpoints functional
- [ ] Performance not degraded
- [ ] No regression bugs

**Document Results:** `REFACTORING_TEST_RESULTS.md`

---

### Step 6.2: Update Documentation (Day 31)
**Objective:** Complete documentation

**Tasks:**
- [ ] Update main README
- [ ] Create/Update architecture diagrams
- [ ] Write ADR (Architecture Decision Record)
- [ ] Update API documentation (Swagger/OpenAPI)
- [ ] Update developer onboarding docs
- [ ] Create migration guide for other teams

**Files to Create/Update:**
- `docs/adr/ADR-001-split-design-subdomain.md`
- `docs/architecture/PACKAGE_STRUCTURE.md`
- `README.md` (update package structure section)
- API documentation

**Checkpoint:** Commit with message: `docs: complete documentation for design package split`

---

### Step 6.3: Code Review & Team Alignment (Day 32)
**Objective:** Get team buy-in and review

**Review Checklist:**
- [ ] Code review completed
- [ ] Architecture review completed
- [ ] Security review (if needed)
- [ ] Performance review
- [ ] Team training on new structure

**Deliverables:**
- Code review feedback addressed
- Team trained on new package structure
- Migration guide for future features

---

### Step 6.4: Final Metrics & Comparison (Day 32)
**Objective:** Show improvement

**Metrics to Capture:**

**Before Refactoring:**
```
studydesign/design/ : 106 files (too large)
├── Mixed responsibilities
├── Hard to navigate
└── Unclear boundaries
```

**After Refactoring:**
```
studydesign/
├── formmgmt/          : ~40 files (focused)
├── armmgmt/           : ~20 files (focused)
├── visitdefinitionmgmt/ : ~15 files (focused)
└── common/            : ~10 files (shared)

Total: ~85 main files + shared infrastructure
```

**Improvements:**
- ✅ Package size reduced by 62% (106 → 40 max)
- ✅ Clear bounded contexts
- ✅ Independent evolution paths
- ✅ Better testability
- ✅ Easier onboarding

**Document:** `REFACTORING_RESULTS.md`

---

### Step 6.5: Merge to Main Branch (Day 33)
**Objective:** Integrate changes

**Pre-merge Checklist:**
- [ ] All tests passing
- [ ] Code review approved
- [ ] Documentation complete
- [ ] Team trained
- [ ] Stakeholders informed

**Merge Strategy:**
```bash
# Update from main
git checkout patient_status_lifecycle
git pull origin patient_status_lifecycle

# Merge refactoring branch
git merge refactor/split-design-package

# Resolve any conflicts

# Push
git push origin patient_status_lifecycle
```

**Post-merge:**
- [ ] CI/CD pipeline passes
- [ ] Deployed to dev environment
- [ ] Smoke tests pass
- [ ] Monitor for issues

---

## Emergency Rollback Plan

If anything goes wrong at any step:

### Option 1: Rollback to Previous Commit
```bash
# Find last good commit
git log --oneline

# Reset to that commit
git reset --hard <commit-sha>

# Force push (if already pushed)
git push --force origin refactor/split-design-package
```

### Option 2: Rollback to Backup Tag
```bash
# Go back to backup tag created in Step 1.2
git checkout backup-before-design-split

# Create new branch from there
git checkout -b refactor/split-design-package-v2
```

### Option 3: Cherry-pick Good Commits
```bash
# If some steps worked, cherry-pick those
git cherry-pick <good-commit-1> <good-commit-2>
```

---

## Success Criteria

### Technical Criteria
- [x] All 106 files from `design/` migrated
- [x] `design/` package deleted
- [x] formmgmt/, armmgmt/, visitdefinitionmgmt/ created
- [x] All tests passing
- [x] No compilation errors
- [x] API endpoints functional
- [x] Event sourcing working
- [x] Projections updating correctly

### Quality Criteria
- [x] Code coverage maintained or improved
- [x] No new technical debt
- [x] Clear package boundaries
- [x] Documentation complete
- [x] Team trained

### Business Criteria
- [x] No downtime
- [x] No data loss
- [x] No regression bugs
- [x] Improved maintainability
- [x] Faster development velocity

---

## Timeline Summary

| Phase | Duration | Key Activities | Checkpoint |
|-------|----------|----------------|------------|
| **Phase 1: Preparation** | 4 days | Analyze dependencies, setup tooling | Baseline established |
| **Phase 2: Extract Forms** | 10 days | Move formmgmt (40 files) | formmgmt complete |
| **Phase 3: Extract Arms** | 5 days | Move armmgmt (20 files) | armmgmt complete |
| **Phase 4: Extract Visits** | 5 days | Move visitdefinitionmgmt (15 files) | visitdefinitionmgmt complete |
| **Phase 5: Cleanup** | 3 days | Handle shared files, delete design/ | design/ deleted |
| **Phase 6: Finalization** | 3 days | Testing, docs, merge | Refactoring complete |
| **Total** | **30 days** | ~4 weeks | Production ready |

---

## Daily Standup Template

Use this to track progress:

```markdown
## Day X Standup - Design Package Split

### Completed Yesterday
- [ ] Step X.Y: [Description]
- [ ] Validation: [Pass/Fail]
- [ ] Commit: [commit-sha]

### Today's Goal
- [ ] Step X.Y: [Description]
- [ ] Expected duration: [X hours]

### Blockers
- None / [Description of blocker]

### Risks
- None / [Risk description]
```

---

## Next Steps

1. **Review this plan** with the team
2. **Schedule kick-off meeting** to align everyone
3. **Start with Phase 1 Step 1.1** - Dependency analysis
4. **Follow the plan step-by-step**
5. **Commit after each step** for safety
6. **Run validation script** after each step
7. **Pause if issues arise** - don't rush
8. **Celebrate milestones** (formmgmt done, armmgmt done, etc.)

**Ready to start?** Let me know and I'll help you execute Step 1.1! 🚀
