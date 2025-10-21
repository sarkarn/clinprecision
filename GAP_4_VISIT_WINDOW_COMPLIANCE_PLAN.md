# Gap #4: Visit Window Compliance - Implementation Plan 📅

**Date**: October 21, 2025  
**Priority**: ⭐⭐⭐⭐⭐ **CRITICAL** - FDA/EMA Regulatory Requirement  
**Estimated Duration**: 4 hours  
**Impact**: Prevents protocol violations, ensures study integrity

---

## 🎯 **BUSINESS REQUIREMENT**

### **Problem**:
Clinical trials have strict protocol requirements for visit timing:
- **Protocol**: "Baseline visit must occur within ±3 days of enrollment"
- **Reality**: CRC schedules visit for Oct 25, but patient comes Oct 30 (5 days late)
- **Result**: ❌ **Protocol violation** - visit out of window, data may be invalid

### **Current State** ❌:
- ❌ No visit window tracking
- ❌ No overdue visit alerts
- ❌ CRCs don't know when visits are late
- ❌ No compliance reporting
- ❌ Protocol violations discovered during monitoring visits (too late)

### **Desired State** ✅:
- ✅ Visit windows calculated from protocol timepoints
- ✅ Visits color-coded: green (on time), yellow (near deadline), red (overdue)
- ✅ Daily email alerts for approaching/overdue visits
- ✅ Compliance dashboard showing all overdue visits
- ✅ Prevents protocol violations BEFORE they happen

---

## 📋 **TECHNICAL REQUIREMENTS**

### **Phase 1: Database Schema** (30 minutes)

#### **Add Visit Window Columns**:
```sql
ALTER TABLE study_visit_instances 
ADD COLUMN visit_window_start DATE NULL COMMENT 'Earliest acceptable visit date (calculated from protocol)',
ADD COLUMN visit_window_end DATE NULL COMMENT 'Latest acceptable visit date (calculated from protocol)',
ADD COLUMN window_days_before INT NULL COMMENT 'Days before target date (from protocol)',
ADD COLUMN window_days_after INT NULL COMMENT 'Days after target date (from protocol)',
ADD COLUMN compliance_status VARCHAR(50) NULL COMMENT 'ON_TIME, APPROACHING_DEADLINE, OVERDUE, MISSED, OUT_OF_WINDOW';
```

#### **Compliance Status Values**:
- `ON_TIME`: Visit completed within window
- `APPROACHING_DEADLINE`: Visit not completed, < 2 days until window closes
- `OVERDUE`: Past window end date, not yet completed
- `MISSED`: Past window end date + grace period, marked as missed
- `OUT_OF_WINDOW`: Visit completed outside allowed window (protocol violation)

---

### **Phase 2: Backend - Window Calculation** (1.5 hours)

#### **1. Update ProtocolVisitInstantiationService** (45 minutes)

**File**: `ProtocolVisitInstantiationService.java`

**New Method**: `calculateVisitWindow()`
```java
/**
 * Calculate visit window from protocol timepoint and window offset
 * 
 * Example:
 *   Target Date: Oct 20, 2025 (enrollment date + 14 days)
 *   Window: ±3 days
 *   Result: window_start = Oct 17, window_end = Oct 23
 */
private void calculateVisitWindow(StudyVisitInstanceEntity visitInstance, VisitDefinition visitDef) {
    // Get reference date (enrollment date, screening date, or previous visit date)
    LocalDate referenceDate = getReferenceDate(visitInstance);
    
    // Get timepoint offset from protocol (e.g., "Day 14" = 14 days after enrollment)
    int timepointDays = visitDef.getTimepointDays();
    
    // Calculate target date
    LocalDate targetDate = referenceDate.plusDays(timepointDays);
    
    // Get window offset from protocol (e.g., ±3 days)
    int windowBefore = visitDef.getWindowDaysBefore(); // 3
    int windowAfter = visitDef.getWindowDaysAfter();   // 3
    
    // Calculate window boundaries
    LocalDate windowStart = targetDate.minusDays(windowBefore);
    LocalDate windowEnd = targetDate.plusDays(windowAfter);
    
    // Set fields
    visitInstance.setVisitWindowStart(windowStart);
    visitInstance.setVisitWindowEnd(windowEnd);
    visitInstance.setWindowDaysBefore(windowBefore);
    visitInstance.setWindowDaysAfter(windowAfter);
    
    // Initial compliance status
    visitInstance.setComplianceStatus("SCHEDULED");
}
```

**Logic Flow**:
```
1. Subject enrolled: Oct 10, 2025
2. Protocol says: "Baseline visit at Day 7 (±3 days)"
3. Calculate:
   - Reference date: Oct 10 (enrollment)
   - Timepoint offset: +7 days
   - Target date: Oct 17
   - Window: ±3 days
   - Window start: Oct 14
   - Window end: Oct 20
4. Result: Visit must occur between Oct 14-20
```

---

#### **2. Create ComplianceStatusCalculator** (30 minutes)

**New Service**: `VisitComplianceService.java`

```java
@Service
@Slf4j
public class VisitComplianceService {
    
    /**
     * Calculate compliance status for a visit
     * 
     * @param visit Visit instance
     * @return ComplianceStatus enum
     */
    public String calculateComplianceStatus(StudyVisitInstanceEntity visit) {
        LocalDate today = LocalDate.now();
        LocalDate windowStart = visit.getVisitWindowStart();
        LocalDate windowEnd = visit.getVisitWindowEnd();
        LocalDate actualDate = visit.getActualVisitDate();
        String visitStatus = visit.getVisitStatus();
        
        // Visit already completed
        if ("COMPLETED".equals(visitStatus)) {
            if (actualDate == null) {
                log.warn("Visit {} marked COMPLETED but no actual_visit_date", visit.getId());
                return "UNKNOWN";
            }
            
            // Check if completed within window
            if (actualDate.isBefore(windowStart)) {
                return "OUT_OF_WINDOW_EARLY";
            } else if (actualDate.isAfter(windowEnd)) {
                return "OUT_OF_WINDOW_LATE";
            } else {
                return "ON_TIME";
            }
        }
        
        // Visit not yet completed - check if overdue
        if (today.isAfter(windowEnd)) {
            // Past window end date
            long daysOverdue = ChronoUnit.DAYS.between(windowEnd, today);
            
            if (daysOverdue > 7) {
                return "MISSED"; // More than 7 days overdue = missed visit
            } else {
                return "OVERDUE"; // 1-7 days overdue
            }
        }
        
        // Visit approaching deadline
        long daysUntilDeadline = ChronoUnit.DAYS.between(today, windowEnd);
        if (daysUntilDeadline <= 2) {
            return "APPROACHING_DEADLINE"; // Less than 2 days until window closes
        }
        
        // Visit scheduled within window
        if (today.isAfter(windowStart) || today.isEqual(windowStart)) {
            return "WINDOW_OPEN"; // Window is currently open
        }
        
        // Visit scheduled, window not yet open
        return "SCHEDULED";
    }
    
    /**
     * Get days overdue (negative = days remaining)
     * 
     * @param visit Visit instance
     * @return Days overdue (positive) or days remaining (negative)
     */
    public long getDaysOverdue(StudyVisitInstanceEntity visit) {
        if (visit.getVisitWindowEnd() == null) {
            return 0;
        }
        
        LocalDate today = LocalDate.now();
        return ChronoUnit.DAYS.between(visit.getVisitWindowEnd(), today);
    }
}
```

---

#### **3. Update VisitDto** (15 minutes)

**File**: `VisitDto.java`

**Add Window Fields**:
```java
// Visit window tracking
private LocalDate visitWindowStart;      // Earliest acceptable date
private LocalDate visitWindowEnd;        // Latest acceptable date
private Integer windowDaysBefore;        // Days before target (from protocol)
private Integer windowDaysAfter;         // Days after target (from protocol)
private String complianceStatus;         // ON_TIME, OVERDUE, MISSED, etc.
private Long daysOverdue;                // Days past window end (null if not overdue)
private LocalDate actualVisitDate;       // Actual date visit occurred

// Getters/setters...
```

---

### **Phase 3: Frontend - Compliance Indicators** (1 hour)

#### **1. Update SubjectDetails.jsx** (30 minutes)

**Add Window Display**:
```jsx
<td className="px-4 py-3">
    {/* Visit Window */}
    <div className="text-sm">
        <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">
                {formatDate(visit.visitWindowStart)} - {formatDate(visit.visitWindowEnd)}
            </span>
            {visit.windowDaysBefore && (
                <span className="text-xs text-gray-500">
                    (±{visit.windowDaysBefore} days)
                </span>
            )}
        </div>
        
        {/* Compliance Badge */}
        {visit.complianceStatus && (
            <div className="mt-1">
                {renderComplianceBadge(visit.complianceStatus, visit.daysOverdue)}
            </div>
        )}
    </div>
</td>
```

**Compliance Badge Component**:
```jsx
const renderComplianceBadge = (status, daysOverdue) => {
    const badges = {
        'ON_TIME': {
            color: 'bg-green-100 text-green-800',
            icon: '✓',
            text: 'Completed On Time'
        },
        'WINDOW_OPEN': {
            color: 'bg-blue-100 text-blue-800',
            icon: '📅',
            text: 'Window Open'
        },
        'APPROACHING_DEADLINE': {
            color: 'bg-yellow-100 text-yellow-800',
            icon: '⚠️',
            text: `Due in ${Math.abs(daysOverdue)} days`
        },
        'OVERDUE': {
            color: 'bg-orange-100 text-orange-800',
            icon: '⏰',
            text: `${daysOverdue} days overdue`
        },
        'MISSED': {
            color: 'bg-red-100 text-red-800',
            icon: '❌',
            text: `Missed (${daysOverdue} days late)`
        },
        'OUT_OF_WINDOW_EARLY': {
            color: 'bg-purple-100 text-purple-800',
            icon: '⚡',
            text: 'Completed Early (Out of Window)'
        },
        'OUT_OF_WINDOW_LATE': {
            color: 'bg-red-100 text-red-800',
            icon: '🚨',
            text: 'Protocol Violation (Out of Window)'
        }
    };
    
    const badge = badges[status] || badges['WINDOW_OPEN'];
    
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
            <span>{badge.icon}</span>
            <span>{badge.text}</span>
        </span>
    );
};
```

**Color-Coded Visit Rows**:
```jsx
<tr className={`
    ${visit.complianceStatus === 'OVERDUE' ? 'bg-orange-50' : ''}
    ${visit.complianceStatus === 'MISSED' ? 'bg-red-50' : ''}
    ${visit.complianceStatus === 'APPROACHING_DEADLINE' ? 'bg-yellow-50' : ''}
    hover:bg-gray-50 transition-colors
`}>
    {/* Visit data... */}
</tr>
```

---

#### **2. Add Overdue Visits Filter** (15 minutes)

```jsx
const [showOnlyOverdue, setShowOnlyOverdue] = useState(false);

// Filter visits
const filteredVisits = visits.filter(visit => {
    if (showOnlyOverdue) {
        return ['OVERDUE', 'MISSED'].includes(visit.complianceStatus);
    }
    return true;
});

// Overdue count badge
const overdueCount = visits.filter(v => 
    ['OVERDUE', 'MISSED'].includes(v.complianceStatus)
).length;

return (
    <div className="mb-4">
        <button 
            onClick={() => setShowOnlyOverdue(!showOnlyOverdue)}
            className={`px-4 py-2 rounded ${showOnlyOverdue ? 'bg-orange-600 text-white' : 'bg-gray-100'}`}
        >
            <span>⚠️ Overdue Visits</span>
            {overdueCount > 0 && (
                <span className="ml-2 bg-red-600 text-white px-2 py-1 rounded-full text-xs">
                    {overdueCount}
                </span>
            )}
        </button>
    </div>
);
```

---

#### **3. Update VisitDetails.jsx** (15 minutes)

**Add Window Information Panel**:
```jsx
{/* Visit Window Information */}
<div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
    <h3 className="text-sm font-semibold text-blue-900 mb-3">
        📅 Visit Window Information
    </h3>
    
    <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
            <p className="text-gray-600 mb-1">Window Start</p>
            <p className="font-medium">{formatDate(visitDetails.visitWindowStart)}</p>
        </div>
        
        <div>
            <p className="text-gray-600 mb-1">Window End</p>
            <p className="font-medium">{formatDate(visitDetails.visitWindowEnd)}</p>
        </div>
        
        <div>
            <p className="text-gray-600 mb-1">Allowed Range</p>
            <p className="font-medium">
                ±{visitDetails.windowDaysBefore} days 
                ({visitDetails.visitWindowEnd - visitDetails.visitWindowStart + 1} day window)
            </p>
        </div>
        
        <div>
            <p className="text-gray-600 mb-1">Compliance Status</p>
            {renderComplianceBadge(visitDetails.complianceStatus, visitDetails.daysOverdue)}
        </div>
    </div>
    
    {/* Overdue Warning */}
    {visitDetails.complianceStatus === 'OVERDUE' && (
        <div className="mt-4 bg-orange-100 border border-orange-300 rounded p-3">
            <p className="text-sm text-orange-800">
                ⚠️ <strong>Warning:</strong> This visit is {visitDetails.daysOverdue} days overdue. 
                Please complete as soon as possible to avoid protocol violation.
            </p>
        </div>
    )}
    
    {/* Protocol Violation Warning */}
    {visitDetails.complianceStatus?.includes('OUT_OF_WINDOW') && (
        <div className="mt-4 bg-red-100 border border-red-300 rounded p-3">
            <p className="text-sm text-red-800">
                🚨 <strong>Protocol Violation:</strong> This visit was completed outside the allowed window. 
                A deviation report may be required.
            </p>
        </div>
    )}
</div>
```

---

### **Phase 4: Backend - Compliance Alerts** (1 hour)

#### **1. Create ComplianceAlertService** (30 minutes)

**New Service**: `VisitComplianceAlertService.java`

```java
@Service
@Slf4j
@RequiredArgsConstructor
public class VisitComplianceAlertService {
    
    private final StudyVisitInstanceRepository visitRepository;
    private final VisitComplianceService complianceService;
    private final EmailService emailService;
    
    /**
     * Daily cron job to check for overdue visits
     * Runs at 8:00 AM every day
     */
    @Scheduled(cron = "0 0 8 * * *")
    public void checkOverdueVisits() {
        log.info("Running daily overdue visit check...");
        
        // Get all active visits (not COMPLETED, not CANCELLED)
        List<StudyVisitInstanceEntity> activeVisits = visitRepository
            .findByVisitStatusNotIn(Arrays.asList("COMPLETED", "CANCELLED", "MISSED"));
        
        int alertsSent = 0;
        
        for (StudyVisitInstanceEntity visit : activeVisits) {
            // Recalculate compliance status
            String complianceStatus = complianceService.calculateComplianceStatus(visit);
            
            // Update in database
            visit.setComplianceStatus(complianceStatus);
            visitRepository.save(visit);
            
            // Send alert if overdue or approaching deadline
            if ("OVERDUE".equals(complianceStatus) || "APPROACHING_DEADLINE".equals(complianceStatus)) {
                sendComplianceAlert(visit, complianceStatus);
                alertsSent++;
            }
        }
        
        log.info("Overdue visit check complete. {} alerts sent.", alertsSent);
    }
    
    /**
     * Send email alert for overdue/approaching visits
     */
    private void sendComplianceAlert(StudyVisitInstanceEntity visit, String status) {
        try {
            // Get CRC email from site/user table
            String crcEmail = getCrcEmail(visit.getSiteId());
            
            String subject = status.equals("OVERDUE") 
                ? "⚠️ Overdue Visit Alert" 
                : "📅 Visit Approaching Deadline";
            
            String body = buildAlertEmail(visit, status);
            
            emailService.sendEmail(crcEmail, subject, body);
            
            log.info("Compliance alert sent for visit {} to {}", visit.getId(), crcEmail);
            
        } catch (Exception e) {
            log.error("Failed to send compliance alert for visit {}", visit.getId(), e);
        }
    }
    
    /**
     * Build alert email body
     */
    private String buildAlertEmail(StudyVisitInstanceEntity visit, String status) {
        long daysOverdue = complianceService.getDaysOverdue(visit);
        
        return String.format("""
            %s Visit Alert
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            
            Subject: %s
            Visit: %s
            
            Window: %s to %s
            Status: %s
            %s
            
            Please complete this visit as soon as possible to avoid protocol violations.
            
            Login to ClinPrecision to schedule/complete this visit.
            
            —
            ClinPrecision Automated Alert System
            """,
            status.equals("OVERDUE") ? "⚠️" : "📅",
            visit.getSubjectId(),
            getVisitName(visit.getVisitId()),
            visit.getVisitWindowStart(),
            visit.getVisitWindowEnd(),
            status,
            daysOverdue > 0 
                ? String.format("Days Overdue: %d", daysOverdue)
                : String.format("Days Remaining: %d", Math.abs(daysOverdue))
        );
    }
}
```

---

#### **2. Create Compliance Report Endpoint** (30 minutes)

**Controller**: `VisitComplianceController.java`

```java
@RestController
@RequestMapping("/api/v1/compliance")
@RequiredArgsConstructor
@Slf4j
public class VisitComplianceController {
    
    private final StudyVisitInstanceRepository visitRepository;
    private final VisitComplianceService complianceService;
    
    /**
     * Get overdue visits for a study
     * 
     * GET /api/v1/compliance/overdue?studyId=123
     */
    @GetMapping("/overdue")
    public ResponseEntity<List<VisitDto>> getOverdueVisits(
            @RequestParam Long studyId) {
        
        log.info("Fetching overdue visits for study: {}", studyId);
        
        List<StudyVisitInstanceEntity> visits = visitRepository
            .findByStudyIdAndComplianceStatusIn(
                studyId, 
                Arrays.asList("OVERDUE", "MISSED")
            );
        
        // Map to DTO
        List<VisitDto> overdueVisits = visits.stream()
            .map(this::mapToDto)
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(overdueVisits);
    }
    
    /**
     * Get compliance summary for a study
     * 
     * GET /api/v1/compliance/summary?studyId=123
     */
    @GetMapping("/summary")
    public ResponseEntity<ComplianceSummaryDto> getComplianceSummary(
            @RequestParam Long studyId) {
        
        log.info("Fetching compliance summary for study: {}", studyId);
        
        List<StudyVisitInstanceEntity> allVisits = visitRepository.findByStudyId(studyId);
        
        ComplianceSummaryDto summary = new ComplianceSummaryDto();
        summary.setTotalVisits(allVisits.size());
        summary.setOnTime(countByStatus(allVisits, "ON_TIME"));
        summary.setOverdue(countByStatus(allVisits, "OVERDUE"));
        summary.setMissed(countByStatus(allVisits, "MISSED"));
        summary.setOutOfWindow(countByStatus(allVisits, "OUT_OF_WINDOW_LATE", "OUT_OF_WINDOW_EARLY"));
        summary.setComplianceRate(calculateComplianceRate(allVisits));
        
        return ResponseEntity.ok(summary);
    }
}
```

---

## 📊 **UI MOCKUPS**

### **SubjectDetails Page - Visit List**:
```
┌───────────────┬─────────────┬──────────────────────────────┬──────────────┬─────────────┐
│ Visit Name    │ Date        │ Window & Compliance          │ Progress     │ Actions     │
├───────────────┼─────────────┼──────────────────────────────┼──────────────┼─────────────┤
│ Screening     │ Oct 10,2025 │ Oct 10-10 (same day)         │ [████] 100%  │ View        │
│               │             │ ✓ Completed On Time          │              │             │
├───────────────┼─────────────┼──────────────────────────────┼──────────────┼─────────────┤
│ Baseline      │ Oct 17,2025 │ Oct 14-20 (±3 days)          │ [████] 100%  │ View        │
│               │             │ ✓ Completed On Time          │              │             │
├───────────────┼─────────────┼──────────────────────────────┼──────────────┼─────────────┤
│ Week 2        │ Oct 24,2025 │ Oct 21-27 (±3 days)          │ [░░░░]   0%  │ Start Visit │
│               │             │ 📅 Window Open (3 days left) │              │             │
├───────────────┼─────────────┼──────────────────────────────┼──────────────┼─────────────┤
│ Week 4        │ Nov 7, 2025 │ Nov 4-10 (±3 days)           │ [░░░░]   0%  │ Not Due Yet │
│               │             │ 📆 Scheduled (14 days away)  │              │             │
├───────────────┼─────────────┼──────────────────────────────┼──────────────┼─────────────┤
│ Month 3       │ Dec 10,2025 │ Dec 7-13 (±3 days)           │ [██░░]  50%  │ Continue    │
│ (OVERDUE)     │             │ ⚠️ 5 days overdue            │              │             │
└───────────────┴─────────────┴──────────────────────────────┴──────────────┴─────────────┘
                                        ↑ Row highlighted in orange
```

---

## ✅ **IMPLEMENTATION CHECKLIST**

### **Phase 1: Database** ☐
- [ ] Create SQL migration file (add window columns)
- [ ] Test migration on dev database
- [ ] Verify columns added correctly

### **Phase 2: Backend** ☐
- [ ] Add window fields to StudyVisitInstanceEntity
- [ ] Add window fields to VisitDto
- [ ] Update ProtocolVisitInstantiationService.calculateVisitWindow()
- [ ] Create VisitComplianceService.calculateComplianceStatus()
- [ ] Update PatientVisitService.mapToVisitDto() to include window data
- [ ] Test window calculation logic
- [ ] Build and verify no compilation errors

### **Phase 3: Frontend** ☐
- [ ] Update SubjectDetails.jsx to display window dates
- [ ] Add renderComplianceBadge() function
- [ ] Add color-coding for overdue visits
- [ ] Add "Show Overdue Only" filter
- [ ] Update VisitDetails.jsx with window information panel
- [ ] Test UI rendering

### **Phase 4: Alerts (Optional for MVP)** ☐
- [ ] Create VisitComplianceAlertService
- [ ] Add @Scheduled cron job for daily checks
- [ ] Implement email alert logic
- [ ] Create ComplianceController for reporting endpoints
- [ ] Test alert sending

---

## 🎯 **SUCCESS CRITERIA**

After implementation, verify:

1. ✅ Visit windows calculated correctly when visits instantiated
2. ✅ Window dates displayed in SubjectDetails visit list
3. ✅ Compliance badges show correct status and colors
4. ✅ Overdue visits highlighted in orange/red
5. ✅ "Show Overdue Only" filter works
6. ✅ VisitDetails shows window information panel
7. ✅ Protocol violation warnings display for out-of-window visits
8. ✅ Compliance status updates when visit completed

---

## 📈 **EXPECTED IMPACT**

### **Clinical Operations**:
- ✅ **Proactive Monitoring**: CRCs see upcoming deadlines at a glance
- ✅ **Protocol Compliance**: Prevent violations before they happen
- ✅ **Time Savings**: No manual tracking of visit windows in spreadsheets
- ✅ **Quality Improvement**: Reduce protocol deviations by 70%

### **Regulatory Compliance**:
- ✅ **FDA 21 CFR Part 11**: Audit trail of visit timing
- ✅ **ICH-GCP Compliance**: Protocol adherence documentation
- ✅ **Monitoring Visit Readiness**: Clear compliance dashboard

### **Metrics**:
- **Protocol Deviations**: ↓ 70% reduction
- **Overdue Visits**: ↓ 50% reduction (through proactive alerts)
- **CRC Productivity**: ↑ 2 hours/week saved (no manual tracking)

---

## 🚀 **DEPLOYMENT STEPS**

1. ✅ **Database Migration**: Run SQL migration to add window columns
2. ✅ **Backend Deploy**: Deploy updated PatientVisitService + ComplianceService
3. ✅ **Frontend Deploy**: Deploy updated SubjectDetails + VisitDetails components
4. ✅ **Data Migration**: Run one-time script to calculate windows for existing visits
5. ✅ **Testing**: Verify window calculation for all visit types
6. ✅ **Training**: Educate CRCs on new compliance indicators
7. ✅ **Monitoring**: Track alert sending and compliance improvements

---

## 📝 **NEXT STEPS AFTER COMPLETION**

**Follow-up Enhancements** (Future):
1. ⏳ SMS alerts for overdue visits (in addition to email)
2. ⏳ Mobile app push notifications
3. ⏳ Compliance dashboard with charts/graphs
4. ⏳ Predictive analytics: "80% likely to miss window based on historical data"
5. ⏳ Auto-rescheduling suggestions: "Move to earlier date to stay in window"

---

**Ready to implement? Let's start with Phase 1: Database Schema!** 🚀

---

**END OF DOCUMENT**
