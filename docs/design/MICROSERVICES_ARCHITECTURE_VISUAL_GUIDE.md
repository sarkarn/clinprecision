# Microservices Architecture - Visual Guide

## Current Architecture (Problematic)

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐ │
│  │  Study Design    │  │  Data Capture    │  │    Sites     │ │
│  │    Module        │  │     Module       │  │   Module     │ │
│  ├──────────────────┤  ├──────────────────┤  ├──────────────┤ │
│  │ • Protocols      │  │ • Subjects       │  │ • Site List  │ │
│  │ • Forms          │  │ • Data Entry     │  │ • Users      │ │
│  │ • DB Build ⚡    │  │ • Validation     │  │ • Approval   │ │
│  └────────┬─────────┘  └──────────────────┘  └──────────────┘ │
│           │                                                     │
└───────────┼─────────────────────────────────────────────────────┘
            │
            │ API Call: /api/v1/study-database-builds
            │ ❌ MISMATCH! Going to wrong service!
            ▼
┌───────────────────────────────────────────────────────────────────┐
│                   API GATEWAY (Port 8080)                         │
└─────┬─────────────────────────────────┬─────────────────────┬─────┘
      │                                 │                     │
      ▼                                 ▼                     ▼
┌──────────────────┐          ┌──────────────────┐    ┌─────────────┐
│ Study Design     │          │ Data Capture     │    │   Other     │
│   Service        │          │   Service ⚡     │    │  Services   │
│  (Port 8082)     │          │  (Port 8081)     │    │             │
├──────────────────┤          ├──────────────────┤    └─────────────┘
│ • Protocols      │          │ • Subjects       │
│ • Forms          │          │ • Data Entry     │
│ • Versions       │          │ • DB Build ⚡    │  ⬅️ WRONG PLACE!
│                  │          │ • Validation     │
└──────────────────┘          └──────────────────┘
```

**Problem:** Frontend expects Study Design, but backend is in Data Capture!

---

## Recommended Architecture (Phase 1: Quick Fix)

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐ │
│  │  Study Design    │  │  Data Capture    │  │    Sites     │ │
│  │    Module        │  │     Module       │  │   Module     │ │
│  ├──────────────────┤  ├──────────────────┤  ├──────────────┤ │
│  │ • Protocols      │  │ • Subjects       │  │ • Site List  │ │
│  │ • Forms          │  │ • Data Entry     │  │ • Users      │ │
│  │ • DB Build ✅    │  │ • Validation     │  │ • Approval   │ │
│  └────────┬─────────┘  └──────────────────┘  └──────────────┘ │
│           │                                                     │
└───────────┼─────────────────────────────────────────────────────┘
            │
            │ API Call: /api/v1/study-database-builds
            │ ✅ NOW ALIGNED!
            ▼
┌───────────────────────────────────────────────────────────────────┐
│                   API GATEWAY (Port 8080)                         │
└─────┬─────────────────────────────────┬─────────────────────┬─────┘
      │                                 │                     │
      ▼                                 ▼                     ▼
┌──────────────────┐          ┌──────────────────┐    ┌─────────────┐
│ Study Design     │          │ Data Capture     │    │   Other     │
│   Service ✅     │          │   Service        │    │  Services   │
│  (Port 8082)     │          │  (Port 8081)     │    │             │
├──────────────────┤          ├──────────────────┤    └─────────────┘
│ • Protocols      │          │ • Subjects       │
│ • Forms          │          │ • Data Entry     │
│ • Versions       │          │ • Validation     │
│ • DB Build ✅    │  ⬅️ MOVED HERE!          │
└──────────────────┘          └──────────────────┘
```

**Solution 1 (Quick):** Move DB Build feature to Study Design Service  
**Timeline:** 2-3 days  
**Effort:** Medium  

---

## Ideal Architecture (Phase 2: Service Merge)

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────┐         ┌──────────────┐  │
│  │   Clinical Operations Module    │         │    Sites     │  │
│  │   (Merged: Design + Capture)    │         │   Module     │  │
│  ├─────────────────────────────────┤         ├──────────────┤  │
│  │ DESIGN:                          │         │ • Site List  │  │
│  │  • Protocols                     │         │ • Users      │  │
│  │  • Forms                         │         │ • Approval   │  │
│  │  • DB Build ✅                   │         │              │  │
│  │ OPERATIONS:                      │         │              │  │
│  │  • Subjects                      │         │              │  │
│  │  • Data Entry                    │         │              │  │
│  │  • Validation                    │         │              │  │
│  └────────┬─────────────────────────┘         └──────────────┘  │
│           │                                                      │
└───────────┼──────────────────────────────────────────────────────┘
            │
            │ API Call: /api/v1/clinical/*
            │ ✅ SINGLE SERVICE!
            ▼
┌───────────────────────────────────────────────────────────────────┐
│                   API GATEWAY (Port 8080)                         │
└─────┬─────────────────────────────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────────┐    ┌─────────────┐
│   Clinical Operations Service ✅        │    │   Other     │
│   (Merged Study Design + Data Capture)  │    │  Services   │
│            (Port 8082)                  │    │             │
├─────────────────────────────────────────┤    └─────────────┘
│ STUDY DESIGN CONTEXT:                   │
│  • Protocol Management                  │
│  • Form Builder                         │
│  • Version Management                   │
│  • Database Build ✅                    │
│                                         │
│ DATA CAPTURE CONTEXT:                   │
│  • Subject Enrollment                   │
│  • Data Entry                           │
│  • Data Validation                      │
│                                         │
│ SHARED:                                 │
│  • Event Store (clinical_events)        │
│  • Audit Trail                          │
│  • Projections                          │
└─────────────────────────────────────────┘
```

**Solution 2 (Ideal):** Merge into Clinical Operations Service  
**Timeline:** 8 weeks  
**Effort:** High  
**Benefit:** Aligns with Architecture Forecast  

---

## Domain Boundaries Comparison

### Current (Incorrect)
```
┌─────────────────────────┐  ┌─────────────────────────┐
│   Study Design Domain   │  │  Data Capture Domain    │
│                         │  │                         │
│ • Protocol Definition   │  │ • Subject Enrollment    │
│ • Form Design           │  │ • Data Entry            │
│ • Validation Rules      │  │ • Query Management      │
│                         │  │ • Database Build ❌     │ 
└─────────────────────────┘  └─────────────────────────┘
                                       │
                              ❌ Wrong Domain!
                              Database Build is about
                              implementing the design,
                              not capturing data!
```

### Recommended (Correct)
```
┌─────────────────────────┐  ┌─────────────────────────┐
│   Study Design Domain   │  │  Data Capture Domain    │
│                         │  │                         │
│ • Protocol Definition   │  │ • Subject Enrollment    │
│ • Form Design           │  │ • Data Entry            │
│ • Validation Rules      │  │ • Query Management      │
│ • Database Build ✅     │  │                         │
└─────────────────────────┘  └─────────────────────────┘
          │                            │
          └────────────┬───────────────┘
                       ▼
         ┌─────────────────────────────┐
         │ Clinical Operations Service │
         │   (Future Merged Service)   │
         └─────────────────────────────┘
```

---

## Business Process Flow

### Study Lifecycle with Database Build

```
DESIGN PHASE                      OPERATIONAL PHASE
─────────────────────────────────────────────────────
                                  
1. Define Protocol               
   │                             
   ▼                             
2. Design Forms                  
   │                             
   ▼                             
3. Define Validations            
   │                             
   ▼                             
4. ⚡ BUILD DATABASE ⚡    ←─────  THIS IS THE BRIDGE!
   │                             (Last step of design,
   │                              prerequisite for operations)
   ▼                             
5. Database Ready                ┌─────────────────┐
   │                             │  Operations     │
   ▼                             │  Begin Here     │
6. Enroll Subjects               └─────────────────┘
   │                             
   ▼                             
7. Capture Data                  
   │                             
   ▼                             
8. Validate Data                 
   │                             
   ▼                             
9. Lock Database                 
```

**Key Insight:** Database Build is the **last step of design**, not the first step of operations!

---

## Service Responsibility Matrix

| Capability | Current Owner | Should Be | Rationale |
|------------|---------------|-----------|-----------|
| Protocol Definition | Study Design ✅ | Study Design | Core design activity |
| Form Design | Study Design ✅ | Study Design | Core design activity |
| Validation Rules | Study Design ✅ | Study Design | Core design activity |
| **Database Build** | **Data Capture ❌** | **Study Design ✅** | **Implements design** |
| Subject Enrollment | Data Capture ✅ | Data Capture | Operational activity |
| Data Entry | Data Capture ✅ | Data Capture | Operational activity |
| Query Management | Data Capture ✅ | Data Capture | Operational activity |

---

## Migration Strategy

### Option A: Big Bang (Not Recommended)
```
Week 1: Stop both services
Week 2: Create new merged service
Week 3: Deploy and test
Week 4: Resume operations

❌ High risk
❌ Long downtime
❌ All-or-nothing
```

### Option B: Strangler Pattern (Recommended)
```
Phase 1: Create new service
Phase 2: Route new traffic to new service
Phase 3: Migrate existing data
Phase 4: Switch remaining traffic
Phase 5: Deprecate old services

✅ Low risk
✅ Incremental
✅ Can rollback
✅ Zero downtime
```

### Option C: Quick Fix First
```
Week 1: Move DB Build to Study Design ✅
  ↓
Later: Plan full service merge

✅ Immediate fix
✅ Low risk
✅ Sets up for future
```

---

## Summary

### The Core Issue
- **Frontend:** Expects Study Design (Correct)
- **Backend:** In Data Capture (Incorrect)
- **Architecture Forecast:** Says merge both anyway

### The Solution Path
1. **Now:** Move to Study Design Service (2-3 days)
2. **Later:** Merge into Clinical Operations Service (8 weeks)

### The Benefits
- ✅ Correct domain boundaries
- ✅ Aligned with architecture
- ✅ Reduced service count
- ✅ Better maintainability
- ✅ Future-proof

---

**Next Step:** Architectural Decision Meeting to choose path forward!
