# Microservices Organization Analysis & Recommendation
**Date:** October 2, 2025  
**Issue:** Study Database Build feature placement misalignment  
**Status:** Analysis Complete - Requires Architectural Decision

---

## Current Situation Analysis

### 🔍 The Problem

**Frontend Location:**
```
frontend/clinprecision/src/components/modules/trialdesign/database-build/
```
- Located under **Study Design module**
- Implies it's part of "Trial Design" functionality
- Navigation: Study Design → Database Builds

**Backend Location:**
```
backend/clinprecision-datacapture-service/src/main/java/.../studydatabase/
```
- Located in **Data Capture Service**
- Part of clinical data collection microservice
- API: `http://localhost:8081/api/v1/study-database-builds`

### ⚠️ The Misalignment

| Aspect | Frontend | Backend |
|--------|----------|---------|
| Module | Study Design/Trial Design | Data Capture Service |
| Purpose Implication | Design & Planning | Data Collection & Storage |
| Service Port | N/A | 8081 (datacapture) |
| Domain Context | Protocol Definition | Operational Execution |

---

## Architectural Analysis

### 📋 According to MICROSERVICES_ARCHITECTURE_FORECAST.md

The document recommends **8-service hybrid approach**:

**Recommended Service: #2 - Clinical Operations Service**
```
Merge: studydesign-service + datacapture-service
Responsibilities: Studies, protocols, forms, data collection
Event Sourcing: Study creation, protocol amendments, data entries
Database: Studies, forms, subjects + clinical_events table
```

**Key Finding:** The architecture document recommends **MERGING** Study Design and Data Capture into a single **Clinical Operations Service**!

---

## Domain Analysis: Where Does "Study Database Build" Belong?

### What is Study Database Build?

**Definition:** The process of creating/building the operational clinical database structure based on a study's protocol design.

**Characteristics:**
1. **Input:** Study protocol/design (forms, fields, validations)
2. **Process:** Database schema generation, table creation, constraint setup
3. **Output:** Operational database ready for data capture
4. **Lifecycle:** Bridge between design and operations

### Domain Classification

#### Option 1: Study Design Domain ✅ (Recommended)
**Rationale:**
- **Design Phase Activity:** Building the database is the LAST step of study design
- **Protocol Realization:** Converts abstract protocol into concrete database structure
- **Pre-Operational:** Happens BEFORE any data capture begins
- **One-Time Setup:** Per protocol version, not ongoing operation
- **Design Validation:** Validates that the protocol is implementable

**Business Context:**
```
Study Protocol → Forms Definition → Validations → DATABASE BUILD → Go-Live → Data Capture
                                                  ^
                                                  Still in Design Phase
```

#### Option 2: Data Capture Domain ❌ (Current Backend)
**Why it doesn't fit:**
- Data Capture is about **collecting clinical data**
- Requires **existing database structure**
- Ongoing operational activity
- Database Build is a **prerequisite** for Data Capture, not part of it

#### Option 3: Platform/Infrastructure Domain ❌
**Why it doesn't fit:**
- Not a generic platform capability
- Domain-specific (clinical trials)
- Business logic embedded (study-specific validations)

---

## Recommended Solution Architecture

### 🎯 Solution 1: Merge Services (Aligned with Architecture Forecast)

**Create: Clinical Operations Service**

Merge existing services:
```
clinprecision-studydesign-service  ─┐
                                     ├─→ clinprecision-clinical-operations-service
clinprecision-datacapture-service  ─┘
```

**Service Responsibilities:**
```
Clinical Operations Service (Port: 8082)
├── Study Management
│   ├── Protocol Definition
│   ├── Form Design
│   └── Study Database Build ✅ (HERE!)
├── Data Capture
│   ├── Subject Enrollment
│   ├── Data Entry
│   └── Data Validation
└── Shared
    ├── Clinical Events (Event Sourcing)
    └── Audit Trail
```

**Benefits:**
- ✅ Aligns with architecture forecast
- ✅ Single source of truth for clinical data
- ✅ Reduced inter-service communication
- ✅ Simplified deployment (1 service instead of 2)
- ✅ Natural bounded context
- ✅ Frontend/Backend alignment

**Migration Path:**
1. Create new `clinprecision-clinical-operations-service`
2. Move study design code from `studydesign-service`
3. Move data capture code from `datacapture-service` (including studydatabase)
4. Update API Gateway routing
5. Deprecate old services
6. Update frontend to use single service endpoint

---

### 🎯 Solution 2: Keep Services Separate + Move Feature

**Move Study Database Build to Study Design Service**

```
Before:
datacapture-service/studydatabase/ ─┐
                                     ├─→ studydesign-service/database-build/
Frontend: trialdesign/database-build/─┘
```

**New Structure:**
```
Backend: clinprecision-studydesign-service
  └── com/clinprecision/studydesignservice/
      ├── protocol/
      ├── forms/
      └── databasebuild/ ✅ (MOVED HERE)
          ├── domain/
          ├── entity/
          ├── controller/
          └── service/

Frontend: modules/trialdesign/database-build/ (NO CHANGE)
```

**Benefits:**
- ✅ Frontend/Backend alignment
- ✅ Logical domain placement
- ✅ Minimal frontend changes
- ✅ Clear bounded context

**Drawbacks:**
- ❌ Still maintains 2 services (against forecast)
- ❌ Migration effort required
- ❌ Potential for future confusion

---

### 🎯 Solution 3: Keep As-Is + Move Frontend

**Move Frontend to Data Capture Module**

```
Before:
Frontend: modules/trialdesign/database-build/

After:
Frontend: modules/datacapture/database-build/
```

**Benefits:**
- ✅ Quick fix (frontend only)
- ✅ Aligns with current backend
- ✅ No backend changes

**Drawbacks:**
- ❌ Wrong domain placement
- ❌ Conceptually incorrect
- ❌ Against architecture forecast
- ❌ Users expect it in Study Design

---

## Comparative Analysis

| Solution | Frontend Changes | Backend Changes | Alignment | Complexity | Future-Proof |
|----------|------------------|-----------------|-----------|------------|--------------|
| **1. Merge Services** | Medium (API endpoints) | High (Service merge) | ✅ Perfect | High | ✅ Best |
| **2. Move to Study Design** | None | High (Feature move) | ✅ Good | Medium | ⚠️ Okay |
| **3. Move Frontend** | Low | None | ❌ Poor | Low | ❌ Bad |

---

## Final Recommendation

### 🏆 **Solution 1: Merge Services into Clinical Operations Service**

**Why:**
1. ✅ **Aligned with Architecture Forecast:** Document explicitly recommends this merge
2. ✅ **Correct Domain Boundaries:** Study Design + Data Capture = Clinical Operations
3. ✅ **Future-Proof:** Reduces services from 7 to 6 (more maintainable)
4. ✅ **Better Cohesion:** Related features together
5. ✅ **Simpler Inter-Service Communication:** No need for service-to-service calls
6. ✅ **Event Sourcing Ready:** Single service for all clinical events

**Timeline:**
- **Week 1-2:** Create new service structure, move shared code
- **Week 3-4:** Move study design features
- **Week 5-6:** Move data capture features (including database build)
- **Week 7:** Update API Gateway, frontend configs
- **Week 8:** Testing, gradual cutover
- **Week 9:** Deprecate old services

### 📋 Interim Solution (If Full Merge Not Feasible Now)

**Quick Fix: Move Backend Feature to Study Design Service**
- Move `studydatabase` package to `studydesign-service`
- Update API endpoints
- No frontend changes needed
- Can be done in **2-3 days**
- Still sets up for future service merge

---

## Implementation Plan

### Phase 1: Quick Win (2-3 days)
```
1. Copy studydatabase package to studydesign-service
2. Update StudyDesignServiceApplication to scan new packages
3. Update API Gateway routes
4. Update frontend API base URL
5. Test and verify
6. Remove from datacapture-service
```

### Phase 2: Full Service Merge (8 weeks)
```
1. Create clinprecision-clinical-operations-service
   - Spring Boot setup
   - Axon Framework configuration
   - Database configuration (unified schema)

2. Migrate Study Design Features
   - Protocol management
   - Form builder
   - Version management
   - Database build ✅

3. Migrate Data Capture Features
   - Subject enrollment
   - Data entry
   - Validation

4. Unified Event Sourcing
   - clinical_events table
   - Event handlers
   - Projections

5. API Gateway Update
   - Route consolidation
   - Service discovery update

6. Frontend Updates
   - API endpoint updates
   - Service configuration

7. Testing & Cutover
   - Integration testing
   - Load testing
   - Gradual rollout

8. Cleanup
   - Remove old services
   - Update documentation
```

---

## Decision Matrix

### For Small Team (< 10 developers):
**✅ Choose: Full Service Merge (Solution 1)**
- Reduces maintenance burden
- Easier to manage
- Better for small teams

### For Large Team (> 10 developers):
**⚠️ Consider: Keep Separate + Move Feature (Solution 2)**
- Team can handle multiple services
- Clear ownership boundaries
- But still plan for future merge

---

## Action Items

### Immediate (This Sprint):
1. [ ] **Architectural Decision:** Team meeting to choose solution
2. [ ] **Create ADR:** Document the decision
3. [ ] **Update Roadmap:** Add implementation timeline

### Short Term (Next Sprint):
1. [ ] **If Quick Fix:** Move studydatabase to studydesign-service
2. [ ] **Update Documentation:** Reflect new structure
3. [ ] **Update API Docs:** Swagger/OpenAPI changes

### Long Term (Next Quarter):
1. [ ] **Service Merge:** Implement Clinical Operations Service
2. [ ] **Event Sourcing:** Unified clinical events
3. [ ] **Documentation Update:** Architecture diagrams

---

## Conclusion

**Current State:**
- ❌ Frontend in Study Design, Backend in Data Capture (MISALIGNED)
- ❌ Against architecture forecast

**Recommended State:**
- ✅ Single Clinical Operations Service
- ✅ Study Database Build in Study Design context
- ✅ Aligned with architecture forecast
- ✅ Maintainable and scalable

**The Question:** Should we implement the interim quick fix now and plan for full merge later, or commit to the full service merge immediately?

**My Recommendation:** 
1. **Now:** Quick fix - Move to Study Design Service (2-3 days)
2. **Q1 2026:** Full merge into Clinical Operations Service (8 weeks)

This gives you immediate alignment while planning for the ideal architecture.

---

**Decision Required By:** Product Owner + Technical Lead  
**Impact:** High - Affects service architecture  
**Risk:** Low (with proper planning)  
**Effort:** Medium (Quick fix) / High (Full merge)
